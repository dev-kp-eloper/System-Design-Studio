package com.sysdesign.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LLMReview {
    private List<ReviewIssue> issues;
    private List<Recommendation> recommendations;
}
