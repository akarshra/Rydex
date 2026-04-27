package com.rydex.backend.repository;

import com.rydex.backend.entity.Booking;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
  List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
  Optional<Booking> findByIdAndUserId(String id, String userId);
}
