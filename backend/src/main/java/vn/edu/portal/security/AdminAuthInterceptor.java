package vn.edu.portal.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * Public visitors may only read (except feedback and post-by-id) and may submit feedback.
 * Every other write (and all of /api/users, /api/post-blocks) requires a valid admin
 * bearer token issued by {@code POST /api/auth/login}.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {
    public static final String AUTH_USER_ATTRIBUTE = "portal.authUser";

    private static final Pattern VIEW_COUNTER = Pattern.compile("^/api/posts/[^/]+/views/?$");
    /** Post lookup by id serves drafts too; visitors read published posts via /api/posts/by-slug/. */
    private static final Pattern POST_BY_ID = Pattern.compile("^/api/posts/[0-9a-fA-F-]{36}/?$");
    private static final String FEEDBACK = "/api/feedback";

    private final TokenService tokenService;

    public AdminAuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public static AuthUser currentUser(HttpServletRequest request) {
        Object user = request.getAttribute(AUTH_USER_ATTRIBUTE);
        return user instanceof AuthUser authUser ? authUser : null;
    }

    public static boolean isAdmin(HttpServletRequest request) {
        AuthUser user = currentUser(request);
        return user != null && user.isAdmin();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        String header = request.getHeader("Authorization");
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            tokenService.verify(header.substring(7).trim())
                    .ifPresent(user -> request.setAttribute(AUTH_USER_ATTRIBUTE, user));
        }

        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (!requiresAdmin(method, path) || isAdmin(request)) return true;

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Bạn cần đăng nhập quản trị để thực hiện thao tác này.\"}");
        return false;
    }

    private static boolean requiresAdmin(String method, String path) {
        if (path.startsWith("/api/users") || path.startsWith("/api/post-blocks")) return true;
        boolean read = "GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method);
        if (read) return path.startsWith(FEEDBACK) || POST_BY_ID.matcher(path).matches();
        return !("POST".equalsIgnoreCase(method)
                && (path.equals("/api/auth/login") || VIEW_COUNTER.matcher(path).matches()
                    || path.equals(FEEDBACK) || path.equals(FEEDBACK + "/")));
    }
}
