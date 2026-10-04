package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.Schedule;
import java.util.UUID;
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, UUID> {}
