package vn.edu.portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.SiteSetting;

@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, String> {
}
