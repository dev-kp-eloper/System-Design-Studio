package com.sysdesign.review;

import com.sysdesign.review.dto.ReviewIssue;
import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RuleEngineTest {

    private final RuleEngine ruleEngine = new RuleEngine();

    @Test
    void testNoCacheBeforeDatabase() {
        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Primary DB");
        db.setReplicas(2);

        List<ReviewIssue> issues = ruleEngine.analyze(List.of(db), List.of());
        
        assertEquals(1, issues.size());
        assertEquals("warning", issues.get(0).getSeverity());
        assertEquals("database", issues.get(0).getComponent());
        assertTrue(issues.get(0).getMessage().contains("No cache layer detected"));
    }

    @Test
    void testNoAuthServiceOnGateway() {
        NodeDto gateway = new NodeDto();
        gateway.setId("gw-1");
        gateway.setType("api-gateway");
        gateway.setLabel("Gateway");

        List<ReviewIssue> issues = ruleEngine.analyze(List.of(gateway), List.of());

        assertEquals(1, issues.size());
        assertEquals("critical", issues.get(0).getSeverity());
        assertTrue(issues.get(0).getMessage().contains("No Auth Service detected"));
    }

    @Test
    void testSinglePointOfFailureForDatabase() {
        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Primary DB");
        db.setReplicas(1);

        // Has cache so Rule 1 is bypassed, only Rule 4 (SPOF) triggers
        NodeDto cache = new NodeDto();
        cache.setId("redis-1");
        cache.setType("cache");
        cache.setLabel("Redis Cache");
        cache.setReplicas(2);

        List<ReviewIssue> issues = ruleEngine.analyze(List.of(db, cache), List.of());

        // Should have 1 info issue for single replica DB
        assertEquals(1, issues.size());
        assertEquals("info", issues.get(0).getSeverity());
        assertTrue(issues.get(0).getMessage().contains("single replica"));
    }

    @Test
    void testMultipleServicesWithoutLoadBalancer() {
        NodeDto service1 = new NodeDto();
        service1.setId("s1");
        service1.setType("service");
        service1.setLabel("User Service");

        NodeDto service2 = new NodeDto();
        service2.setId("s2");
        service2.setType("service");
        service2.setLabel("Order Service");

        List<ReviewIssue> issues = ruleEngine.analyze(List.of(service1, service2), List.of());

        // Rule 3 should trigger a warning
        assertFalse(issues.isEmpty());
        assertTrue(issues.stream().anyMatch(i -> 
            "warning".equals(i.getSeverity()) && 
            "service".equals(i.getComponent()) && 
            i.getMessage().contains("no Load Balancer")
        ));
    }

    @Test
    void testStatefulNodesWithMultipleReplicasDoNotTriggerSPOF() {
        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Replica DB");
        db.setReplicas(3);

        NodeDto cache = new NodeDto();
        cache.setId("c1");
        cache.setType("cache");
        cache.setLabel("Redis Cluster");
        cache.setReplicas(3);

        List<ReviewIssue> issues = ruleEngine.analyze(List.of(db, cache), List.of());

        // DB has cache, and both have >= 2 replicas, so issues list should be empty
        assertTrue(issues.isEmpty(), "No issues should be returned for a well-designed architecture");
    }

    @Test
    void testEmptyAndNullInputs() {
        // Null inputs
        assertTrue(ruleEngine.analyze(null, null).isEmpty());

        // Empty list
        assertTrue(ruleEngine.analyze(List.of(), List.of()).isEmpty());
    }

    @Test
    void testWellDesignedArchitectureAllChecksPass() {
        NodeDto gateway = new NodeDto();
        gateway.setId("gw-1");
        gateway.setType("api-gateway");
        gateway.setLabel("API Gateway");

        NodeDto auth = new NodeDto();
        auth.setId("auth-1");
        auth.setType("auth-service");
        auth.setLabel("Auth Service");

        NodeDto lb = new NodeDto();
        lb.setId("lb-1");
        lb.setType("load-balancer");
        lb.setLabel("HA Proxy");

        NodeDto service1 = new NodeDto();
        service1.setId("s1");
        service1.setType("service");
        service1.setLabel("Service 1");

        NodeDto service2 = new NodeDto();
        service2.setId("s2");
        service2.setType("service");
        service2.setLabel("Service 2");

        NodeDto cache = new NodeDto();
        cache.setId("c1");
        cache.setType("cache");
        cache.setLabel("Redis");
        cache.setReplicas(3);

        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Postgres");
        db.setReplicas(2);

        List<ReviewIssue> issues = ruleEngine.analyze(
            List.of(gateway, auth, lb, service1, service2, cache, db), 
            List.of()
        );

        // Fully redundant and secure architecture
        assertTrue(issues.isEmpty(), "A resilient architecture design should have zero automatic issues");
    }
}
