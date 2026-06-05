package com.sysdesign.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sysdesign.simulation.dto.SimulationStep;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SimulationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private static final String TOPIC = "simulation-events";

    public void publishSimulationStarted(String userId, String architectureId) {
        var event = Map.of(
            "type", "SIMULATION_STARTED",
            "userId", userId,
            "architectureId", architectureId,
            "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send(TOPIC, userId, serialize(event));
    }

    public void publishNodeTraversed(String sessionId, SimulationStep step) {
        var event = Map.of(
            "type", "NODE_TRAVERSED",
            "sessionId", sessionId,
            "nodeId", step.getNodeId(),
            "status", step.getStatus(),
            "timestamp", Instant.now().toString()
        );
        kafkaTemplate.send(TOPIC, sessionId, serialize(event));
    }

    private String serialize(Object obj) {
        try { 
            return objectMapper.writeValueAsString(obj); 
        } catch (Exception e) { 
            throw new RuntimeException(e); 
        }
    }
}
