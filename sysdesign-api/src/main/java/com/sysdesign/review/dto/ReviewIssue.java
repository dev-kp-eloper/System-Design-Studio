package com.sysdesign.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewIssue {
    private String severity;
    private String component;
    private String message;

    public static ReviewIssue critical(String component, String message) {
        return ReviewIssue.builder().severity("critical").component(component).message(message).build();
    }

    public static ReviewIssue warning(String component, String message) {
        return ReviewIssue.builder().severity("warning").component(component).message(message).build();
    }

    public static ReviewIssue info(String component, String message) {
        return ReviewIssue.builder().severity("info").component(component).message(message).build();
    }
}
