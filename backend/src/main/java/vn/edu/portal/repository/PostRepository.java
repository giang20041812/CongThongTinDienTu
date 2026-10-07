package vn.edu.portal.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.portal.entity.Post;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Listings load category and author in the same query but never the blocks: a page of
 * summaries is one SELECT plus one COUNT. Detail reads add the blocks in a single join.
 * The database is remote (~250 ms per round trip), so every N+1 is expensive.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {

    @Override
    @EntityGraph(attributePaths = {"category", "author"})
    Page<Post> findAll(Specification<Post> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "author", "blocks"})
    Optional<Post> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = {"category", "author", "blocks"})
    Optional<Post> findWithDetailsBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    long countByCategoryId(UUID categoryId);

    @Modifying
    @Query("update Post p set p.category.id = :target where p.category.id = :source")
    int moveCategory(@Param("source") UUID source, @Param("target") UUID target);

    @Modifying
    @Transactional
    @Query("update Post p set p.views = coalesce(p.views, 0) + 1 where p.id = :id and p.status = :status")
    int incrementViews(@Param("id") UUID id, @Param("status") String status);

    interface PhotoRow {
        String getUrl();
        String getTitle();
        String getSlug();
    }

    /** Covers and body images of the given posts, newest post first, each post's photos in reading order – one round trip. */
    @Query(value = """
            select x.url as url, x.title as title, x.slug as slug from (
                select p.cover_url as url, p.title, p.slug, p.published_at, p.created_at, -1 as ord
                from posts p
                where p.cover_url is not null and p.status = :status and p.category_id in (:categoryIds)
                union all
                select b.image_url, p.title, p.slug, p.published_at, p.created_at, b.order_index
                from post_blocks b join posts p on p.id = b.post_id
                where b.type = 'IMAGE' and b.image_url is not null and p.status = :status and p.category_id in (:categoryIds)
            ) x
            order by x.published_at desc, x.created_at desc, x.slug, x.ord
            limit :limit""", nativeQuery = true)
    List<PhotoRow> findPhotos(@Param("status") String status, @Param("categoryIds") Collection<UUID> categoryIds,
                              @Param("limit") int limit);
}
