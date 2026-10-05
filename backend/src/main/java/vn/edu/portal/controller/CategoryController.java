package vn.edu.portal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.portal.entity.Category;
import vn.edu.portal.security.AdminAuthInterceptor;
import vn.edu.portal.service.CategoryService;
import vn.edu.portal.service.CategoryService.CategoryRequest;
import vn.edu.portal.service.CategoryService.OrderItem;

import java.util.List;
import java.util.UUID;

/**
 * The menu tree, as a flat list in menu order (clients group children by {@code parentId}).
 * Visitors get only visible entries; admins get everything.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Category> getAll(HttpServletRequest request) {
        return AdminAuthInterceptor.isAdmin(request) ? service.listAll() : service.listPublic();
    }

    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<Category> getBySlug(@PathVariable String slug, HttpServletRequest request) {
        return service.findBySlug(slug, AdminAuthInterceptor.isAdmin(request))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Category create(@RequestBody CategoryRequest body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable UUID id, @RequestBody CategoryRequest body) {
        return service.update(id, body).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Moves/reorders many entries at once: {@code [{id, parentId, sortOrder}, ...]}. */
    @PutMapping("/order")
    public List<Category> reorder(@RequestBody List<OrderItem> items) {
        return service.reorder(items);
    }

    /** {@code moveTo}: category that receives this entry's posts (required when it still has posts). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestParam(required = false) UUID moveTo) {
        return service.delete(id, moveTo) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
