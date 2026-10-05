package vn.edu.portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.portal.entity.TimetableEntry;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, UUID> {
    List<TimetableEntry> findAllByOrderByGradeAscClassNameAscDayOfWeekAscPeriodAsc();

    @Modifying
    @Query("delete from TimetableEntry e where e.className = :className")
    int deleteByClassName(@Param("className") String className);

    @Query("select distinct e.className from TimetableEntry e where e.period in :periods order by e.className")
    List<String> findClassesUsingPeriods(@Param("periods") Collection<Integer> periods);
}
