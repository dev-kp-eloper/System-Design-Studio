package com.sysdesign.simulation.simulators;

import com.sysdesign.simulation.NodeSimulator;
import com.sysdesign.simulation.dto.NodeDto;
import com.sysdesign.simulation.dto.SimulationStep;
import org.springframework.stereotype.Component;

@Component
public class DefaultNodeSimulator implements NodeSimulator {
    @Override
    public SimulationStep simulate(NodeDto node, String request) {
        return SimulationStep.builder()
            .nodeId(node.getId())
            .nodeLabel(node.getLabel())
            .status("pass")
            .durationMs(node.getLatencyMs())
            .message("Request processed")
            .build();
    }

    @Override
    public String getType() {
        return "default";
    }
}
