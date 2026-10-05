package vn.edu.portal.security;

import vn.edu.portal.entity.Role;

import java.util.UUID;

public record AuthUser(UUID id, Role role) {
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
