package vn.edu.portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.portal.service.TimetableService;
import vn.edu.portal.service.TimetableService.PeriodView;
import vn.edu.portal.service.TimetableService.SlotRequest;
import vn.edu.portal.service.TimetableService.TimetableView;

import java.util.List;

/** Class timetable: public read of everything at once (small, cached); writes are admin-only. */
@RestController
@RequestMapping("/api/timetable")
public class TimetableController {
    public record ClassRequest(List<SlotRequest> entries) {}

    private final TimetableService service;

    public TimetableController(TimetableService service) {
        this.service = service;
    }

    @GetMapping
    public TimetableView get() {
        return service.get();
    }

    /** Replaces the week of {@code className} (created if new). */
    @PutMapping("/classes/{className}")
    public ResponseEntity<Void> replaceClass(@PathVariable String className, @RequestBody ClassRequest body) {
        service.replaceClass(className, body == null ? null : body.entries());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/classes/{className}")
    public ResponseEntity<Void> deleteClass(@PathVariable String className) {
        return service.deleteClass(className) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/periods")
    public ResponseEntity<Void> replacePeriods(@RequestBody List<PeriodView> body) {
        service.replacePeriods(body);
        return ResponseEntity.noContent().build();
    }
}
