package com.rydex.backend.graphql;

import com.rydex.backend.dto.AuthDtos.SystemStatusResponse;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class SystemStatusController {

  @QueryMapping
  public String health() {
    return "ok";
  }

  @QueryMapping
  public SystemStatusResponse systemStatus() {
    return new SystemStatusResponse("ok", "rydex-backend", "0.0.1");
  }
}
