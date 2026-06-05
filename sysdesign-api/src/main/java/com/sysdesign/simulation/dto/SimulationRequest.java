package com.sysdesign.simulation.dto;

import lombok.Data;
import java.util.List;

@Data
public class SimulationRequest {
    private String architectureId;
    private String userId;
    private String httpRequest;
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
}
