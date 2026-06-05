package com.sysdesign.simulation;

import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import com.sysdesign.simulation.dto.SimulationResult;
import com.sysdesign.simulation.dto.SimulationStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimulationEngine {

    private final Map<String, NodeSimulator> simulators;

    public SimulationResult simulate(List<NodeDto> nodes, List<EdgeDto> edges, String request) {
        if (nodes == null) nodes = new ArrayList<>();
        if (edges == null) edges = new ArrayList<>();
        
        Map<String, List<String>> graph = new HashMap<>();
        nodes.forEach(n -> graph.put(n.getId(), new ArrayList<>()));
        edges.forEach(e -> {
            if (graph.containsKey(e.getSource())) {
                graph.get(e.getSource()).add(e.getTarget());
            }
        });

        Set<String> hasIncoming = edges.stream()
            .map(EdgeDto::getTarget)
            .collect(Collectors.toSet());
            
        NodeDto source = nodes.stream()
            .filter(n -> !hasIncoming.contains(n.getId()))
            .findFirst()
            .orElse(null);
            
        if (source == null) {
            return SimulationResult.builder()
                .steps(new ArrayList<>())
                .totalLatencyMs(0)
                .build();
        }

        List<SimulationStep> steps = new ArrayList<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        queue.add(source.getId());

        while (!queue.isEmpty()) {
            String nodeId = queue.poll();
            if (visited.contains(nodeId)) continue;
            visited.add(nodeId);

            NodeDto node = nodes.stream()
                .filter(n -> n.getId().equals(nodeId))
                .findFirst()
                .orElse(null);
                
            if (node == null) continue;

            NodeSimulator simulator = simulators.getOrDefault(node.getType(), simulators.get("default"));
            SimulationStep step;
            if (simulator != null) {
                step = simulator.simulate(node, request);
            } else {
                step = SimulationStep.builder()
                    .nodeId(node.getId())
                    .nodeLabel(node.getLabel())
                    .status("pass")
                    .durationMs(node.getLatencyMs())
                    .message("Request processed")
                    .build();
            }
            steps.add(step);

            if (!"hit".equals(step.getStatus())) {
                queue.addAll(graph.getOrDefault(nodeId, List.of()));
            }
        }

        long totalLatency = steps.stream().mapToLong(SimulationStep::getDurationMs).sum();
        return SimulationResult.builder()
            .steps(steps)
            .totalLatencyMs(totalLatency)
            .build();
    }
}
