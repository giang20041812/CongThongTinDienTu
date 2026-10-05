package vn.edu.portal.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Caps public form submissions (feedback) per client so the inbox cannot be flooded. */
@Component
public class SubmissionRateLimiter {
    private static final int MAX_SUBMISSIONS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(30);

    private record Window(int count, Instant start) {}

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    /** Records an attempt and returns whether it is allowed. */
    public boolean tryAcquire(String key) {
        Instant now = Instant.now();
        Window updated = windows.compute(key, (k, current) ->
                current == null || now.isAfter(current.start().plus(WINDOW))
                        ? new Window(1, now)
                        : new Window(current.count() + 1, current.start()));
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now.isAfter(e.getValue().start().plus(WINDOW)));
        }
        return updated.count() <= MAX_SUBMISSIONS;
    }
}
