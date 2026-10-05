package vn.edu.portal.controller;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.entity.SiteSetting;
import vn.edu.portal.repository.SiteSettingRepository;
import vn.edu.portal.service.ContentCache;

import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

/** Site information shown in the header, footer and contact pages (public read, admin write). */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private static final String CACHE_KEY = "settings";
    private static final Pattern KEY = Pattern.compile("^[a-z][a-z0-9_]{0,49}$");
    private static final int MAX_VALUE_LENGTH = 4000;

    private final SiteSettingRepository repository;
    private final ContentCache cache;

    public SettingsController(SiteSettingRepository repository, ContentCache cache) {
        this.repository = repository;
        this.cache = cache;
    }

    @GetMapping
    public Map<String, String> get() {
        return cache.get(CACHE_KEY, () -> {
            Map<String, String> values = new TreeMap<>();
            repository.findAll().forEach(s -> values.put(s.getKey(), s.getValue() == null ? "" : s.getValue()));
            return Collections.unmodifiableMap(values);
        });
    }

    /** Upserts the given keys; other keys are left untouched. */
    @PutMapping
    @Transactional
    public Map<String, String> update(@RequestBody Map<String, String> body) {
        if (body == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu gửi lên không hợp lệ.");
        body.forEach((key, value) -> {
            if (key == null || !KEY.matcher(key).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khoá cài đặt không hợp lệ: " + key);
            }
            String text = value == null ? "" : value.trim();
            if (text.length() > MAX_VALUE_LENGTH) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị của \"" + key + "\" quá dài.");
            }
            repository.save(new SiteSetting(key, text));
        });
        cache.clearAfterCommit();
        Map<String, String> values = new TreeMap<>();
        repository.findAll().forEach(s -> values.put(s.getKey(), s.getValue() == null ? "" : s.getValue()));
        return values;
    }
}
