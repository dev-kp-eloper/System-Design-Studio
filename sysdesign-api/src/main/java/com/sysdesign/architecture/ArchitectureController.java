package com.sysdesign.architecture;

import com.sysdesign.architecture.dto.ArchitectureRequest;
import com.sysdesign.architecture.dto.ArchitectureResponse;
import com.sysdesign.auth.User;
import com.sysdesign.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/architectures")
@RequiredArgsConstructor
public class ArchitectureController {

    private final ArchitectureService architectureService;

    @GetMapping
    public ApiResponse<Page<ArchitectureResponse>> getAll(
        @AuthenticationPrincipal User user,
        Pageable pageable
    ) {
        return ApiResponse.success("Architectures fetched", architectureService.findByOwner(user, pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ArchitectureResponse> create(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody ArchitectureRequest request
    ) {
        return ApiResponse.success("Architecture created", architectureService.create(request, user));
    }

    @GetMapping("/{id}")
    public ApiResponse<ArchitectureResponse> getById(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id
    ) {
        return ApiResponse.success("Architecture fetched", architectureService.findByIdAndOwner(id, user));
    }

    @PutMapping("/{id}")
    public ApiResponse<ArchitectureResponse> update(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id,
        @Valid @RequestBody ArchitectureRequest request
    ) {
        return ApiResponse.success("Architecture updated", architectureService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id
    ) {
        architectureService.delete(id, user);
    }
}
