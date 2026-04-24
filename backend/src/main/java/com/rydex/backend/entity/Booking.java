package com.rydex.backend.entity;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

  @Id
  private String id;

  @Column(nullable = false)
  private String userId;

  @Column(nullable = false)
  private String pickupAddress;

  @Column(nullable = false)
  private String dropAddress;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal fare;

  private Instant createdAt;

  private Instant updatedAt;

  @PrePersist
  void prePersist() {
    if (id == null || id.isBlank()) {
      id = java.util.UUID.randomUUID().toString();
    }
    if (status == null || status.isBlank()) {
      status = "pending";
    }
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
