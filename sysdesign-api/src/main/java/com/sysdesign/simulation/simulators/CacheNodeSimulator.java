package com.sysdesign.simulation.simulators;

import com.sysdesign.simulation.NodeSimulator;
import com.sysdesign.simulation.dto.NodeDto;
import com.sysdesign.simulation.dto.SimulationStep;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class CacheNodeSimulator implements NodeSimulator {
    private final Random random = new Random();

    @Override
    public SimulationStep simulate(NodeDto node, String request) {
        boolean isHit = random.nextDouble() < 0.35;
        return SimulationStep.builder()
            .nodeId(node.getId())
            .nodeLabel(node.getLabel())
            .status(isHit ? "hit" : "miss")
            .durationMs(node.getLatencyMs())
            .message(isHit ? "CACHE HIT - returning cached result" : "CACHE MISS - key not found")
            .build();
    }

    @Override
    public String getType() {
        return "cache";
    }
}
