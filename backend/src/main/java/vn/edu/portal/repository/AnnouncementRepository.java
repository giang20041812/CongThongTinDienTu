package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.Announcement;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    java.util.List<Announcement> findByStatus(String status);
    java.util.List<Announcement> findTop8ByStatusOrderByCreatedAtDesc(String status);
    
    Page<Announcement> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM Announcement a WHERE (:status IS NULL OR :status = '' OR a.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY a.createdAt DESC")
    Page<Announcement> searchAnnouncements(@Param("status") String status, @Param("keyword") String keyword, Pageable pageable);
}
