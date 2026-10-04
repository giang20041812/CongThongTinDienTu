package vn.edu.portal.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.User;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {}
