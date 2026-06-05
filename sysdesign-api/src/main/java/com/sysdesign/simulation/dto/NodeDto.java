package com.sysdesign.simulation.dto;

import lombok.Data;

@Data
public class NodeDto {
    private String id;
    private String type;
    private String label;
    private int latencyMs;
    private Integer replicas;
}
