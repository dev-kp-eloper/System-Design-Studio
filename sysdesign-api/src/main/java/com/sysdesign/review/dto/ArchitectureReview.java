package com.sysdesign.review.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ArchitectureReview {
    private List<ReviewIssue> issues;
    private List<Recommendation> recommendations;
    private int score;
}
