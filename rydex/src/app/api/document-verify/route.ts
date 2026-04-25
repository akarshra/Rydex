import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import VehicleDocument from "@/models/vehicleDocument.model";

/**
 * Phase 4.1: AI Document Verification
 * 
 * This endpoint accepts a base64-encoded document image and performs
 * OCR-based verification using Google Cloud Vision API.
 * 
 * For now, it implements a mock verification pipeline that:
 * 1. Checks document type (Aadhaar/DL/RC)
 * 2. Validates required fields via regex patterns
 * 3. Returns confidence score and auto-approval recommendation
 * 
 * In production, replace with actual Google Cloud Vision or AWS Textract calls.
 */

interface VerificationResult {
  documentType: "aadhaar" | "driving_license" | "vehicle_rc" | "unknown";
  isValid: boolean;
  confidence: number;
  extractedFields: Record<string, string>;
  warnings: string[];
  autoApprove: boolean;
}

function detectDocumentType(text: string): VerificationResult["documentType"] {
  const lower = text.toLowerCase();
  if (lower.includes("aadhaar") || /\d{4}\s\d{4}\s\d{4}/.test(text)) return "aadhaar";
  if (lower.includes("driving") || lower.includes("licence") || lower.includes("license") || /[A-Z]{2}\d{2}\s?\d{11}/.test(text)) return "driving_license";
  if (lower.includes("registration") || lower.includes("rc") || /[A-Z]{2}\d{2}[A-Z]{2}\d{4}/.test(text)) return "vehicle_rc";
  return "unknown";
}

function verifyAadhaar(text: string): { isValid: boolean; fields: Record<string, string>; warnings: string[] } {
  const warnings: string[] = [];
  const fields: Record<string, string> = {};

  // Extract Aadhaar number
  const aadhaarMatch = text.match(/(\d{4}\s\d{4}\s\d{4})/);
  if (aadhaarMatch) fields.aadhaarNumber = aadhaarMatch[1];
  else warnings.push("Aadhaar number not clearly visible");

  // Check for name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const nameLine = lines.find((l) => /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(l) && !l.includes("Aadhaar") && !l.includes("Government"));
  if (nameLine) fields.name = nameLine;
  else warnings.push("Name not clearly extracted");

  // Check for DOB/Year of Birth
  const yobMatch = text.match(/(\d{4})/g);
  if (yobMatch) {
    const year = parseInt(yobMatch.find((y) => parseInt(y) > 1940 && parseInt(y) < 2010) || "0");
    if (year) fields.yearOfBirth = String(year);
    else warnings.push("Year of birth not found");
  }

  const isValid = warnings.length <= 1 && !!fields.aadhaarNumber;
  return { isValid, fields, warnings };
}

function verifyDL(text: string): { isValid: boolean; fields: Record<string, string>; warnings: string[] } {
  const warnings: string[] = [];
  const fields: Record<string, string> = {};

  // DL Number pattern: MH02 20240001234
  const dlMatch = text.match(/([A-Z]{2}\d{2}\s?\d{11})/);
  if (dlMatch) fields.dlNumber = dlMatch[1];
  else warnings.push("DL number not found");

  // Name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const nameLine = lines.find((l) => /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(l) && l.length < 40);
  if (nameLine) fields.name = nameLine;
  else warnings.push("Name not clearly extracted");

  // Validity dates
  const dateMatches = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/g);
  if (dateMatches && dateMatches.length >= 2) {
    fields.validFrom = dateMatches[0];
    fields.validUntil = dateMatches[1];
  } else {
    warnings.push("Validity dates not found");
  }

  const isValid = warnings.length <= 1 && !!fields.dlNumber;
  return { isValid, fields, warnings };
}

function verifyRC(text: string): { isValid: boolean; fields: Record<string, string>; warnings: string[] } {
  const warnings: string[] = [];
  const fields: Record<string, string> = {};

  // Registration number
  const regMatch = text.match(/([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})/);
  if (regMatch) fields.registrationNumber = regMatch[1];
  else warnings.push("Registration number not found");

  // Chassis number (17 chars)
  const chassisMatch = text.match(/([A-HJ-NPR-Z0-9]{17})/);
  if (chassisMatch) fields.chassisNumber = chassisMatch[1];
  else warnings.push("Chassis number not clearly visible");

  // Engine number
  const engineMatch = text.match(/(Engine\s*(No|Number)?:?\s*([A-Z0-9]{6,12}))/i);
  if (engineMatch) fields.engineNumber = engineMatch[3];
  else warnings.push("Engine number not found");

  const isValid = warnings.length <= 2 && !!fields.registrationNumber;
  return { isValid, fields, warnings };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, ocrText, documentImageBase64 } = await req.json();

    if (!ocrText && !documentImageBase64) {
      return NextResponse.json({ error: "OCR text or image required" }, { status: 400 });
    }

    await connectDb();

    // In production, send documentImageBase64 to Google Cloud Vision here:
    // const visionResponse = await fetch('https://vision.googleapis.com/v1/images:annotate?key=...', ...)
    // const extractedText = visionResponse.textAnnotations[0].description;

    const textToVerify = ocrText || "";
    const docType = detectDocumentType(textToVerify);

    if (docType === "unknown") {
      return NextResponse.json({
        success: false,
        verification: {
          documentType: "unknown",
          isValid: false,
          confidence: 0,
          extractedFields: {},
          warnings: ["Could not identify document type"],
          autoApprove: false,
        } as VerificationResult,
      });
    }

    let verificationDetails;
    switch (docType) {
      case "aadhaar":
        verificationDetails = verifyAadhaar(textToVerify);
        break;
      case "driving_license":
        verificationDetails = verifyDL(textToVerify);
        break;
      case "vehicle_rc":
        verificationDetails = verifyRC(textToVerify);
        break;
    }

    const confidence = Math.max(0, 1 - verificationDetails.warnings.length * 0.25);
    const autoApprove = verificationDetails.isValid && confidence >= 0.75;

    const result: VerificationResult = {
      documentType: docType,
      isValid: verificationDetails.isValid,
      confidence,
      extractedFields: verificationDetails.fields,
      warnings: verificationDetails.warnings,
      autoApprove,
    };

    // Update document record if documentId provided
    if (documentId) {
      await VehicleDocument.findByIdAndUpdate(documentId, {
        $set: {
          ocrData: result.extractedFields,
          verificationStatus: autoApprove ? "verified" : "pending_review",
          verificationConfidence: confidence,
          verifiedAt: autoApprove ? new Date() : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, verification: result });
  } catch (error) {
    console.error("Document verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

