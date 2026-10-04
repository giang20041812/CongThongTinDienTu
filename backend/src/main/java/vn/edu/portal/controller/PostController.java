package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.Post;
import vn.edu.portal.entity.User;
import vn.edu.portal.entity.Role;
import vn.edu.portal.repository.PostRepository;
import vn.edu.portal.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {
    @Autowired
    private PostRepository repository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Post> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return repository.findByStatus(status);
        }
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Post create(@RequestBody Post entity) {
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
        if (entity.getViews() == null) {
            entity.setViews(0);
        }
        if (entity.getStatus() == null) {
            entity.setStatus("PUBLISHED");
        }
        if (entity.getBlocks() != null) {
            entity.getBlocks().forEach(b -> b.setPost(entity));
        }
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> update(@PathVariable UUID id, @RequestBody Post entity) {
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
            if (entity.getStatus() == null) {
                entity.setStatus(existing.getStatus());
            }
            if (entity.getBannerUrl() == null) {
                entity.setBannerUrl(existing.getBannerUrl());
            }
            if (entity.getImgUrl() == null) {
                entity.setImgUrl(existing.getImgUrl());
            }
            if (entity.getBlocks() != null) {
                entity.getBlocks().forEach(b -> b.setPost(entity));
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
