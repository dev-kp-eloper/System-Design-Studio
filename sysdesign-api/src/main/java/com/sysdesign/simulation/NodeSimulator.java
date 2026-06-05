package com.sysdesign.simulation;

import com.sysdesign.simulation.dto.NodeDto;
import com.sysdesign.simulation.dto.SimulationStep;

public interface NodeSimulator {
    SimulationStep simulate(NodeDto node, String request);
    String getType();
}
