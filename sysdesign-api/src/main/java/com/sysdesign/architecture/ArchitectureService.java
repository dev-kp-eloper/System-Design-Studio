package com.sysdesign.architecture;

import com.sysdesign.architecture.dto.ArchitectureRequest;
import com.sysdesign.architecture.dto.ArchitectureResponse;
import com.sysdesign.auth.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArchitectureService {

    private final ArchitectureRepository architectureRepository;

    @Transactional(readOnly = true)
    public Page<ArchitectureResponse> findByOwner(User owner, Pageable pageable) {
        return architectureRepository.findByOwner(owner, pageable)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ArchitectureResponse findByIdAndOwner(UUID id, User owner) {
        return architectureRepository.findByIdAndOwner(id, owner)
            .map(this::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Architecture not found"));
    }

    @Transactional
    public ArchitectureResponse create(ArchitectureRequest request, User owner) {
        Architecture architecture = Architecture.builder()
            .name(request.name().trim())
            .nodesJson(request.nodesJson())
            .edgesJson(request.edgesJson())
            .owner(owner)
            .build();

        return toResponse(architectureRepository.save(architecture));
    }

    @Transactional
    public ArchitectureResponse update(UUID id, ArchitectureRequest request, User owner) {
        Architecture architecture = architectureRepository.findByIdAndOwner(id, owner)
            .orElseThrow(() -> new EntityNotFoundException("Architecture not found"));

        architecture.setName(request.name().trim());
        architecture.setNodesJson(request.nodesJson());
        architecture.setEdgesJson(request.edgesJson());

        return toResponse(architectureRepository.save(architecture));
    }

    @Transactional
    public void delete(UUID id, User owner) {
        Architecture architecture = architectureRepository.findByIdAndOwner(id, owner)
            .orElseThrow(() -> new EntityNotFoundException("Architecture not found"));
        architectureRepository.delete(architecture);
    }

    private ArchitectureResponse toResponse(Architecture architecture) {
        return new ArchitectureResponse(
            architecture.getId(),
            architecture.getName(),
            architecture.getNodesJson(),
            architecture.getEdgesJson(),
            architecture.getOwner().getId(),
            architecture.getCreatedAt(),
            architecture.getUpdatedAt()
        );
    }
}
