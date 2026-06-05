package com.sysdesign.simulation;

import com.sysdesign.events.SimulationEventPublisher;
import com.sysdesign.simulation.dto.SimulationRequest;
import com.sysdesign.simulation.dto.SimulationStep;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class SimulationStreamController {

    private final SimulationEngine engine;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimulationEventPublisher eventPublisher;

    @MessageMapping("/simulate")
    public void startSimulation(SimulationRequest request) throws InterruptedException {
        String sessionId = UUID.randomUUID().toString();
        eventPublisher.publishSimulationStarted(request.getUserId(), request.getArchitectureId());

        // We use engine.simulate to match the Phase 3 Engine signature.
        List<SimulationStep> steps = engine.simulate(
                request.getNodes(), request.getEdges(), request.getHttpRequest()
        ).getSteps();

        for (SimulationStep step : steps) {
            // Stream each step to the client
            messagingTemplate.convertAndSend(
                "/topic/simulation/" + sessionId, step
            );
            eventPublisher.publishNodeTraversed(sessionId, step);

            // Artificial delay for animation
            Thread.sleep(250);
        }

        // Send completion event
        messagingTemplate.convertAndSend(
            "/topic/simulation/" + sessionId,
            Map.of("type", "SIMULATION_COMPLETE", "sessionId", sessionId)
        );
    }
}
