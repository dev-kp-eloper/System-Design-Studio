package com.sysdesign.architecture;

import com.sysdesign.auth.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ArchitectureRepository extends JpaRepository<Architecture, UUID> {

    Page<Architecture> findByOwner(User owner, Pageable pageable);

    Optional<Architecture> findByIdAndOwner(UUID id, User owner);
}
