package com.sysdesign.simulation.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimulationStep {
    private String nodeId;
    private String nodeLabel;
    private String status;
    private long durationMs;
    private String message;
}
