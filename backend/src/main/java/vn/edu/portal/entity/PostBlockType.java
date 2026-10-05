package vn.edu.portal.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Locale;

public enum PostBlockType {
    TEXT, IMAGE;

    /** Accepts "text", "Text", "TEXT"... so clients do not fail on letter case. */
    @JsonCreator
    public static PostBlockType from(String value) {
        if (value == null || value.isBlank()) return TEXT;
        return valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
