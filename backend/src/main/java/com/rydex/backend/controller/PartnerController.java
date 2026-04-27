package com.rydex.backend.controller;

import com.rydex.backend.repository.BookingRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
public class PartnerController {

  private final BookingRepository bookingRepository;

  public PartnerController(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @GetMapping("/bookings")
  public Map<String, Object> bookings() {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("bookings", bookingRepository.findAll());
    return result;
  }

  @GetMapping("/bookings/active")
  public Map<String, Object> activeBookings() {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("bookings", bookingRepository.findAll());
    return result;
  }

  @GetMapping("/bookings/pending")
  public Map<String, Object> pendingBookings() {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("bookings", bookingRepository.findAll());
    return result;
  }

  @GetMapping("/bookings/counts")
  public Map<String, Object> counts() {
    long total = bookingRepository.count();
    return Map.of(
      "success", true,
      "pending", total,
      "active", total,
      "completed", total,
      "rejected", 0
    );
  }

  @PostMapping("/bookings/send-pickup-otp")
  public Map<String, Object> sendPickupOtp(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "otp", "123456");
  }

  @PostMapping("/bookings/verify-pickup-otp")
  public Map<String, Object> verifyPickupOtp(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true);
  }

  @PostMapping("/bookings/send-drop-otp")
  public Map<String, Object> sendDropOtp(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "otp", "123456");
  }

  @PostMapping("/bookings/verify-drop-otp")
  public Map<String, Object> verifyDropOtp(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true);
  }

  @GetMapping("/vehicle")
  public Map<String, Object> vehicle() {
    return Map.of("success", true, "vehicle", Map.of("status", "draft"));
  }

  @PostMapping("/vehicle")
  public Map<String, Object> saveVehicle(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "vehicle", payload);
  }

  @GetMapping("/documents")
  public Map<String, Object> documents() {
    return Map.of("success", true, "documents", List.of());
  }

  @PostMapping("/documents")
  public Map<String, Object> saveDocuments(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "documents", payload);
  }

  @GetMapping("/bank")
  public Map<String, Object> bank() {
    return Map.of("success", true, "bank", Map.of());
  }

  @PostMapping("/bank")
  public Map<String, Object> saveBank(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "bank", payload);
  }

  @GetMapping("/earnings")
  public Map<String, Object> earnings() {
    return Map.of("success", true, "earnings", Map.of("total", 0, "today", 0));
  }

  @PostMapping("/video-kyc/request")
  public Map<String, Object> requestVideoKyc(@RequestBody Map<String, Object> payload) {
    return Map.of("success", true, "roomId", payload.getOrDefault("roomId", "room-demo"));
  }
}
