package com.sysdesign.simulation;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class SimulatorConfig {
    @Bean
    public Map<String, NodeSimulator> simulators(List<NodeSimulator> simulatorList) {
        return simulatorList.stream()
            .collect(Collectors.toMap(NodeSimulator::getType, s -> s));
    }
}
