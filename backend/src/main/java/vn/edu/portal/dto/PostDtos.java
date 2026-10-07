package vn.edu.portal.dto;

import vn.edu.portal.entity.PageType;
import vn.edu.portal.entity.Post;
import vn.edu.portal.entity.PostAttachment;
import vn.edu.portal.entity.PostBlock;
import vn.edu.portal.entity.PostBlockType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * JSON shapes for posts. Entities are never serialized directly, so lazy relations
 * and back-references cannot leak into (or break) the API.
 */
public final class PostDtos {
    private PostDtos() {}

    public record CategoryRef(UUID id, String name, String slug, PageType pageType) {}

    /** List item: no blocks, so a page of results stays small. */
    public record PostSummary(
            UUID id, String title, String slug, String summary, String coverUrl,
            String status, boolean pinned, int views, LocalDateTime publishedAt,
            CategoryRef category, String author,
            String documentNumber, String issuer, LocalDate issuedDate, int attachmentCount) {

        public static PostSummary of(Post p) {
            return new PostSummary(p.getId(), p.getTitle(), p.getSlug(), p.getSummary(), p.getCoverUrl(),
                    p.getStatus(), Boolean.TRUE.equals(p.getPinned()), p.getViews() == null ? 0 : p.getViews(),
                    p.getPublishedAt(), categoryRef(p), p.getAuthor() == null ? null : p.getAuthor().getUsername(),
                    p.getDocumentNumber(), p.getIssuer(), p.getIssuedDate(),
                    p.getAttachmentCount() == null ? 0 : p.getAttachmentCount());
        }
    }

    public record BlockView(PostBlockType type, String content, String imageUrl) {
        static BlockView of(PostBlock b) {
            return new BlockView(b.getType(), b.getContent(), b.getImageUrl());
        }
    }

    public record AttachmentView(UUID id, String name, String url, Long sizeBytes, String mimeType) {
        static AttachmentView of(PostAttachment a) {
            return new AttachmentView(a.getId(), a.getName(), a.getUrl(), a.getSizeBytes(), a.getMimeType());
        }
    }

    public record PostDetail(
            UUID id, String title, String slug, String summary, String coverUrl,
            String status, boolean pinned, int views, LocalDateTime publishedAt, LocalDateTime updatedAt,
            CategoryRef category, String author,
            String documentNumber, String issuer, LocalDate issuedDate, String recipient, String actionRequired,
            List<BlockView> blocks, List<AttachmentView> attachments) {

        public static PostDetail of(Post p) {
            return new PostDetail(p.getId(), p.getTitle(), p.getSlug(), p.getSummary(), p.getCoverUrl(),
                    p.getStatus(), Boolean.TRUE.equals(p.getPinned()), p.getViews() == null ? 0 : p.getViews(),
                    p.getPublishedAt(), p.getUpdatedAt(), categoryRef(p),
                    p.getAuthor() == null ? null : p.getAuthor().getUsername(),
                    p.getDocumentNumber(), p.getIssuer(), p.getIssuedDate(), p.getRecipient(), p.getActionRequired(),
                    p.getBlocks().stream().map(BlockView::of).toList(),
                    p.getAttachments().stream().map(AttachmentView::of).toList());
        }
    }

    public record BlockRequest(PostBlockType type, String content, String imageUrl) {}

    public record AttachmentRequest(String name, String url, Long sizeBytes, String mimeType) {}

    /** Create/update body. On update, null fields are left unchanged. */
    public record PostRequest(
            String title, String slug, UUID categoryId, String summary, String coverUrl,
            String status, Boolean pinned, LocalDateTime publishedAt,
            String documentNumber, String issuer, LocalDate issuedDate, String recipient, String actionRequired,
            List<BlockRequest> blocks, List<AttachmentRequest> attachments) {}

    public record PageResponse<T>(List<T> items, int page, int size, long total, int totalPages) {}

    /** One photo of the home gallery: a cover or body image, linking back to its post. */
    public record PhotoItem(String url, String title, String slug) {}

    private static CategoryRef categoryRef(Post p) {
        var c = p.getCategory();
        return c == null ? null : new CategoryRef(c.getId(), c.getName(), c.getSlug(), c.getPageType());
    }
}
