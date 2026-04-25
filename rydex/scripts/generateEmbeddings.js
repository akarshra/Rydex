const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const faqs = [
  {
    category: "General",
    question: "What is Rydex?",
    answer: "Rydex is a premium ride-sharing platform that connects riders with verified drivers across various vehicle types including bikes, autos, cars, and loading trucks."
  },
  {
    category: "Booking",
    question: "How do I book a ride?",
    answer: "You can book a ride by opening the app, entering your pickup and drop-off locations, selecting your preferred vehicle type, and confirming the ride."
  },
  {
    category: "Pricing & Payments",
    question: "How is the fare calculated?",
    answer: "Fares are calculated based on the base rate of the vehicle type, distance to be traveled, and current demand (surge pricing may apply during peak hours)."
  },
  {
    category: "Pricing & Payments",
    question: "What payment methods are accepted?",
    answer: "Rydex accepts Cash, Credit/Debit Cards, UPI, and Digital Wallets. You can manage your saved payment methods in your User Profile."
  },
  {
    category: "Safety",
    question: "What happens if I have an emergency during a ride?",
    answer: "Rydex features an in-app Emergency SOS button on the active ride screen. You can tap this to immediately trigger an alert for Medical, Accident, or Security emergencies, which notifies our 24/7 support team and your emergency contacts."
  },
  {
    category: "Safety",
    question: "Is there ride insurance?",
    answer: "Yes, you can opt-in for Basic or Premium Ride Insurance during checkout to cover accidents, medical expenses, and loss of baggage during your ride."
  },
  {
    category: "Cancellations",
    question: "What is the cancellation policy?",
    answer: "You can cancel a ride without penalty within 3 minutes of the driver accepting it. After that, a small cancellation fee may be applied to compensate the driver's time."
  },
  {
    category: "Vendors/Drivers",
    question: "How do I become a Rydex driver?",
    answer: "You can apply to be a driver by clicking 'Become a Partner' in your profile menu, submitting your KYC documents (Aadhaar, DL, RC), and completing a background check."
  },
  {
    category: "Vendors/Drivers",
    question: "When do drivers get paid?",
    answer: "Drivers receive cash payments instantly. Online payments are settled daily to your registered bank account via our secure payment gateway."
  }
];

async function generateEmbeddings() {
  console.log("Generating embeddings for Knowledge Base using Gemini...");
  const dataWithEmbeddings = [];

  for (const item of faqs) {
    const textToEmbed = `Question: ${item.question}\nAnswer: ${item.answer}`;
    
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: textToEmbed,
      });
      
      dataWithEmbeddings.push({
        ...item,
        embedding: response.embeddings[0].values
      });
      console.log(`Embedded: ${item.question}`);
    } catch (error) {
      console.error(`Failed to embed: ${item.question}`, error);
    }
  }

  // Ensure src/data directory exists
  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }

  fs.writeFileSync(
    './src/data/knowledge_base.json',
    JSON.stringify(dataWithEmbeddings, null, 2)
  );
  
  console.log("Embeddings generated and saved to src/data/knowledge_base.json!");
}

generateEmbeddings();
