package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Every piece of content (article, static page, notice, document) is a post filed
 * under one category. The document fields are only filled for DOCUMENT_LIST
 * categories; keeping them here lets an entry switch type without moving rows.
 */
@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @ToString.Exclude
    private User author;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "cover_url", columnDefinition = "TEXT")
    private String coverUrl;

    @Column(nullable = false)
    @Builder.Default
    private String status = ContentStatus.PUBLISHED; // PUBLISHED, DRAFT, HIDDEN

    /** Pinned posts are listed first and flagged as important. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean pinned = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer views = 0;

    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;

    @Column(name = "document_number")
    private String documentNumber;

    private String issuer;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    private String recipient;

    @Column(name = "action_required", columnDefinition = "TEXT")
    private String actionRequired;

    /** Lower-case, accent-free title/summary/number, maintained on save for accent-insensitive search. */
    @Column(name = "search_text", columnDefinition = "TEXT")
    private String searchText;

    @Formula("(select count(*) from post_attachments a where a.post_id = id)")
    @Setter(AccessLevel.NONE)
    private Integer attachmentCount;

    // Excluded from Lombok's toString/equals/hashCode: the bidirectional links back
    // to Post would otherwise recurse forever and force lazy loading.
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PostBlock> blocks = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PostAttachment> attachments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
