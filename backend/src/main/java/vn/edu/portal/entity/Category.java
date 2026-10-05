package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A menu entry. The category tree (two levels: root headings and their children)
 * is the site navigation; {@link #pageType} decides how the entry is rendered.
 * The parent is a plain id column, so serializing a category never walks the tree.
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false)
    private String name;

    /** Unique across the site; the entry is served at {@code /{slug}}. */
    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "page_type", nullable = false)
    @Builder.Default
    private PageType pageType = PageType.POST_LIST;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean visible = true;

    @Column(name = "show_on_home", nullable = false)
    @Builder.Default
    private Boolean showOnHome = false;

    @Column(name = "external_url")
    private String externalUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
