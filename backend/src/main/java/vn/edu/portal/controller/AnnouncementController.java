package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.Announcement;
import vn.edu.portal.entity.User;
import vn.edu.portal.entity.Role;
import vn.edu.portal.repository.AnnouncementRepository;
import vn.edu.portal.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {
    @Autowired
    private AnnouncementRepository repository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Announcement> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return repository.findByStatus(status);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement entity) {
        if (entity.getAuthor() == null) {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                User defaultUser = new User();
                defaultUser.setUsername("admin");
                defaultUser.setPasswordHash("admin123");
                defaultUser.setRole(Role.ADMIN);
                defaultUser = userRepository.save(defaultUser);
                entity.setAuthor(defaultUser);
            } else {
                entity.setAuthor(users.get(0));
            }
        }
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(@PathVariable UUID id, @RequestBody Announcement entity) {
        return repository.findById(id).map(existing -> {
            entity.setId(id);
            if (entity.getAuthor() == null) {
                entity.setAuthor(existing.getAuthor());
            }
            if (entity.getViews() == null) {
                entity.setViews(existing.getViews());
            }
            if (entity.getCreatedAt() == null) {
                entity.setCreatedAt(existing.getCreatedAt());
            }
            return ResponseEntity.ok(repository.save(entity));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
