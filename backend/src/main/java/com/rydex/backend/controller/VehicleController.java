package com.rydex.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

  @PostMapping("/nearby")
  public Map<String, Object> nearby(@RequestBody Map<String, Object> payload) {
    List<Map<String, Object>> vehicles = List.of(
      Map.of(
        "_id", "veh-1",
        "type", payload.getOrDefault("vehicleType", "car"),
        "owner", "driver-1",
        "baseFare", 120,
        "pricePerKm", 15,
        "name", "Premium Ride"
      ),
      Map.of(
        "_id", "veh-2",
        "type", payload.getOrDefault("vehicleType", "car"),
        "owner", "driver-2",
        "baseFare", 150,
        "pricePerKm", 18,
        "name", "Elite Drive"
      )
    );

    return Map.of("success", true, "vehicles", vehicles);
  }

  @GetMapping
  public Map<String, Object> all() {
    AtomicInteger i = new AtomicInteger(1);
    return Map.of(
      "success", true,
      "vehicles", List.of(
        Map.of("_id", "veh-" + i.getAndIncrement(), "name", "Executive Car", "type", "car"),
        Map.of("_id", "veh-" + i.getAndIncrement(), "name", "Premium SUV", "type", "suv")
      )
    );
  }
}
