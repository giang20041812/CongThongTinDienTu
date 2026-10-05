package vn.edu.portal.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Admin-only uploads (auth enforced by AdminAuthInterceptor): images for posts, documents for attachments. */
@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {
    private static final Logger log = LoggerFactory.getLogger(ImageUploadController.class);
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> DOCUMENT_EXTENSIONS = Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "txt", "zip", "rar");
    private static final long MAX_DOCUMENT_BYTES = 10L * 1024 * 1024;

    private final Cloudinary cloudinary;

    public ImageUploadController(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @PostMapping
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tệp tải lên đang trống."));
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF."));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ảnh vượt quá dung lượng 5 MB."));
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("resource_type", "image"));
            return ResponseEntity.ok(Map.of("url", secureUrl(uploadResult)));
        } catch (IOException | RuntimeException e) {
            log.error("Cloudinary upload failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể tải ảnh lên. Vui lòng thử lại."));
        }
    }

    /** Document attachments (PDF, Word, Excel...), stored as Cloudinary "raw" files keeping their extension. */
    @PostMapping("/file")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tệp tải lên đang trống."));
        }
        String original = file.getOriginalFilename() == null ? "tep-dinh-kem" : file.getOriginalFilename();
        int dot = original.lastIndexOf('.');
        String extension = dot < 0 ? "" : original.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!DOCUMENT_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận tệp PDF, Word, Excel, PowerPoint, TXT, ZIP hoặc RAR."));
        }
        if (file.getSize() > MAX_DOCUMENT_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tệp vượt quá dung lượng 10 MB."));
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "public_id", vn.edu.portal.service.Slugs.of(original.substring(0, Math.max(dot, 0))) + "-"
                            + Long.toString(System.currentTimeMillis(), 36) + "." + extension));
            return ResponseEntity.ok(Map.of(
                    "url", secureUrl(uploadResult),
                    "name", original,
                    "sizeBytes", file.getSize(),
                    "mimeType", file.getContentType() == null ? "application/octet-stream" : file.getContentType()));
        } catch (IOException | RuntimeException e) {
            log.error("Cloudinary document upload failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể tải tệp lên. Vui lòng thử lại."));
        }
    }

    private static String secureUrl(Map<?, ?> uploadResult) {
        Object url = uploadResult.get("secure_url") != null ? uploadResult.get("secure_url") : uploadResult.get("url");
        return String.valueOf(url);
    }
}
