package vn.edu.portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.TimetablePeriod;

import java.util.List;

@Repository
public interface TimetablePeriodRepository extends JpaRepository<TimetablePeriod, Integer> {
    List<TimetablePeriod> findAllByOrderByPeriodAsc();
}
