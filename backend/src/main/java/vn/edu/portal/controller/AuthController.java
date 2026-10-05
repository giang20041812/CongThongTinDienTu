package vn.edu.portal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.portal.entity.Role;
import vn.edu.portal.entity.User;
import vn.edu.portal.repository.UserRepository;
import vn.edu.portal.security.AdminAuthInterceptor;
import vn.edu.portal.security.AuthUser;
import vn.edu.portal.security.LoginAttemptLimiter;
import vn.edu.portal.security.PasswordHasher;
import vn.edu.portal.security.TokenService;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record LoginRequest(String username, String password) {}

    public record LoginResponse(String token, Instant expiresAt, String username, String role) {}

    private final UserRepository users;
    private final TokenService tokens;
    private final LoginAttemptLimiter limiter;

    public AuthController(UserRepository users, TokenService tokens, LoginAttemptLimiter limiter) {
        this.users = users;
        this.tokens = tokens;
        this.limiter = limiter;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body, HttpServletRequest request) {
        String username = body == null || body.username() == null ? "" : body.username().trim();
        String password = body == null || body.password() == null ? "" : body.password();
        String limiterKey = request.getRemoteAddr() + "|" + username.toLowerCase(Locale.ROOT);

        if (limiter.isLocked(limiterKey)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút."));
        }

        Optional<User> found = username.isEmpty() ? Optional.empty() : users.findByUsername(username);
        if (found.isEmpty() || found.get().getRole() != Role.ADMIN
                || !PasswordHasher.matches(password, found.get().getPasswordHash())) {
            limiter.recordFailure(limiterKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tài khoản hoặc mật khẩu chưa đúng."));
        }

        User user = found.get();
        if (!PasswordHasher.isHashed(user.getPasswordHash())) {
            user.setPasswordHash(PasswordHasher.hash(password));
            users.save(user);
        }
        limiter.recordSuccess(limiterKey);
        TokenService.IssuedToken issued = tokens.issue(user);
        return ResponseEntity.ok(new LoginResponse(issued.token(), issued.expiresAt(), user.getUsername(), user.getRole().name()));
    }

    /** Lets the admin app check whether a stored token is still valid. */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        AuthUser current = AdminAuthInterceptor.currentUser(request);
        if (current == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return users.findById(current.id())
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of("username", u.getUsername(), "role", u.getRole().name())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
