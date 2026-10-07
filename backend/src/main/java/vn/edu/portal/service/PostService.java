package vn.edu.portal.service;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.dto.PostDtos.*;
import vn.edu.portal.entity.*;
import vn.edu.portal.repository.PostRepository;
import vn.edu.portal.repository.UserRepository;
import vn.edu.portal.security.AuthUser;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PostService {
    private static final int MAX_PAGE_SIZE = 50;
    private static final int SUMMARY_LENGTH = 220;
    private static final int MAX_PHOTOS = 24;
    /** The gallery shows a few photos of each event rather than one album filling it. */
    private static final int PHOTOS_PER_POST = 2;
    /** Rows scanned to pick the gallery from (duplicates and extra photos per post are skipped). */
    private static final int PHOTO_SCAN = 400;

    /**
     * @param category    category slug; a GROUP (or {@code descendants=true}) also covers its children
     * @param types       only categories of these page types
     * @param q           accent-insensitive search terms
     * @param status      admin-only status filter (visitors always get PUBLISHED)
     * @param pinned      only pinned (featured) posts when true
     */
    public record PostQuery(String category, boolean descendants, List<PageType> types, String q,
                            String status, Boolean pinned, int page, int size) {}

    private final PostRepository posts;
    private final CategoryService categories;
    private final UserRepository users;
    private final ContentCache cache;

    public PostService(PostRepository posts, CategoryService categories, UserRepository users, ContentCache cache) {
        this.posts = posts;
        this.categories = categories;
        this.users = users;
        this.cache = cache;
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummary> list(PostQuery query, boolean admin) {
        if (admin) return search(query, true);
        return cache.get("posts:" + query, () -> search(query, false));
    }

    @Transactional(readOnly = true)
    public Optional<PostDetail> findPublishedBySlug(String slug) {
        return cache.get("post:" + slug, () -> posts.findWithDetailsBySlug(slug)
                .filter(p -> ContentStatus.PUBLISHED.equals(p.getStatus()))
                .filter(p -> categories.findBySlug(p.getCategory().getSlug(), false).isPresent())
                .map(PostDetail::of));
    }

    @Transactional(readOnly = true)
    public Optional<PostDetail> findAnyBySlug(String slug) {
        return posts.findWithDetailsBySlug(slug).map(PostDetail::of);
    }

    @Transactional(readOnly = true)
    public Optional<PostDetail> findAny(UUID id) {
        return posts.findWithDetailsById(id).map(PostDetail::of);
    }

    /** Newest photos of published posts in visible entries, for the home gallery. */
    @Transactional(readOnly = true)
    public List<PhotoItem> recentPhotos(int limit) {
        int size = Math.min(Math.max(limit, 1), MAX_PHOTOS);
        return cache.get("photos:" + size, () -> {
            List<UUID> visible = categories.listPublic().stream().map(Category::getId).toList();
            if (visible.isEmpty()) return List.of();
            Set<String> seen = new HashSet<>();
            Map<String, Integer> perPost = new HashMap<>();
            List<PhotoItem> photos = new ArrayList<>();
            for (PostRepository.PhotoRow row : posts.findPhotos(ContentStatus.PUBLISHED, visible, PHOTO_SCAN)) {
                if (!seen.add(row.getUrl()) || perPost.merge(row.getSlug(), 1, Integer::sum) > PHOTOS_PER_POST) continue;
                photos.add(new PhotoItem(row.getUrl(), row.getTitle(), row.getSlug()));
                if (photos.size() == size) break;
            }
            return List.copyOf(photos);
        });
    }

    public boolean registerView(UUID id) {
        // Deliberately does not clear the cache: view counts may lag by one TTL.
        return posts.incrementViews(id, ContentStatus.PUBLISHED) > 0;
    }

    @Transactional
    public PostDetail create(PostRequest input, AuthUser actor) {
        Post post = new Post();
        post.setTitle(requireText(input.title(), "Tiêu đề bài viết"));
        post.setCategory(categories.requirePostTarget(input.categoryId()));
        post.setAuthor(resolveAuthor(actor));
        post.setStatus(ContentStatus.normalize(input.status()));
        post.setPinned(Boolean.TRUE.equals(input.pinned()));
        post.setPublishedAt(input.publishedAt() == null ? LocalDateTime.now() : input.publishedAt());
        post.setViews(0);
        post.setSlug(uniqueSlug(input.slug(), post.getTitle(), null, null));
        applyOptionalFields(post, input);
        replaceBlocks(post, input.blocks());
        replaceAttachments(post, input.attachments());
        finish(post);
        Post saved = posts.save(post);
        cache.clearAfterCommit();
        return PostDetail.of(saved);
    }

    /** Partial update: null fields are left unchanged; views, author and timestamps are never client-writable. */
    @Transactional
    public Optional<PostDetail> update(UUID id, PostRequest input) {
        return posts.findWithDetailsById(id).map(existing -> {
            if (input.title() != null) existing.setTitle(requireText(input.title(), "Tiêu đề bài viết"));
            if (input.categoryId() != null) existing.setCategory(categories.requirePostTarget(input.categoryId()));
            if (input.status() != null) existing.setStatus(ContentStatus.normalize(input.status()));
            if (input.pinned() != null) existing.setPinned(input.pinned());
            if (input.publishedAt() != null) existing.setPublishedAt(input.publishedAt());
            if (input.slug() != null && !input.slug().isBlank()) {
                existing.setSlug(uniqueSlug(input.slug(), existing.getTitle(), existing.getId(), existing.getSlug()));
            }
            applyOptionalFields(existing, input);
            if (input.blocks() != null) replaceBlocks(existing, input.blocks());
            if (input.attachments() != null) replaceAttachments(existing, input.attachments());
            finish(existing);
            cache.clearAfterCommit();
            return PostDetail.of(existing);
        });
    }

    @Transactional
    public boolean delete(UUID id) {
        return posts.findById(id).map(post -> {
            posts.delete(post);
            cache.clearAfterCommit();
            return true;
        }).orElse(false);
    }

    private PageResponse<PostSummary> search(PostQuery query, boolean admin) {
        int size = Math.min(Math.max(query.size(), 1), MAX_PAGE_SIZE);
        int page = Math.max(query.page(), 0);

        Set<UUID> categoryIds = resolveCategoryIds(query, admin);
        if (categoryIds != null && categoryIds.isEmpty()) return new PageResponse<>(List.of(), page, size, 0, 0);

        String status = admin
                ? (query.status() == null || query.status().isBlank() ? null : ContentStatus.normalize(query.status()))
                : ContentStatus.PUBLISHED;
        List<String> terms = query.q() == null ? List.of()
                : Arrays.stream(Slugs.searchable(query.q()).split(" ")).filter(t -> !t.isBlank()).limit(8).toList();

        Specification<Post> spec = (root, cq, cb) -> {
            List<Predicate> where = new ArrayList<>();
            if (categoryIds != null) where.add(root.get("category").get("id").in(categoryIds));
            if (status != null) where.add(cb.equal(root.get("status"), status));
            if (query.pinned() != null) where.add(cb.equal(root.get("pinned"), query.pinned()));
            for (String term : terms) where.add(cb.like(root.get("searchText"), "%" + term + "%"));
            return cb.and(where.toArray(Predicate[]::new));
        };
        Sort sort = admin
                ? Sort.by(Sort.Order.desc("publishedAt"), Sort.Order.desc("createdAt"))
                : Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("publishedAt"), Sort.Order.desc("createdAt"));

        Page<Post> result = posts.findAll(spec, PageRequest.of(page, size, sort));
        return new PageResponse<>(result.getContent().stream().map(PostSummary::of).toList(),
                page, size, result.getTotalElements(), result.getTotalPages());
    }

    /** null = no category restriction; an empty set = nothing can match. */
    private Set<UUID> resolveCategoryIds(PostQuery query, boolean admin) {
        List<Category> pool = admin ? categories.listAll() : categories.listPublic();
        Set<UUID> ids = null;

        if (query.category() != null && !query.category().isBlank()) {
            Optional<Category> found = pool.stream().filter(c -> c.getSlug().equalsIgnoreCase(query.category().trim())).findFirst();
            if (found.isEmpty()) return Set.of();
            Category category = found.get();
            ids = query.descendants() || category.getPageType() == PageType.GROUP
                    ? categories.withChildren(category, pool)
                    : new HashSet<>(Set.of(category.getId()));
        }
        if (query.types() != null && !query.types().isEmpty()) {
            Set<UUID> ofType = new HashSet<>();
            pool.stream().filter(c -> query.types().contains(c.getPageType())).forEach(c -> ofType.add(c.getId()));
            if (ids == null) ids = ofType;
            else ids.retainAll(ofType);
        }
        if (!admin) {
            // Visitors never see posts filed under hidden entries.
            Set<UUID> visible = new HashSet<>();
            pool.forEach(c -> visible.add(c.getId()));
            if (ids == null) ids = visible;
            else ids.retainAll(visible);
        }
        return ids;
    }

    private static void applyOptionalFields(Post post, PostRequest input) {
        if (input.summary() != null) post.setSummary(blankToNull(input.summary()));
        if (input.coverUrl() != null) post.setCoverUrl(blankToNull(input.coverUrl()));
        if (input.documentNumber() != null) post.setDocumentNumber(blankToNull(input.documentNumber()));
        if (input.issuer() != null) post.setIssuer(blankToNull(input.issuer()));
        if (input.issuedDate() != null) post.setIssuedDate(input.issuedDate());
        if (input.recipient() != null) post.setRecipient(blankToNull(input.recipient()));
        if (input.actionRequired() != null) post.setActionRequired(blankToNull(input.actionRequired()));
    }

    /** Derives the summary from the body when the editor left it empty, and refreshes the search index column. */
    private static void finish(Post post) {
        if (post.getSummary() == null) {
            post.getBlocks().stream()
                    .filter(b -> b.getType() == PostBlockType.TEXT && b.getContent() != null && !b.getContent().isBlank())
                    .findFirst()
                    .ifPresent(b -> post.setSummary(excerpt(b.getContent())));
        }
        post.setSearchText(Slugs.searchable(post.getTitle(), post.getSummary(), post.getDocumentNumber(), post.getIssuer()));
    }

    private static String excerpt(String text) {
        String flat = text.replaceAll("\\s+", " ").trim();
        if (flat.length() <= SUMMARY_LENGTH) return flat;
        int cut = flat.lastIndexOf(' ', SUMMARY_LENGTH);
        return flat.substring(0, cut > 0 ? cut : SUMMARY_LENGTH) + "…";
    }

    private User resolveAuthor(AuthUser actor) {
        if (actor != null) return users.getReferenceById(actor.id());
        return users.findFirstByRoleOrderByCreatedAtAsc(Role.ADMIN)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Chưa có tài khoản quản trị."));
    }

    private String uniqueSlug(String requested, String title, UUID selfId, String currentSlug) {
        String base = Slugs.of(requested == null || requested.isBlank() ? title : requested);
        if (base.equals(currentSlug)) return base;
        String candidate = base;
        for (int attempt = 0; isSlugTaken(candidate, selfId); attempt++) {
            if (attempt >= 5) throw new ResponseStatusException(HttpStatus.CONFLICT, "Không tạo được đường dẫn duy nhất cho bài viết.");
            candidate = base + "-" + Integer.toHexString(ThreadLocalRandom.current().nextInt(0x1000, 0xFFFFF));
        }
        return candidate;
    }

    private boolean isSlugTaken(String slug, UUID selfId) {
        return selfId == null ? posts.existsBySlug(slug) : posts.existsBySlugAndIdNot(slug, selfId);
    }

    private static void replaceBlocks(Post post, List<BlockRequest> requested) {
        List<PostBlock> target = post.getBlocks();
        target.clear();
        if (requested == null) return;
        int index = 0;
        for (BlockRequest source : requested) {
            if (source == null) continue;
            String content = source.content();
            String imageUrl = blankToNull(source.imageUrl());
            if ((content == null || content.isBlank()) && imageUrl == null) continue;
            PostBlock block = new PostBlock();
            block.setPost(post);
            block.setType(source.type() == null ? PostBlockType.TEXT : source.type());
            block.setContent(content);
            block.setImageUrl(imageUrl);
            block.setOrderIndex(index++);
            target.add(block);
        }
    }

    private static void replaceAttachments(Post post, List<AttachmentRequest> requested) {
        List<PostAttachment> target = post.getAttachments();
        target.clear();
        if (requested == null) return;
        int index = 0;
        for (AttachmentRequest source : requested) {
            if (source == null || blankToNull(source.url()) == null) continue;
            String url = source.url().trim();
            if (!url.startsWith("https://") && !url.startsWith("http://")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn tệp đính kèm phải bắt đầu bằng http:// hoặc https://.");
            }
            PostAttachment attachment = new PostAttachment();
            attachment.setPost(post);
            attachment.setUrl(url);
            attachment.setName(blankToNull(source.name()) == null ? "Tệp đính kèm " + (index + 1) : source.name().trim());
            attachment.setSizeBytes(source.sizeBytes());
            attachment.setMimeType(blankToNull(source.mimeType()));
            attachment.setSortOrder(index++);
            target.add(attachment);
        }
    }

    static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " không được để trống.");
        }
        return value.trim();
    }

    static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
