package vn.edu.portal.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.entity.TimetableEntry;
import vn.edu.portal.entity.TimetablePeriod;
import vn.edu.portal.repository.TimetableEntryRepository;
import vn.edu.portal.repository.TimetablePeriodRepository;

import java.time.LocalTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Weekly class timetable ("Thời khóa biểu"): period times plus one entry per class/weekday/period. */
@Service
public class TimetableService {
    private static final String CACHE_KEY = "timetable";
    private static final Pattern GRADE = Pattern.compile("^(\\d{1,2})");
    private static final int MIN_DAY = 2;
    private static final int MAX_DAY = 8;
    private static final int MAX_PERIOD = 15;

    public record PeriodView(int period, LocalTime startTime, LocalTime endTime) {}

    public record EntryView(String className, int grade, int dayOfWeek, int period, String subject, String teacher) {}

    public record TimetableView(List<PeriodView> periods, List<EntryView> entries) {}

    public record SlotRequest(Integer dayOfWeek, Integer period, String subject, String teacher) {}

    private final TimetablePeriodRepository periods;
    private final TimetableEntryRepository entries;
    private final ContentCache cache;

    public TimetableService(TimetablePeriodRepository periods, TimetableEntryRepository entries, ContentCache cache) {
        this.periods = periods;
        this.entries = entries;
        this.cache = cache;
    }

    @Transactional(readOnly = true)
    public TimetableView get() {
        return cache.get(CACHE_KEY, () -> new TimetableView(
                periods.findAllByOrderByPeriodAsc().stream()
                        .map(p -> new PeriodView(p.getPeriod(), p.getStartTime(), p.getEndTime()))
                        .toList(),
                entries.findAllByOrderByGradeAscClassNameAscDayOfWeekAscPeriodAsc().stream()
                        .map(e -> new EntryView(e.getClassName(), e.getGrade(), e.getDayOfWeek(), e.getPeriod(), e.getSubject(), e.getTeacher()))
                        .toList()));
    }

    /** Replaces the whole week of one class; blank cells are dropped, so an empty list removes the class. */
    @Transactional
    public void replaceClass(String rawName, List<SlotRequest> slots) {
        String className = normalizeClassName(rawName);
        int grade = gradeOf(className);
        Set<Integer> known = new HashSet<>();
        periods.findAll().forEach(p -> known.add(p.getPeriod()));

        List<TimetableEntry> next = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (SlotRequest slot : slots == null ? List.<SlotRequest>of() : slots) {
            if (slot == null || slot.subject() == null || slot.subject().isBlank()) continue;
            int day = slot.dayOfWeek() == null ? -1 : slot.dayOfWeek();
            int period = slot.period() == null ? -1 : slot.period();
            if (day < MIN_DAY || day > MAX_DAY) throw badRequest("Ngày trong tuần không hợp lệ: " + slot.dayOfWeek());
            if (!known.contains(period)) throw badRequest("Tiết " + slot.period() + " chưa được khai báo giờ học.");
            if (!seen.add(day + "-" + period)) throw badRequest("Trùng tiết " + period + " của " + dayLabel(day) + ".");
            next.add(TimetableEntry.builder()
                    .className(className)
                    .grade(grade)
                    .dayOfWeek(day)
                    .period(period)
                    .subject(limit(slot.subject(), 100, "Tên môn"))
                    .teacher(slot.teacher() == null || slot.teacher().isBlank() ? null : limit(slot.teacher(), 100, "Tên giáo viên"))
                    .build());
        }
        entries.deleteByClassName(className);
        entries.flush();
        entries.saveAll(next);
        cache.clearAfterCommit();
    }

    @Transactional
    public boolean deleteClass(String rawName) {
        boolean removed = entries.deleteByClassName(normalizeClassName(rawName)) > 0;
        cache.clearAfterCommit();
        return removed;
    }

    /** Upserts the period times; a period can only be removed once no class uses it. */
    @Transactional
    public void replacePeriods(List<PeriodView> requested) {
        if (requested == null || requested.isEmpty()) throw badRequest("Cần ít nhất một tiết học.");
        Map<Integer, PeriodView> byNumber = new TreeMap<>();
        for (PeriodView p : requested) {
            if (p == null || p.period() < 1 || p.period() > MAX_PERIOD) throw badRequest("Số tiết phải từ 1 đến " + MAX_PERIOD + ".");
            if (p.startTime() == null || p.endTime() == null || !p.startTime().isBefore(p.endTime())) {
                throw badRequest("Giờ bắt đầu của tiết " + p.period() + " phải trước giờ kết thúc.");
            }
            if (byNumber.put(p.period(), p) != null) throw badRequest("Tiết " + p.period() + " bị khai báo hai lần.");
        }
        List<Integer> removed = periods.findAll().stream()
                .map(TimetablePeriod::getPeriod)
                .filter(n -> !byNumber.containsKey(n))
                .toList();
        if (!removed.isEmpty()) {
            List<String> classes = entries.findClassesUsingPeriods(removed);
            if (!classes.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Không thể xoá tiết " + removed + " vì đang được dùng trong thời khóa biểu của lớp: " + String.join(", ", classes) + ".");
            }
            periods.deleteAllById(removed);
        }
        byNumber.values().forEach(p -> periods.save(new TimetablePeriod(p.period(), p.startTime(), p.endTime())));
        cache.clearAfterCommit();
    }

    private static String normalizeClassName(String raw) {
        String name = raw == null ? "" : raw.trim().replaceAll("\\s+", " ");
        if (name.isEmpty()) throw badRequest("Tên lớp không được để trống.");
        if (name.length() > 30) throw badRequest("Tên lớp tối đa 30 ký tự.");
        return name;
    }

    private static int gradeOf(String className) {
        Matcher m = GRADE.matcher(className);
        int grade = m.find() ? Integer.parseInt(m.group(1)) : -1;
        if (grade < 1 || grade > 12) throw badRequest("Tên lớp phải bắt đầu bằng khối, ví dụ 10A1.");
        return grade;
    }

    private static String limit(String value, int max, String field) {
        String trimmed = value.trim();
        if (trimmed.length() > max) throw badRequest(field + " tối đa " + max + " ký tự.");
        return trimmed;
    }

    private static String dayLabel(int day) {
        return day == 8 ? "Chủ nhật" : "Thứ " + day;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
