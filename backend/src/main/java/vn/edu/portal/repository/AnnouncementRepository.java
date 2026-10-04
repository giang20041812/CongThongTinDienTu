package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.Announcement;
import java.util.UUID;
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    java.util.List<Announcement> findByStatus(String status);
}
