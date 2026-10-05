package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/** A lesson slot of the school day ("Tiết 1: 07:30 – 08:15"). Periods 1–5 are the morning, 6+ the afternoon. */
@Entity
@Table(name = "timetable_periods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetablePeriod {
    @Id
    private Integer period;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
