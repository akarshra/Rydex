package com.rydex.backend.graphql;

import com.rydex.backend.dto.AuthDtos.BookingSummary;
import com.rydex.backend.dto.AuthDtos.UserSummary;
import com.rydex.backend.entity.Booking;
import com.rydex.backend.entity.UserAccount;
import com.rydex.backend.repository.BookingRepository;
import com.rydex.backend.repository.UserAccountRepository;
import java.util.List;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class BookingQueryController {

  private final UserAccountRepository userAccountRepository;
  private final BookingRepository bookingRepository;

  public BookingQueryController(
    UserAccountRepository userAccountRepository,
    BookingRepository bookingRepository
  ) {
    this.userAccountRepository = userAccountRepository;
    this.bookingRepository = bookingRepository;
  }

  @QueryMapping
  public UserSummary me(Authentication authentication) {
    return resolveCurrentUser(authentication).map(this::toUserSummary).orElse(null);
  }

  @QueryMapping
  public List<BookingSummary> bookings(Authentication authentication) {
    return resolveCurrentUser(authentication)
      .map(user -> bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
        .stream()
        .map(this::toBookingSummary)
        .toList())
      .orElse(List.of());
  }

  @QueryMapping
  public BookingSummary booking(@Argument String id, Authentication authentication) {
    return resolveCurrentUser(authentication)
      .flatMap(user -> bookingRepository.findByIdAndUserId(id, user.getId()))
      .map(this::toBookingSummary)
      .orElse(null);
  }

  private java.util.Optional<UserAccount> resolveCurrentUser(Authentication authentication) {
    if (authentication == null) {
      return java.util.Optional.empty();
    }
    return userAccountRepository.findByEmail(authentication.getName());
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
