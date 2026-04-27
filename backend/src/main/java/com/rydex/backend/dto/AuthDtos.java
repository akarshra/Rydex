package com.rydex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class AuthDtos {
  private AuthDtos() {}

  public record RegisterRequest(
    @NotBlank String name,
    @NotBlank String email,
    @NotBlank String password
  ) {}
  public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
  public record VerifyOtpRequest(@NotBlank String email, @NotBlank String otp) {}
  public record AuthResponse(String token, UserSummary user) {}
  public record UserSummary(String id, String name, String email, String role) {}
  public record CreateBookingRequest(String userId, String pickupAddress, String dropAddress, BigDecimal fare) {}
  public record BookingSummary(
    String id,
    String userId,
    String pickupAddress,
    String dropAddress,
    String status,
    BigDecimal fare,
    String createdAt
  ) {}
  public record SystemStatusResponse(String status, String service, String version) {}
}
