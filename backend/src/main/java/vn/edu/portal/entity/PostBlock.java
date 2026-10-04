package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "post_blocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostBlockType type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
