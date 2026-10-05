package vn.edu.portal.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.edu.portal.entity.Role;
import vn.edu.portal.entity.User;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * Stateless HMAC-SHA256 bearer tokens: {@code base64url(userId|role|expiry).base64url(signature)}.
 */
@Component
public class TokenService {
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final byte[] secret;
    private final Duration ttl;

    public TokenService(@Value("${app.auth.secret:}") String configuredSecret,
                        @Value("${app.auth.token-ttl-hours:8}") long ttlHours) {
        if (configuredSecret == null || configuredSecret.length() < 32) {
            byte[] random = new byte[32];
            new SecureRandom().nextBytes(random);
            this.secret = random;
            log.warn("APP_AUTH_SECRET is missing or shorter than 32 characters - using a random secret. "
                    + "Admin sessions will be invalidated on every restart.");
        } else {
            this.secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }
        this.ttl = Duration.ofHours(Math.max(1, ttlHours));
    }

    public record IssuedToken(String token, Instant expiresAt) {}

    public IssuedToken issue(User user) {
        Instant expiresAt = Instant.now().plus(ttl);
        String payload = user.getId() + "|" + user.getRole().name() + "|" + expiresAt.getEpochSecond();
        String encodedPayload = ENCODER.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return new IssuedToken(encodedPayload + "." + ENCODER.encodeToString(sign(encodedPayload)), expiresAt);
    }

    public Optional<AuthUser> verify(String token) {
        if (token == null) return Optional.empty();
        int dot = token.indexOf('.');
        if (dot <= 0 || dot == token.length() - 1) return Optional.empty();
        String encodedPayload = token.substring(0, dot);
        try {
            byte[] signature = DECODER.decode(token.substring(dot + 1));
            if (!MessageDigest.isEqual(sign(encodedPayload), signature)) return Optional.empty();
            String[] parts = new String(DECODER.decode(encodedPayload), StandardCharsets.UTF_8).split("\\|");
            if (parts.length != 3) return Optional.empty();
            if (Instant.now().getEpochSecond() >= Long.parseLong(parts[2])) return Optional.empty();
            return Optional.of(new AuthUser(UUID.fromString(parts[0]), Role.valueOf(parts[1])));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    private byte[] sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HmacSHA256 is not available", e);
        }
    }
}
