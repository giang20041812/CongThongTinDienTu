package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.Category;
import vn.edu.portal.repository.CategoryRepository;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    @Autowired
    private CategoryRepository repository;

    @GetMapping
    public org.springframework.data.domain.Page<Category> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return repository.searchCategories(keyword, org.springframework.data.domain.PageRequest.of(page, size));
    }

    @GetMapping("/position/{displayOrder}")
    public ResponseEntity<Category> getByPosition(@PathVariable Integer displayOrder) {
        return repository.findByDisplayOrder(displayOrder)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Category create(@RequestBody Category entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable UUID id, @RequestBody Category entity) {
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
