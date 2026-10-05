package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.Post;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    java.util.List<Post> findByStatus(String status);
    java.util.List<Post> findTop5ByCategoryIdAndStatusOrderByCreatedAtDesc(UUID categoryId, String status);
    
    Page<Post> findByCategoryIdAndStatusOrderByCreatedAtDesc(UUID categoryId, String status, Pageable pageable);
    Page<Post> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId, Pageable pageable);
    Page<Post> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:status IS NULL OR :status = '' OR p.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(@Param("categoryId") UUID categoryId, @Param("status") String status, @Param("keyword") String keyword, Pageable pageable);
}
