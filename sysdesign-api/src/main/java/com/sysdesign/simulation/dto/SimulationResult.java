package com.sysdesign.simulation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SimulationResult {
    private List<SimulationStep> steps;
    private long totalLatencyMs;
}
