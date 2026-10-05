package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.PostBlock;
import vn.edu.portal.repository.PostBlockRepository;
import java.util.List;
import java.util.UUID;

/** Low-level block CRUD, admin-only (enforced by AdminAuthInterceptor). */
@RestController
@RequestMapping("/api/post-blocks")
public class PostBlockController {
    @Autowired
    private PostBlockRepository repository;

    @GetMapping
    public List<PostBlock> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostBlock> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PostBlock create(@RequestBody PostBlock entity) {
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostBlock> update(@PathVariable UUID id, @RequestBody PostBlock entity) {
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
