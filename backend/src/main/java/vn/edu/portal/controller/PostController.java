package vn.edu.portal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.dto.PostDtos.PageResponse;
import vn.edu.portal.dto.PostDtos.PostDetail;
import vn.edu.portal.dto.PostDtos.PostRequest;
import vn.edu.portal.dto.PostDtos.PostSummary;
import vn.edu.portal.entity.PageType;
import vn.edu.portal.security.AdminAuthInterceptor;
import vn.edu.portal.service.PostService;
import vn.edu.portal.service.PostService.PostQuery;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    /**
     * Paged summaries, pinned first then newest. Visitors only get published posts in visible entries.
     *
     * @param category    category slug (a GROUP also includes its children)
     * @param descendants include the children of a non-GROUP category too
     * @param type        comma-separated page types, e.g. {@code POST_LIST,DOCUMENT_LIST}
     * @param q           accent-insensitive search
     * @param status      admin only
     * @param pinned      {@code true} = only pinned (featured) posts, e.g. for the home slider
     */
    @GetMapping
    public PageResponse<PostSummary> list(@RequestParam(required = false) String category,
                                          @RequestParam(defaultValue = "false") boolean descendants,
                                          @RequestParam(required = false) String type,
                                          @RequestParam(required = false) String q,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(required = false) Boolean pinned,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "12") int size,
                                          HttpServletRequest request) {
        PostQuery query = new PostQuery(category, descendants, parseTypes(type), q, status, pinned, page, size);
        return service.list(query, AdminAuthInterceptor.isAdmin(request));
    }

    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<PostDetail> getBySlug(@PathVariable String slug, HttpServletRequest request) {
        var post = AdminAuthInterceptor.isAdmin(request) ? service.findAnyBySlug(slug) : service.findPublishedBySlug(slug);
        return post.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Admin only (any status); visitors read posts by slug. */
    @GetMapping("/{id}")
    public ResponseEntity<PostDetail> getById(@PathVariable UUID id) {
        return service.findAny(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Public, unauthenticated view counter (single atomic UPDATE). */
    @PostMapping("/{id}/views")
    public ResponseEntity<Void> registerView(@PathVariable UUID id) {
        return service.registerView(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping
    public PostDetail create(@RequestBody PostRequest body, HttpServletRequest request) {
        return service.create(body, AdminAuthInterceptor.currentUser(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDetail> update(@PathVariable UUID id, @RequestBody PostRequest body) {
        return service.update(id, body).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return service.delete(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    private static List<PageType> parseTypes(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        try {
            return Arrays.stream(raw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> PageType.valueOf(s.toUpperCase(Locale.ROOT)))
                    .distinct()
                    .sorted()
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kiểu trang không hợp lệ: " + raw);
        }
    }
}
