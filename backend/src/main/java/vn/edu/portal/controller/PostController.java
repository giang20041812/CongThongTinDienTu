package vn.edu.portal.controller;
import org.springframework.beans.factory.annotation.Autowired;
import vn.edu.portal.dto.HomepageResponseDTO;
import vn.edu.portal.dto.HomepageSectionDTO;
import vn.edu.portal.entity.Category;
import vn.edu.portal.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import vn.edu.portal.entity.Post;
import vn.edu.portal.entity.User;
import vn.edu.portal.entity.Role;
import vn.edu.portal.repository.PostRepository;
import vn.edu.portal.repository.UserRepository;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {
    @Autowired
    private PostRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Post> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return repository.searchPosts(categoryId, status, keyword, pageable);
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
