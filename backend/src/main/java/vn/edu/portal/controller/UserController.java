package vn.edu.portal.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.portal.entity.Role;
import vn.edu.portal.entity.User;
import vn.edu.portal.repository.UserRepository;
import vn.edu.portal.security.PasswordHasher;

import java.util.List;
import java.util.UUID;

/** Admin-only (enforced by AdminAuthInterceptor). Passwords are always stored hashed. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final int MIN_PASSWORD_LENGTH = 8;

    public record UserRequest(String username, String password, Role role) {}

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<User> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User create(@RequestBody UserRequest body) {
        String username = requireUsername(body.username());
        if (repository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại.");
        }
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(PasswordHasher.hash(requirePassword(body.password())));
        user.setRole(body.role() == null ? Role.USER : body.role());
        return repository.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @RequestBody UserRequest body) {
        return repository.findById(id).map(existing -> {
            if (body.username() != null) existing.setUsername(requireUsername(body.username()));
            if (body.role() != null) existing.setRole(body.role());
            if (body.password() != null && !body.password().isEmpty()) {
                existing.setPasswordHash(PasswordHasher.hash(requirePassword(body.password())));
            }
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private static String requireUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đăng nhập không được để trống.");
        }
        return username.trim();
    }

    private static String requirePassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất " + MIN_PASSWORD_LENGTH + " ký tự.");
        }
        return password;
    }
}
