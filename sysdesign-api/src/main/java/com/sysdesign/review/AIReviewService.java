package com.sysdesign.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sysdesign.review.dto.ArchitectureReview;
import com.sysdesign.review.dto.LLMReview;
import com.sysdesign.review.dto.ReviewIssue;
import com.sysdesign.review.dto.Recommendation;
import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIReviewService {

    private static final Logger log = LoggerFactory.getLogger(AIReviewService.class);

    private final RestTemplate restTemplate;
    private final RuleEngine ruleEngine;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:default-key}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Autowired
    public AIReviewService(RestTemplate restTemplate, RuleEngine ruleEngine, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.ruleEngine = ruleEngine;
        this.objectMapper = objectMapper;
    }

    public ArchitectureReview review(List<NodeDto> nodes, List<EdgeDto> edges) {
        // Run deterministic rules first
        List<ReviewIssue> ruleIssues = ruleEngine.analyze(nodes, edges);

        // Build architecture description for LLM
        String description = buildDescription(nodes, edges);

        // Call LLM
        String llmResponse = callLLM(description);
        LLMReview llmReview = parseLLMResponse(llmResponse);

        // Merge results
        List<ReviewIssue> allIssues = new ArrayList<>(ruleIssues);
        if (llmReview != null && llmReview.getIssues() != null) {
            allIssues.addAll(llmReview.getIssues());
        }

        List<Recommendation> recommendations =
            (llmReview != null && llmReview.getRecommendations() != null)
                ? llmReview.getRecommendations()
                : new ArrayList<>();

        return ArchitectureReview.builder()
            .issues(allIssues)
            .recommendations(recommendations)
            .score(calculateScore(allIssues))
            .build();
    }

    private String buildDescription(List<NodeDto> nodes, List<EdgeDto> edges) {
        if (nodes == null || nodes.isEmpty()) return "No components in the architecture.";
        StringBuilder sb = new StringBuilder("System components: ");
        nodes.forEach(n -> sb.append(n.getLabel()).append(" (").append(n.getType()).append("), "));
        sb.append("\nConnections: ");
        if (edges != null) {
            edges.forEach(e -> {
                String from = nodes.stream()
                    .filter(n -> n.getId().equals(e.getSource()))
                    .findFirst().map(NodeDto::getLabel).orElse(e.getSource());
                String to = nodes.stream()
                    .filter(n -> n.getId().equals(e.getTarget()))
                    .findFirst().map(NodeDto::getLabel).orElse(e.getTarget());
                sb.append(from).append(" -> ").append(to).append(", ");
            });
        }
        return sb.toString();
    }

    private String callLLM(String description) {
        if ("default-key".equals(apiKey) || apiKey == null || apiKey.isBlank()) {
            log.warn("No API key configured. Returning mock review response.");
            return "{\"issues\":[],\"recommendations\":[{\"title\":\"Mock API\",\"description\":\"Please provide a valid API key for full analysis.\"}]}";
        }

        log.info("Calling LLM at {} with model {}", apiUrl, model);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = String.format(
            "You are a senior distributed systems architect. " +
            "Analyze the following architecture and return ONLY valid JSON with this exact structure: " +
            "{\"issues\": [{\"severity\":\"critical|warning|info\",\"component\":\"string\",\"message\":\"string\"}]," +
            "\"recommendations\": [{\"title\":\"string\",\"description\":\"string\"}]}. " +
            "Architecture: %s", description);

        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.3
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(apiUrl, entity, Map.class);
            return extractContent(response);
        } catch (Exception e) {
            log.error("LLM call failed: {}", e.getMessage());
            return "{}";
        }
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("Failed to extract content from LLM response: {}", e.getMessage());
            return "{}";
        }
    }

    private LLMReview parseLLMResponse(String llmResponse) {
        try {
            // Strip markdown code fences if present
            String cleaned = llmResponse
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
            return objectMapper.readValue(cleaned, LLMReview.class);
        } catch (Exception e) {
            log.warn("Could not parse LLM response as JSON: {}", e.getMessage());
            return new LLMReview();
        }
    }

    private int calculateScore(List<ReviewIssue> issues) {
        int score = 100;
        if (issues == null) return score;
        for (ReviewIssue issue : issues) {
            score -= switch (issue.getSeverity()) {
                case "critical" -> 20;
                case "warning"  -> 10;
                case "info"     -> 3;
                default -> 0;
            };
        }
        return Math.max(0, score);
    }
}
