package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.LostFoundReport;
import vn.edu.portal.repository.LostFoundReportRepository;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found-reports")
@CrossOrigin(origins = "*")
public class LostFoundReportController {
    @Autowired
    private LostFoundReportRepository repository;

    @GetMapping
    public List<LostFoundReport> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostFoundReport> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LostFoundReport create(@RequestBody LostFoundReport entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LostFoundReport> update(@PathVariable UUID id, @RequestBody LostFoundReport entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
