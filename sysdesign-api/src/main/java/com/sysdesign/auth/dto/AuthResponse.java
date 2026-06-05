package com.sysdesign.auth.dto;

import java.util.UUID;

public record AuthResponse(
    String token,
    AuthUser user
) {
    public record AuthUser(
        UUID id,
        String name,
        String email
    ) {
    }
}
