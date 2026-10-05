package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.Post;
import java.util.UUID;
@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    java.util.List<Post> findByStatus(String status);
    java.util.List<Post> findTop5ByCategoryIdAndStatusOrderByCreatedAtDesc(UUID categoryId, String status);
}
