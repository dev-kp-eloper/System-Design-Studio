package com.sysdesign.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sysdesign.review.dto.ArchitectureReview;
import com.sysdesign.review.dto.ReviewRequest;
import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = ReviewController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
    },
    excludeFilters = {
        @org.springframework.context.annotation.ComponentScan.Filter(
            type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
            classes = {
                com.sysdesign.auth.SecurityConfig.class,
                com.sysdesign.auth.JwtAuthFilter.class
            }
        )
    }
)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIReviewService aiReviewService;

    @Test
    void testReviewEndpointSuccess() throws Exception {
        NodeDto node = new NodeDto();
        node.setId("1");
        node.setType("database");
        node.setLabel("DB");
        node.setReplicas(2);

        ReviewRequest request = new ReviewRequest();
        request.setNodes(List.of(node));
        request.setEdges(List.of());

        ArchitectureReview mockReview = ArchitectureReview.builder()
            .score(90)
            .issues(List.of())
            .recommendations(List.of())
            .build();

        when(aiReviewService.review(any(), any())).thenReturn(mockReview);

        mockMvc.perform(post("/api/review/local-arch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.score").value(90))
            .andExpect(jsonPath("$.issues").isEmpty())
            .andExpect(jsonPath("$.recommendations").isEmpty());
    }

    @Test
    void testReviewEndpointBadRequestForInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/review/local-arch")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json payload"))
            .andExpect(status().isBadRequest());
    }
}
