package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * One cell of the weekly class timetable: a subject taught to a class on a weekday period.
 * Classes are not a separate table: a class exists as long as it has entries.
 */
@Entity
@Table(name = "timetable_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "class_name", nullable = false)
    private String className;

    /** Derived from the leading number of the class name ("10A1" -> 10). */
    @Column(nullable = false)
    private Integer grade;

    /** Vietnamese weekday numbering: 2 = Thứ Hai … 7 = Thứ Bảy, 8 = Chủ nhật. */
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(nullable = false)
    private Integer period;

    @Column(nullable = false)
    private String subject;

    private String teacher;
}
