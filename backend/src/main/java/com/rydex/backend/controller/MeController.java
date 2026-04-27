package com.rydex.backend.controller;

import com.rydex.backend.dto.AuthDtos.UserSummary;
import com.rydex.backend.entity.UserAccount;
import com.rydex.backend.repository.UserAccountRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

  private final UserAccountRepository userAccountRepository;

  public MeController(UserAccountRepository userAccountRepository) {
    this.userAccountRepository = userAccountRepository;
  }

  @GetMapping("/me")
  public UserSummary me(Authentication authentication) {
    if (authentication == null) {
      throw new IllegalArgumentException("Unauthorized");
    }

    UserAccount user = userAccountRepository.findByEmail(authentication.getName())
      .orElseThrow(() -> new IllegalArgumentException("Unauthorized"));
    return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole());
  }
}
