package com.sysdesign.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sysdesign.review.dto.ArchitectureReview;
import com.sysdesign.review.dto.Recommendation;
import com.sysdesign.review.dto.ReviewIssue;
import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class AIReviewServiceTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private RuleEngine ruleEngine;
    private ObjectMapper objectMapper;
    private AIReviewService aiReviewService;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        ruleEngine = new RuleEngine();
        objectMapper = new ObjectMapper();
        aiReviewService = new AIReviewService(restTemplate, ruleEngine, objectMapper);
    }

    @Test
    void testMockResponseWhenApiKeyNotConfigured() {
        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Primary DB");
        db.setReplicas(2);

        ArchitectureReview review = aiReviewService.review(List.of(db), List.<EdgeDto>of());

        assertNotNull(review);
        assertEquals(90, review.getScore()); // 100 - 10 (warning)
        assertEquals(1, review.getIssues().size());
        assertTrue(review.getIssues().get(0).getMessage().contains("No cache layer detected"));
        assertEquals(1, review.getRecommendations().size());
        assertEquals("Mock API", review.getRecommendations().get(0).getTitle());
    }

    @Test
    void testSuccessfulLlmCallAndMerge() {
        ReflectionTestUtils.setField(aiReviewService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(aiReviewService, "apiUrl", "https://api.openai.com/v1/chat/completions");
        ReflectionTestUtils.setField(aiReviewService, "model", "gpt-3.5-turbo");

        String mockResponseBody = "{"
            + "\"choices\": [{"
            + "  \"message\": {"
            + "    \"role\": \"assistant\","
            + "    \"content\": \"{\\\"issues\\\":[{\\\"severity\\\":\\\"critical\\\",\\\"component\\\":\\\"api-gateway\\\",\\\"message\\\":\\\"Custom API Gateway failure mock\\\"}],\\\"recommendations\\\":[{\\\"title\\\":\\\"Add SSL\\\",\\\"description\\\":\\\"Secure endpoint\\\"}]}\""
            + "  }"
            + "}]"
            + "}";

        mockServer.expect(requestTo("https://api.openai.com/v1/chat/completions"))
            .andExpect(method(HttpMethod.POST))
            .andExpect(header("Authorization", "Bearer test-api-key"))
            .andRespond(withSuccess(mockResponseBody, MediaType.APPLICATION_JSON));

        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Primary DB");
        db.setReplicas(2);

        ArchitectureReview review = aiReviewService.review(List.of(db), List.<EdgeDto>of());

        mockServer.verify();

        assertNotNull(review);
        // ruleIssues: 1 warning (-10)
        // llmIssues: 1 critical (-20)
        // total: 100 - 30 = 70
        assertEquals(70, review.getScore());
        assertEquals(2, review.getIssues().size());
        assertEquals("Add SSL", review.getRecommendations().get(0).getTitle());
    }

    @Test
    void testFailedLlmCallGracefulDegradation() {
        ReflectionTestUtils.setField(aiReviewService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(aiReviewService, "apiUrl", "https://api.openai.com/v1/chat/completions");
        ReflectionTestUtils.setField(aiReviewService, "model", "gpt-3.5-turbo");

        mockServer.expect(requestTo("https://api.openai.com/v1/chat/completions"))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withServerError());

        NodeDto db = new NodeDto();
        db.setId("db-1");
        db.setType("database");
        db.setLabel("Primary DB");
        db.setReplicas(2);

        NodeDto cache = new NodeDto();
        cache.setId("c1");
        cache.setType("cache");
        cache.setLabel("Cache");
        cache.setReplicas(2);

        ArchitectureReview review = aiReviewService.review(List.of(db, cache), List.<EdgeDto>of());

        mockServer.verify();

        assertNotNull(review);
        assertEquals(100, review.getScore()); // No rule issues, LLM failed gracefully
        assertTrue(review.getIssues().isEmpty());
        assertTrue(review.getRecommendations().isEmpty());
    }
}
