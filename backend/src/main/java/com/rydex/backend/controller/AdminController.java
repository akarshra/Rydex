package com.rydex.backend.controller;

import com.rydex.backend.repository.BookingRepository;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final BookingRepository bookingRepository;

  public AdminController(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @GetMapping("/dashboard")
  public Map<String, Object> dashboard() {
    long total = bookingRepository.count();
    return Map.of("success", true, "stats", Map.of("bookings", total, "vendors", 0, "vehicles", 0));
  }

  @GetMapping("/earnings")
  public Map<String, Object> earnings() {
    return Map.of("success", true, "earnings", Map.of("total", 0));
  }

  @GetMapping("/vendors/video-kyc/pending")
  public Map<String, Object> pendingVideoKyc() {
    return Map.of("success", true, "vendors", List.of());
  }

  @PostMapping("/vendors/video-kyc/start/{vendorId}")
  public Map<String, Object> startVideoKyc(@PathVariable String vendorId) {
    return Map.of("success", true, "vendorId", vendorId);
  }

  @PostMapping("/vendors/video-kyc/complete")
  public Map<String, Object> completeVideoKyc() {
    return Map.of("success", true);
  }

  @GetMapping("/vendors/{id}")
  public Map<String, Object> vendor(@PathVariable String id) {
    return Map.of("success", true, "vendor", Map.of("id", id));
  }

  @PostMapping("/vendors/{id}/approve")
  public Map<String, Object> approveVendor(@PathVariable String id) {
    return Map.of("success", true, "vendorId", id, "status", "approved");
  }

  @PostMapping("/vendors/{id}/reject")
  public Map<String, Object> rejectVendor(@PathVariable String id) {
    return Map.of("success", true, "vendorId", id, "status", "rejected");
  }

  @GetMapping("/vehicles/{id}")
  public Map<String, Object> vehicle(@PathVariable String id) {
    return Map.of("success", true, "vehicle", Map.of("id", id));
  }

  @PostMapping("/vehicles/{id}/approve")
  public Map<String, Object> approveVehicle(@PathVariable String id) {
    return Map.of("success", true, "vehicleId", id, "status", "approved");
  }

  @PostMapping("/vehicles/{id}/reject")
  public Map<String, Object> rejectVehicle(@PathVariable String id) {
    return Map.of("success", true, "vehicleId", id, "status", "rejected");
  }
}
