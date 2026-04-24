package com.rydex.backend.graphql;

import com.rydex.backend.dto.AuthDtos.AuthResponse;
import com.rydex.backend.dto.AuthDtos.BookingSummary;
import com.rydex.backend.dto.AuthDtos.CreateBookingRequest;
import com.rydex.backend.dto.AuthDtos.UserSummary;
import com.rydex.backend.entity.Booking;
import com.rydex.backend.entity.UserAccount;
import com.rydex.backend.repository.BookingRepository;
import com.rydex.backend.repository.UserAccountRepository;
import com.rydex.backend.security.JwtService;
import java.math.BigDecimal;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;

@Controller
public class AppMutationController {

  private final UserAccountRepository userAccountRepository;
  private final BookingRepository bookingRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AppMutationController(
    UserAccountRepository userAccountRepository,
    BookingRepository bookingRepository,
    PasswordEncoder passwordEncoder,
    JwtService jwtService
  ) {
    this.userAccountRepository = userAccountRepository;
    this.bookingRepository = bookingRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @MutationMapping
  public AuthResponse register(@Argument String name, @Argument String email, @Argument String password) {
    UserAccount saved = userAccountRepository.save(
      UserAccount.builder()
        .name(name)
        .email(email)
        .passwordHash(passwordEncoder.encode(password))
        .role("user")
        .build()
    );
    return new AuthResponse(jwtService.generateToken(saved), toUserSummary(saved));
  }

  @MutationMapping
  public AuthResponse login(@Argument String email, @Argument String password) {
    UserAccount user = userAccountRepository.findByEmail(email)
      .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    return new AuthResponse(jwtService.generateToken(user), toUserSummary(user));
  }

  @MutationMapping
  public BookingSummary createBooking(@Argument CreateBookingRequest input) {
    Booking booking = Booking.builder()
      .userId(input.userId() == null || input.userId().isBlank() ? "guest" : input.userId())
      .pickupAddress(input.pickupAddress())
      .dropAddress(input.dropAddress())
      .fare(input.fare() == null ? BigDecimal.ZERO : input.fare())
      .status("requested")
      .build();

    Booking saved = bookingRepository.save(booking);
    return toBookingSummary(saved);
  }

  @MutationMapping
  public BookingSummary cancelBooking(@Argument String id) {
    Booking booking = bookingRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    booking.setStatus("cancelled");
    return toBookingSummary(bookingRepository.save(booking));
  }

  private UserSummary toUserSummary(UserAccount user) {
    return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole());
  }

  private BookingSummary toBookingSummary(Booking booking) {
    return new BookingSummary(
      booking.getId(),
      booking.getUserId(),
      booking.getPickupAddress(),
      booking.getDropAddress(),
      booking.getStatus(),
      booking.getFare(),
      booking.getCreatedAt() == null ? null : booking.getCreatedAt().toString()
    );
  }
}
