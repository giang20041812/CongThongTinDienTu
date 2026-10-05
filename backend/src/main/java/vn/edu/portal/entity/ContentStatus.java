package vn.edu.portal.entity;

import java.util.Locale;

/**
 * Canonical publication states shared by posts and announcements.
 * The admin UI historically sent Vietnamese labels ("Đã đăng", "Bản nháp"),
 * so every write goes through {@link #normalize(String)}.
 */
public final class ContentStatus {
    public static final String PUBLISHED = "PUBLISHED";
    public static final String DRAFT = "DRAFT";
    public static final String HIDDEN = "HIDDEN";

    private ContentStatus() {}

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) return PUBLISHED;
        String value = raw.trim();
        switch (value.toLowerCase(Locale.ROOT)) {
            case "published", "đã đăng", "da dang":
                return PUBLISHED;
            case "draft", "bản nháp", "ban nhap":
                return DRAFT;
            case "hidden", "ẩn", "an":
                return HIDDEN;
            default:
                return value.toUpperCase(Locale.ROOT);
        }
    }
}
