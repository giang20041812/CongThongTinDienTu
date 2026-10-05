package vn.edu.portal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.entity.Feedback;
import vn.edu.portal.entity.FeedbackStatus;
import vn.edu.portal.repository.FeedbackRepository;
import vn.edu.portal.security.SubmissionRateLimiter;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/** Public "Góp ý – Phản hồi" form (POST); reading and handling feedback is admin-only. */
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern PHONE = Pattern.compile("^[0-9+().\\s-]{8,20}$");

    /** {@code website} is a honeypot: real visitors never see or fill it. */
    public record FeedbackRequest(String fullName, String email, String phone, String subject, String content, String website) {}

    public record FeedbackUpdate(FeedbackStatus status, String note) {}

    private final FeedbackRepository repository;
    private final SubmissionRateLimiter limiter;

    public FeedbackController(FeedbackRepository repository, SubmissionRateLimiter limiter) {
        this.repository = repository;
        this.limiter = limiter;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(@RequestBody FeedbackRequest body, HttpServletRequest request) {
        Map<String, String> thanks = Map.of("message", "Cảm ơn bạn! Nhà trường đã nhận được góp ý.");
        if (body == null) throw badRequest("Dữ liệu gửi lên không hợp lệ.");
        if (body.website() != null && !body.website().isBlank()) return ResponseEntity.status(HttpStatus.CREATED).body(thanks);
        if (!limiter.tryAcquire(request.getRemoteAddr())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đã gửi quá nhiều góp ý. Vui lòng thử lại sau.");
        }

        String name = limit(body.fullName(), 100, "Họ và tên");
        String content = limit(body.content(), 3000, "Nội dung góp ý");
        if (name == null) throw badRequest("Vui lòng nhập họ và tên.");
        if (content == null) throw badRequest("Vui lòng nhập nội dung góp ý.");
        String email = limit(body.email(), 150, "Email");
        String phone = limit(body.phone(), 20, "Số điện thoại");
        if (email != null && !EMAIL.matcher(email).matches()) throw badRequest("Email không hợp lệ.");
        if (phone != null && !PHONE.matcher(phone).matches()) throw badRequest("Số điện thoại không hợp lệ.");

        Feedback feedback = new Feedback();
        feedback.setFullName(name);
        feedback.setEmail(email);
        feedback.setPhone(phone);
        feedback.setSubject(limit(body.subject(), 200, "Tiêu đề"));
        feedback.setContent(content);
        feedback.setStatus(FeedbackStatus.NEW);
        repository.save(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(thanks);
    }

    @GetMapping
    public List<Feedback> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> update(@PathVariable UUID id, @RequestBody FeedbackUpdate body) {
        return repository.findById(id).map(existing -> {
            if (body.status() != null) existing.setStatus(body.status());
            if (body.note() != null) existing.setNote(body.note().isBlank() ? null : body.note().trim());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private static String limit(String value, int max, String field) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        if (trimmed.length() > max) throw badRequest(field + " tối đa " + max + " ký tự.");
        return trimmed;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
