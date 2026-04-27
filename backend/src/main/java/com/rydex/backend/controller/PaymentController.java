package com.rydex.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

  @PostMapping("/create")
  public Map<String, Object> create(@RequestBody Map<String, Object> payload) {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("provider", "stripe");
    result.put("orderId", UUID.randomUUID().toString());
    result.put("amount", payload.getOrDefault("amount", 0));
    result.put("currency", "INR");
    result.put("clientSecret", "pi_demo_client_secret");
    return result;
  }

  @PostMapping("/verify")
  public Map<String, Object> verify(@RequestBody Map<String, Object> payload) {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("payment", payload);
    return result;
  }
}
