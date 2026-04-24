package com.rydex.backend.controller;

import com.rydex.backend.entity.Booking;
import com.rydex.backend.repository.BookingRepository;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

  private final BookingRepository bookingRepository;

  public BookingController(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @PostMapping("/create")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> create(@RequestBody Map<String, Object> payload, Authentication authentication) {
    String userId = resolveUserId(payload, authentication);
    Booking booking = Booking.builder()
      .userId(userId)
      .pickupAddress(String.valueOf(payload.getOrDefault("pickupAddress", "")))
      .dropAddress(String.valueOf(payload.getOrDefault("dropAddress", "")))
      .status("requested")
      .fare(toBigDecimal(payload.get("fare")))
      .build();

    Booking saved = bookingRepository.save(booking);
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("booking", toBookingResponse(saved));
    return result;
  }

  @GetMapping("/{id}")
  public Map<String, Object> getById(@PathVariable String id) {
    return bookingRepository.findById(id)
      .map(saved -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("booking", toBookingResponse(saved));
        return result;
      })
      .orElseGet(() -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "Not found");
        return result;
      });
  }

  @GetMapping("/my-active")
  public Map<String, Object> myActive(Authentication authentication) {
    String userId = resolveUserId(authentication);
    Optional<Booking> active = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
      .stream()
      .filter(booking -> !"completed".equalsIgnoreCase(booking.getStatus()) && !"cancelled".equalsIgnoreCase(booking.getStatus()))
      .findFirst();

    return active
      .map(saved -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("booking", toBookingResponse(saved));
        return result;
      })
      .orElseGet(() -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("booking", new HashMap<>());
        return result;
      });
  }

  @GetMapping("/{id}/status")
  public Map<String, Object> status(@PathVariable String id) {
    return bookingRepository.findById(id)
      .map(saved -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("status", saved.getStatus());
        return result;
      })
      .orElseGet(() -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "Not found");
        return result;
      });
  }

  @PostMapping("/{id}/cancel")
  public Map<String, Object> cancel(@PathVariable String id) {
    return updateStatus(id, "cancelled");
  }

  @PostMapping("/{id}/accept")
  public Map<String, Object> accept(@PathVariable String id) {
    return updateStatus(id, "confirmed");
  }

  @PostMapping("/{id}/reject")
  public Map<String, Object> reject(@PathVariable String id) {
    return updateStatus(id, "rejected");
  }

  @PostMapping("/{id}/start")
  public Map<String, Object> start(@PathVariable String id) {
    return updateStatus(id, "started");
  }

  @PostMapping("/{id}/complete")
  public Map<String, Object> complete(@PathVariable String id) {
    return updateStatus(id, "completed");
  }

  @PostMapping("/{id}/arriving")
  public Map<String, Object> arriving(@PathVariable String id) {
    return updateStatus(id, "arriving");
  }

  @PostMapping("/{id}/arrived")
  public Map<String, Object> arrived(@PathVariable String id) {
    return updateStatus(id, "arrived");
  }

  @PostMapping("/{id}/expire")
  public Map<String, Object> expire(@PathVariable String id) {
    return updateStatus(id, "expired");
  }

  @PostMapping("/{id}/confirm-payment")
  public Map<String, Object> confirmPayment(@PathVariable String id, @RequestBody(required = false) Map<String, Object> payload) {
    return updateStatus(id, "confirmed");
  }

  private Map<String, Object> updateStatus(String bookingId, String status) {
    return bookingRepository.findById(bookingId)
      .map(booking -> {
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("booking", toBookingResponse(saved));
        return result;
      })
      .orElseGet(() -> {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", "Not found");
        return result;
      });
  }

  private Map<String, Object> toBookingResponse(Booking booking) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("_id", booking.getId());
    response.put("id", booking.getId());
    response.put("userId", booking.getUserId());
    response.put("pickupAddress", booking.getPickupAddress());
    response.put("dropAddress", booking.getDropAddress());
    response.put("status", booking.getStatus());
    response.put("fare", booking.getFare());
    response.put("createdAt", booking.getCreatedAt() == null ? null : booking.getCreatedAt().toString());
    return response;
  }

  private String resolveUserId(Map<String, Object> payload, Authentication authentication) {
    Object provided = payload.get("userId");
    if (provided != null && !String.valueOf(provided).isBlank()) {
      return String.valueOf(provided);
    }
    return resolveUserId(authentication);
  }

  private String resolveUserId(Authentication authentication) {
    if (authentication != null && authentication.getName() != null) {
      return authentication.getName();
    }
    return "guest";
  }

  private BigDecimal toBigDecimal(Object value) {
    if (value == null) {
      return BigDecimal.ZERO;
    }
    try {
      return new BigDecimal(String.valueOf(value));
    } catch (Exception ex) {
      return BigDecimal.ZERO;
    }
  }
}
