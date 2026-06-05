package com.sysdesign.auth;

import com.sysdesign.auth.dto.AuthResponse;
import com.sysdesign.auth.dto.LoginRequest;
import com.sysdesign.auth.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
            .name(request.name().trim())
            .email(email)
            .password(passwordEncoder.encode(request.password()))
            .role("ROLE_USER")
            .build();

        User saved = userRepository.save(user);
        return toResponse(saved, jwtService.generateToken(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return toResponse(user, jwtService.generateToken(user));
    }

    private AuthResponse toResponse(User user, String token) {
        return new AuthResponse(
            token,
            new AuthResponse.AuthUser(user.getId(), user.getName(), user.getEmail())
        );
    }
}
