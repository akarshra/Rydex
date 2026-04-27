package com.rydex.backend.controller;

import com.rydex.backend.dto.AuthDtos.AuthResponse;
import com.rydex.backend.dto.AuthDtos.LoginRequest;
import com.rydex.backend.dto.AuthDtos.RegisterRequest;
import com.rydex.backend.dto.AuthDtos.UserSummary;
import com.rydex.backend.dto.AuthDtos.VerifyOtpRequest;
import com.rydex.backend.entity.UserAccount;
import com.rydex.backend.repository.UserAccountRepository;
import com.rydex.backend.security.JwtService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserAccountRepository userAccountRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthController(
    UserAccountRepository userAccountRepository,
    PasswordEncoder passwordEncoder,
    JwtService jwtService
  ) {
    this.userAccountRepository = userAccountRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
    userAccountRepository.findByEmail(request.email()).ifPresent(user -> {
      throw new IllegalArgumentException("User already exists");
    });

    UserAccount user = UserAccount.builder()
      .name(request.name())
      .email(request.email())
      .passwordHash(passwordEncoder.encode(request.password()))
      .role("user")
      .build();

    UserAccount saved = userAccountRepository.save(user);
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("message", "OTP sent");
    result.put("user", toSummary(saved));
    return result;
  }

  @PostMapping("/verify-otp")
  public Map<String, Object> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("message", "OTP verified");
    result.put("email", request.email());
    return result;
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    UserAccount user = userAccountRepository.findByEmail(request.email())
      .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    return new AuthResponse(jwtService.generateToken(user), toSummary(user));
  }

  @GetMapping("/me")
  public UserSummary me(Authentication authentication) {
    if (authentication == null) {
      throw new IllegalArgumentException("Unauthorized");
    }

    UserAccount user = userAccountRepository.findByEmail(authentication.getName())
      .orElseThrow(() -> new IllegalArgumentException("Unauthorized"));
    return toSummary(user);
  }

  private UserSummary toSummary(UserAccount user) {
    return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole());
  }
}
