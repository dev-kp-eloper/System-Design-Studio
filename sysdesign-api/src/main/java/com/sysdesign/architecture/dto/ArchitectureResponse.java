package com.sysdesign.architecture.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ArchitectureResponse(
    UUID id,
    String name,
    String nodesJson,
    String edgesJson,
    UUID ownerId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
