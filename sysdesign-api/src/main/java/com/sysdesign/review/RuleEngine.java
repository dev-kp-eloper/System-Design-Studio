package com.sysdesign.review;

import com.sysdesign.review.dto.ReviewIssue;
import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RuleEngine {

    public List<ReviewIssue> analyze(List<NodeDto> nodes, List<EdgeDto> edges) {
        List<ReviewIssue> issues = new ArrayList<>();

        if (nodes == null) return issues;

        Set<String> nodeTypes = nodes.stream()
            .map(NodeDto::getType)
            .collect(Collectors.toSet());
        Set<String> hasIncoming = edges != null ? edges.stream()
            .map(EdgeDto::getTarget)
            .collect(Collectors.toSet()) : Set.of();

        // Rule 1: Database without upstream cache
        boolean hasDatabase = nodeTypes.contains("database");
        boolean hasCache    = nodeTypes.contains("cache");
        if (hasDatabase && !hasCache) {
            issues.add(ReviewIssue.warning("database",
                "No cache layer detected before database. Consider adding Redis to reduce latency and DB load."));
        }

        // Rule 2: No auth service
        boolean hasAuthService  = nodeTypes.contains("auth-service");
        boolean hasApiGateway   = nodeTypes.contains("api-gateway");
        if (hasApiGateway && !hasAuthService) {
            issues.add(ReviewIssue.critical("api-gateway",
                "No Auth Service detected. All API routes are unauthenticated."));
        }

        // Rule 3: Single points of failure (no load balancer with multiple services)
        long serviceCount = nodes.stream().filter(n -> "service".equals(n.getType())).count();
        boolean hasLoadBalancer = nodeTypes.contains("load-balancer");
        if (serviceCount >= 2 && !hasLoadBalancer) {
            issues.add(ReviewIssue.warning("service",
                "Multiple services detected but no Load Balancer. Traffic cannot be distributed."));
        }

        // Rule 4: Single stateful services (SPOF)
        nodes.stream()
            .filter(n -> List.of("database", "kafka", "cache").contains(n.getType()))
            .filter(n -> n.getReplicas() == null || n.getReplicas() <= 1)
            .forEach(n -> issues.add(ReviewIssue.info(n.getType(),
                n.getLabel() + " has a single replica — single point of failure.")));

        return issues;
    }
}
