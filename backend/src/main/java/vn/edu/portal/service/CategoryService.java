package vn.edu.portal.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.entity.Category;
import vn.edu.portal.entity.PageType;
import vn.edu.portal.repository.CategoryRepository;
import vn.edu.portal.repository.PostRepository;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Owns the menu tree. Rules enforced on every write:
 * at most two levels, a child is never a GROUP, slugs are unique and not reserved,
 * and a category that still holds posts cannot become a GROUP/LINK or be deleted
 * without saying where its posts go.
 */
@Service
public class CategoryService {
    private static final String ALL_KEY = "categories:all";
    /** First path segments the front-end already uses for something else. */
    private static final Set<String> RESERVED_SLUGS = Set.of("admin", "api", "bai-viet", "tim-kiem", "assets", "uploads");

    public record CategoryRequest(UUID parentId, String name, String slug, PageType pageType, Integer sortOrder,
                                  Boolean visible, Boolean showOnHome, String externalUrl, String description) {}

    public record OrderItem(UUID id, UUID parentId, Integer sortOrder) {}

    private final CategoryRepository categories;
    private final PostRepository posts;
    private final ContentCache cache;

    public CategoryService(CategoryRepository categories, PostRepository posts, ContentCache cache) {
        this.categories = categories;
        this.posts = posts;
        this.cache = cache;
    }

    /** Every category, menu order. */
    public List<Category> listAll() {
        return cache.get(ALL_KEY, () -> List.copyOf(categories.findAllByOrderBySortOrderAscNameAsc()));
    }

    /** Categories a visitor may see: visible, and under a visible parent. */
    public List<Category> listPublic() {
        Map<UUID, Category> byId = index(listAll());
        return listAll().stream().filter(c -> isPubliclyVisible(c, byId)).toList();
    }

    public Optional<Category> findBySlug(String slug, boolean includeHidden) {
        return (includeHidden ? listAll() : listPublic()).stream()
                .filter(c -> c.getSlug().equalsIgnoreCase(slug))
                .findFirst();
    }

    /** The category itself plus its direct children (menus have two levels). */
    public Set<UUID> withChildren(Category category, Collection<Category> pool) {
        Set<UUID> ids = new HashSet<>();
        ids.add(category.getId());
        pool.stream().filter(c -> category.getId().equals(c.getParentId())).forEach(c -> ids.add(c.getId()));
        return ids;
    }

    /** Resolves a category a post may be filed under, or fails with a readable message. */
    public Category requirePostTarget(UUID id) {
        if (id == null) throw badRequest("Vui lòng chọn đầu mục cho bài viết.");
        Category category = categories.findById(id).orElseThrow(() -> badRequest("Đầu mục không tồn tại."));
        if (!category.getPageType().holdsPosts()) {
            throw badRequest("Đầu mục \"" + category.getName() + "\" là nhóm/liên kết nên không chứa bài viết. Hãy chọn một mục con.");
        }
        return category;
    }

    @Transactional
    public Category create(CategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        if (request.sortOrder() == null) category.setSortOrder(nextSortOrder(category.getParentId()));
        Category saved = categories.save(category);
        cache.clearAfterCommit();
        return saved;
    }

    @Transactional
    public Optional<Category> update(UUID id, CategoryRequest request) {
        return categories.findById(id).map(existing -> {
            UUID previousParent = existing.getParentId();
            apply(existing, request);
            if (request.sortOrder() == null && !Objects.equals(previousParent, existing.getParentId())) {
                existing.setSortOrder(nextSortOrder(existing.getParentId()));
            }
            cache.clearAfterCommit();
            return existing;
        });
    }

    /** Deletes an entry; its posts must be moved to {@code moveTo} first if it has any. */
    @Transactional
    public boolean delete(UUID id, UUID moveTo) {
        Optional<Category> found = categories.findById(id);
        if (found.isEmpty()) return false;
        if (categories.existsByParentId(id)) {
            throw conflict("Đầu mục đang có mục con. Hãy chuyển hoặc xoá các mục con trước.");
        }
        long count = posts.countByCategoryId(id);
        if (count > 0) {
            if (moveTo == null) {
                throw conflict("Đầu mục đang có " + count + " bài viết. Hãy chọn đầu mục để chuyển các bài viết sang trước khi xoá.");
            }
            if (moveTo.equals(id)) throw badRequest("Không thể chuyển bài viết sang chính đầu mục đang xoá.");
            requirePostTarget(moveTo);
            posts.moveCategory(id, moveTo);
        }
        categories.delete(found.get());
        cache.clearAfterCommit();
        return true;
    }

