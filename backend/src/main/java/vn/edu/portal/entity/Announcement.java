package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String status = "PUBLISHED"; // PUBLISHED, DRAFT, HIDDEN

    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "department")
    private String department;

    @Column(name = "is_important")
    private Boolean isImportant = false;

    @Column(name = "file_attachment_url")
    private String fileAttachmentUrl;

    @Column(name = "file_attachment_name")
    private String fileAttachmentName;

    @Column(name = "announcement_number")
    private String announcementNumber;

    @Column(name = "recipient")
    private String recipient;

    @Column(columnDefinition = "TEXT", name = "action_required")
    private String actionRequired;
}
