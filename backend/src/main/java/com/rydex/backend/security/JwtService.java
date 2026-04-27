package com.rydex.backend.security;

import com.rydex.backend.entity.UserAccount;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey secretKey;
  private final String issuer;
  private final long expirationMinutes;

  public JwtService(
    @Value("${app.jwt.secret}") String secret,
    @Value("${app.jwt.issuer}") String issuer,
    @Value("${app.jwt.expiration-minutes}") long expirationMinutes
  ) {
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(UserAccount user) {
    Instant now = Instant.now();
    return Jwts.builder()
      .subject(user.getEmail())
      .issuer(issuer)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
      .claims(Map.of(
        "uid", user.getId(),
        "name", user.getName(),
        "role", user.getRole()
      ))
      .signWith(secretKey)
      .compact();
  }

  public String extractEmail(String token) {
    return Jwts.parser()
      .verifyWith(secretKey)
      .build()
      .parseSignedClaims(token)
      .getPayload()
      .getSubject();
  }

  public boolean isValid(String token) {
    try {
      Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
      return true;
    } catch (Exception ex) {
      return false;
    }
  }
}
