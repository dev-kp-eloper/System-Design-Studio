package com.sysdesign.review.dto;

import com.sysdesign.simulation.dto.EdgeDto;
import com.sysdesign.simulation.dto.NodeDto;
import lombok.Data;
import java.util.List;

@Data
public class ReviewRequest {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
}
