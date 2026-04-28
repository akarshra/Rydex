package com.rydex.backend.controller;

import com.rydex.backend.repository.BookingRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MiscController {

  private final BookingRepository bookingRepository;

  public MiscController(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @GetMapping("/user/bookings")
  public Map<String, Object> userBookings() {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("bookings", bookingRepository.findAll());
    return result;
  }

  @PostMapping("/socket/connect")
  public Map<String, Object> socketConnect(@RequestBody Map<String, Object> payload) {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("socketId", UUID.randomUUID().toString());
    return result;
  }

  @GetMapping("/zego/token")
  public Map<String, Object> zegoToken() {
    Map<String, Object> result = new HashMap<>();
    result.put("success", true);
    result.put("token", UUID.randomUUID().toString());
    return result;
  }

}
