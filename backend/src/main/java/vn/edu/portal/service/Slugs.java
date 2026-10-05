package vn.edu.portal.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/** ASCII URL slugs for Vietnamese titles: "Lễ khai giảng 2026" -> "le-khai-giang-2026". */
public final class Slugs {
    private static final Pattern MARKS = Pattern.compile("\\p{M}+");
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");
    private static final Pattern EDGE_DASHES = Pattern.compile("(^-+|-+$)");
    private static final int MAX_LENGTH = 90;

    private Slugs() {}

    public static String of(String input) {
        if (input == null) return "bai-viet";
        String ascii = MARKS.matcher(Normalizer.normalize(input, Normalizer.Form.NFD)).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D')
                .toLowerCase(Locale.ROOT);
        String slug = EDGE_DASHES.matcher(NON_ALNUM.matcher(ascii).replaceAll("-")).replaceAll("");
        if (slug.length() > MAX_LENGTH) {
            slug = EDGE_DASHES.matcher(slug.substring(0, MAX_LENGTH)).replaceAll("");
        }
        return slug.isEmpty() ? "bai-viet" : slug;
    }

    /** Accent-free, lower-case words joined by single spaces ("Khai giảng!" -> "khai giang"), for search. */
    public static String searchable(String... parts) {
        StringBuilder joined = new StringBuilder();
        for (String part : parts) {
            if (part != null && !part.isBlank()) joined.append(part).append(' ');
        }
        String ascii = MARKS.matcher(Normalizer.normalize(joined.toString(), Normalizer.Form.NFD)).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D')
                .toLowerCase(Locale.ROOT);
        return NON_ALNUM.matcher(ascii).replaceAll(" ").trim();
    }
}
