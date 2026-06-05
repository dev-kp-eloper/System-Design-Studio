package com.sysdesign.simulation;

import com.sysdesign.simulation.dto.SimulationRequest;
import com.sysdesign.simulation.dto.SimulationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationService {

    private final SimulationEngine engine;
    private final RedisTemplate<String, SimulationResult> redisTemplate;
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    public SimulationResult simulate(SimulationRequest request) {
        String cacheKey = buildCacheKey(request);

        // Check cache
        SimulationResult cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Cache hit for key: {}", cacheKey);
            return cached;
        }

        // Run simulation
        SimulationResult result = engine.simulate(
            request.getNodes(), request.getEdges(), request.getHttpRequest()
        );

        // Store in cache
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);

        return result;
    }

    private String buildCacheKey(SimulationRequest request) {
        // Hash the architecture + request type
        String payload = request.getArchitectureId() + ":" + request.getHttpRequest();
        return "sim:" + DigestUtils.md5DigestAsHex(payload.getBytes());
    }
}
