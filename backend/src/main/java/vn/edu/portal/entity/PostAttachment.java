package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/** A downloadable file (PDF, Word, Excel...) attached to a post. */
@Entity
@Table(name = "post_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Post post;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
