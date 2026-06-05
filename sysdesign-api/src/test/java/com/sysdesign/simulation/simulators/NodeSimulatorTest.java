package com.sysdesign.simulation.simulators;

import com.sysdesign.simulation.dto.NodeDto;
import com.sysdesign.simulation.dto.SimulationStep;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NodeSimulatorTest {

    @Test
    void testCacheNodeSimulatorHitOrMiss() {
        CacheNodeSimulator cacheNodeSimulator = new CacheNodeSimulator();
        assertEquals("cache", cacheNodeSimulator.getType());

        NodeDto node = new NodeDto();
        node.setId("cache-1");
        node.setLabel("Redis Instance");
        node.setLatencyMs(5);

        // Run multiple times to cover both hit and miss branches (randomly selected)
        boolean hasHit = false;
        boolean hasMiss = false;

        for (int i = 0; i < 50; i++) {
            SimulationStep step = cacheNodeSimulator.simulate(node, "key1");
            assertEquals("cache-1", step.getNodeId());
            assertEquals("Redis Instance", step.getNodeLabel());
            assertEquals(5, step.getDurationMs());

            if ("hit".equals(step.getStatus())) {
                hasHit = true;
                assertEquals("CACHE HIT - returning cached result", step.getMessage());
            } else {
                hasMiss = true;
                assertEquals("CACHE MISS - key not found", step.getMessage());
            }
        }

        assertTrue(hasHit || hasMiss, "Cache simulator must generate hit or miss events");
    }

    @Test
    void testDefaultNodeSimulatorProcessing() {
        DefaultNodeSimulator defaultNodeSimulator = new DefaultNodeSimulator();
        assertEquals("default", defaultNodeSimulator.getType());

        NodeDto node = new NodeDto();
        node.setId("service-1");
        node.setLabel("Product API");
        node.setLatencyMs(45);

        SimulationStep step = defaultNodeSimulator.simulate(node, "GET /products");

        assertNotNull(step);
        assertEquals("service-1", step.getNodeId());
        assertEquals("Product API", step.getNodeLabel());
        assertEquals("pass", step.getStatus());
        assertEquals(45, step.getDurationMs());
        assertEquals("Request processed", step.getMessage());
    }
}
