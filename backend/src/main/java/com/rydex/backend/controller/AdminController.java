package com.rydex.backend.controller;

import com.rydex.backend.repository.BookingRepository;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> dashboard(Authentication auth) {
    verifyAdminAccess(auth);
    long total = bookingRepository.count();
    return Map.of("success", true, "stats", Map.of("bookings", total, "vendors", 0, "vehicles", 0));
  }

  @GetMapping("/earnings")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> earnings(Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "earnings", Map.of("total", 0));
  }

  @GetMapping("/vendors/video-kyc/pending")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> pendingVideoKyc(Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vendors", java.util.List.of());
  }

  @PostMapping("/vendors/video-kyc/start/{vendorId}")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> startVideoKyc(@PathVariable String vendorId, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vendorId", vendorId);
  }

  @PostMapping("/vendors/video-kyc/complete")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> completeVideoKyc(Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true);
  }

  @GetMapping("/vendors/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> vendor(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vendor", Map.of("id", id));
  }

  @PostMapping("/vendors/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> approveVendor(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vendorId", id, "status", "approved");
  }

  @PostMapping("/vendors/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> rejectVendor(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vendorId", id, "status", "rejected");
  }

  @GetMapping("/vehicles/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> vehicle(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vehicle", Map.of("id", id));
  }

  @PostMapping("/vehicles/{id}/approve")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> approveVehicle(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vehicleId", id, "status", "approved");
  }

  @PostMapping("/vehicles/{id}/reject")
  @PreAuthorize("hasRole('ADMIN')")
  public Map<String, Object> rejectVehicle(@PathVariable String id, Authentication auth) {
    verifyAdminAccess(auth);
    return Map.of("success", true, "vehicleId", id, "status", "rejected");
  }

  private void verifyAdminAccess(Authentication auth) {
    boolean isAdmin = auth.getAuthorities().stream()
      .map(GrantedAuthority::getAuthority)
      .anyMatch(authority -> authority.equals("ROLE_ADMIN"));
    if (!isAdmin) {
      throw new org.springframework.security.access.AccessDeniedException("Admin access required");
    }
  }
}
