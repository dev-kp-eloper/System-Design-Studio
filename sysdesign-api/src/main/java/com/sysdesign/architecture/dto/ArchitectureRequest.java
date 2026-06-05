package com.sysdesign.architecture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ArchitectureRequest(
    @NotBlank(message = "Architecture name is required")
    @Size(max = 140, message = "Architecture name must be 140 characters or less")
    String name,

    @NotBlank(message = "nodesJson is required")
    String nodesJson,

    @NotBlank(message = "edgesJson is required")
    String edgesJson
) {
}
