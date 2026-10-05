package vn.edu.portal.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Locks a (client, username) pair for a while after repeated failed logins. */
@Component
public class LoginAttemptLimiter {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCK = Duration.ofMinutes(5);

    private record Attempts(int failures, Instant windowStart, Instant lockedUntil) {}

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String key) {
        Attempts current = attempts.get(key);
        return current != null && current.lockedUntil() != null && Instant.now().isBefore(current.lockedUntil());
    }

    public void recordFailure(String key) {
        Instant now = Instant.now();
        attempts.compute(key, (k, current) -> {
            if (current == null || now.isAfter(current.windowStart().plus(WINDOW))) {
                return new Attempts(1, now, null);
            }
            int failures = current.failures() + 1;
            return new Attempts(failures, current.windowStart(), failures >= MAX_FAILURES ? now.plus(LOCK) : null);
        });
        if (attempts.size() > 10_000) {
            attempts.entrySet().removeIf(e -> now.isAfter(e.getValue().windowStart().plus(WINDOW)));
        }
    }

    public void recordSuccess(String key) {
        attempts.remove(key);
    }
}
