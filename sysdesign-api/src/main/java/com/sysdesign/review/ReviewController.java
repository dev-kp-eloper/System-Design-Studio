package com.sysdesign.review;

import com.sysdesign.review.dto.ArchitectureReview;
import com.sysdesign.review.dto.ReviewRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final AIReviewService aiReviewService;

    @PostMapping("/{architectureId}")
    public ArchitectureReview review(
            @PathVariable String architectureId,
            @RequestBody ReviewRequest request) {
        return aiReviewService.review(request.getNodes(), request.getEdges());
    }
}