    /** Applies a whole drag/drop or up/down re-arrangement at once, then validates the resulting tree. */
    @Transactional
    public List<Category> reorder(List<OrderItem> items) {
        if (items == null || items.isEmpty()) return listAll();
        List<Category> all = categories.findAll();
        Map<UUID, Category> byId = index(all);
        for (OrderItem item : items) {
            Category category = byId.get(item.id());
            if (category == null) throw badRequest("Đầu mục không tồn tại: " + item.id());
            category.setParentId(item.parentId());
            if (item.sortOrder() != null) category.setSortOrder(item.sortOrder());
        }
        for (Category category : all) validatePlacement(category, byId, all);
        categories.saveAll(all);
        cache.clearAfterCommit();
        return all.stream()
                .sorted(Comparator.comparing(Category::getSortOrder).thenComparing(Category::getName))
                .toList();
    }

    private void apply(Category target, CategoryRequest request) {
        String name = request.name() == null ? "" : request.name().trim();
        if (name.isEmpty()) throw badRequest("Tên đầu mục không được để trống.");
        if (name.length() > 100) throw badRequest("Tên đầu mục tối đa 100 ký tự.");
        PageType type = request.pageType() == null ? PageType.POST_LIST : request.pageType();

        if (target.getId() != null && !type.holdsPosts()) {
            long count = posts.countByCategoryId(target.getId());
            if (count > 0) {
                throw conflict("Đầu mục đang có " + count + " bài viết nên không thể đổi thành nhóm/liên kết. Hãy chuyển bài viết trước.");
            }
        }

        String externalUrl = PostService.blankToNull(request.externalUrl());
        if (type == PageType.LINK) {
            if (externalUrl == null || !(externalUrl.startsWith("http://") || externalUrl.startsWith("https://") || externalUrl.startsWith("/"))) {
                throw badRequest("Đầu mục kiểu liên kết cần đường dẫn bắt đầu bằng http://, https:// hoặc /.");
            }
        }

        target.setName(name);
        target.setSlug(uniqueSlug(request.slug(), name, target.getId()));
        target.setPageType(type);
        target.setParentId(request.parentId());
        if (request.sortOrder() != null) target.setSortOrder(request.sortOrder());
        target.setVisible(request.visible() == null || request.visible());
        target.setShowOnHome(Boolean.TRUE.equals(request.showOnHome()));
        target.setExternalUrl(externalUrl);
        target.setDescription(PostService.blankToNull(request.description()));

        List<Category> all = new ArrayList<>(categories.findAll());
        all.removeIf(c -> c.getId().equals(target.getId()));
        all.add(target);
        validatePlacement(target, index(all), all);
    }

    private void validatePlacement(Category category, Map<UUID, Category> byId, List<Category> all) {
        UUID parentId = category.getParentId();
        if (parentId == null) return;
        if (parentId.equals(category.getId())) throw badRequest("Đầu mục không thể là cha của chính nó.");
        Category parent = byId.get(parentId);
        if (parent == null) throw badRequest("Đầu mục cha không tồn tại.");
        if (parent.getParentId() != null) {
            throw badRequest("Menu chỉ có 2 cấp: \"" + parent.getName() + "\" đã là mục con nên không thể chứa mục khác.");
        }
        if (category.getPageType() == PageType.GROUP) {
            throw badRequest("Mục con \"" + category.getName() + "\" không thể là kiểu Nhóm.");
        }
        boolean hasChildren = category.getId() != null
                && all.stream().anyMatch(c -> category.getId().equals(c.getParentId()));
        if (hasChildren) {
            throw badRequest("\"" + category.getName() + "\" đang có mục con nên phải giữ ở cấp 1 (menu chỉ có 2 cấp).");
        }
    }

    private String uniqueSlug(String requested, String name, UUID selfId) {
        String slug = Slugs.of(requested == null || requested.isBlank() ? name : requested);
        if (RESERVED_SLUGS.contains(slug)) throw badRequest("Đường dẫn \"" + slug + "\" đã được hệ thống sử dụng, hãy chọn tên khác.");
        boolean taken = selfId == null ? categories.existsBySlug(slug) : categories.existsBySlugAndIdNot(slug, selfId);
        if (taken) throw conflict("Đường dẫn \"" + slug + "\" đã thuộc về một đầu mục khác.");
        return slug;
    }

    private int nextSortOrder(UUID parentId) {
        return categories.findAll().stream()
                .filter(c -> Objects.equals(c.getParentId(), parentId))
                .mapToInt(Category::getSortOrder)
                .max().orElse(-1) + 1;
    }

    private static boolean isPubliclyVisible(Category category, Map<UUID, Category> byId) {
        if (!Boolean.TRUE.equals(category.getVisible())) return false;
        if (category.getParentId() == null) return true;
        Category parent = byId.get(category.getParentId());
        return parent != null && Boolean.TRUE.equals(parent.getVisible());
    }

    private static Map<UUID, Category> index(Collection<Category> all) {
        return all.stream().collect(Collectors.toMap(Category::getId, Function.identity(), (a, b) -> b, HashMap::new));
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
