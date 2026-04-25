package com.rydex.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

  @Value("${stripe.api.key:}")
  private String stripeApiKey;

  @PostMapping("/create")
  public Map<String, Object> create(@RequestBody Map<String, Object> payload) {
    // Validate input
    if (!payload.containsKey("amount") || !payload.containsKey("bookingId") || !payload.containsKey("currency")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required fields: amount, bookingId, currency");
    }

    try {
      Object amountObj = payload.get("amount");
      long amount = 0;
      
      if (amountObj instanceof Integer) {
        amount = ((Integer) amountObj).longValue();
      } else if (amountObj instanceof Long) {
        amount = (Long) amountObj;
      } else if (amountObj instanceof Double) {
        amount = ((Double) amountObj).longValue();
      }

      if (amount <= 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than 0");
      }

      // For now, return a proper structure for payment processing
      // In production, integrate with Stripe/Razorpay API
      Map<String, Object> result = new HashMap<>();
      result.put("success", true);
      result.put("provider", "stripe");
      result.put("orderId", UUID.randomUUID().toString());
      result.put("amount", amount);
      result.put("currency", payload.get("currency"));
      result.put("bookingId", payload.get("bookingId"));
      result.put("clientSecret", "pi_test_" + UUID.randomUUID().toString()); // In production: use actual Stripe API
      result.put("status", "requires_payment_method");
      return result;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment creation failed: " + e.getMessage());
    }
  }

  @PostMapping("/verify")
  public Map<String, Object> verify(@RequestBody Map<String, Object> payload) {
    // Validate input
    if (!payload.containsKey("paymentId") || !payload.containsKey("bookingId")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required fields: paymentId, bookingId");
    }

    try {
      String paymentId = String.valueOf(payload.get("paymentId"));
      String bookingId = String.valueOf(payload.get("bookingId"));

      if (paymentId.isEmpty() || bookingId.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment ID and Booking ID cannot be empty");
      }

      // In production, verify with Stripe/Razorpay API
      // Example: Charge.retrieve(paymentId) from Stripe
      // For now, implement basic validation
      
      Map<String, Object> result = new HashMap<>();
      
      // Simulate payment verification (in production, query Stripe API)
      if (paymentId.startsWith("pi_test_") || paymentId.startsWith("razorpay_")) {
        result.put("success", true);
        result.put("status", "succeeded");
        result.put("payment_id", paymentId);
        result.put("booking_id", bookingId);
        result.put("verified", true);
      } else {
        result.put("success", false);
        result.put("status", "verification_failed");
        result.put("message", "Invalid payment ID format");
        result.put("verified", false);
      }
      
      return result;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Payment verification failed: " + e.getMessage());
    }
  }
}
