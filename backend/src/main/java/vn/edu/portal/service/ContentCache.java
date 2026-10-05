package vn.edu.portal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Tiny in-memory read-through cache for public listings. The database is remote
 * (each round trip is ~250 ms), so serving unchanged lists from memory keeps
 * page loads fast. Any admin write clears the whole cache, so content stays fresh.
 */
@Component
public class ContentCache {
    private record Entry(Object value, long expiresAt) {}

    private final long ttlMillis;
    private final Map<String, Entry> entries = new ConcurrentHashMap<>();
    private final Map<String, Object> locks = new ConcurrentHashMap<>();

    public ContentCache(@Value("${app.cache.ttl-seconds:60}") long ttlSeconds) {
        this.ttlMillis = Math.max(0, ttlSeconds) * 1000L;
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key, Supplier<T> loader) {
        if (ttlMillis == 0) return loader.get();
        Entry entry = entries.get(key);
        if (entry != null && entry.expiresAt() > System.currentTimeMillis()) return (T) entry.value();

        // One loader per key: concurrent misses wait for the first query instead of all hitting the DB.
        synchronized (locks.computeIfAbsent(key, k -> new Object())) {
            entry = entries.get(key);
            if (entry != null && entry.expiresAt() > System.currentTimeMillis()) return (T) entry.value();
            T value = loader.get();
            entries.put(key, new Entry(value, System.currentTimeMillis() + ttlMillis));
            return value;
        }
    }

    public void clear() {
        entries.clear();
    }

    /**
     * Clears once the surrounding transaction commits; clearing earlier would let a
     * concurrent reader re-cache the pre-commit state for a full TTL.
     */
    public void clearAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    clear();
                }
            });
        } else {
            clear();
        }
    }
}
