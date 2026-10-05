package vn.edu.portal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import vn.edu.portal.entity.User;
import vn.edu.portal.repository.UserRepository;
import vn.edu.portal.security.PasswordHasher;

import java.util.List;

/** Idempotent start-up clean-up: hashes any plaintext password left by the seed scripts. */
@Component
public class DataMaintenanceRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DataMaintenanceRunner.class);

    private final UserRepository users;

    public DataMaintenanceRunner(UserRepository users) {
        this.users = users;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            List<User> plaintext = users.findAll().stream()
                    .filter(u -> !PasswordHasher.isHashed(u.getPasswordHash()))
                    .toList();
            plaintext.forEach(u -> u.setPasswordHash(PasswordHasher.hash(u.getPasswordHash())));
            if (!plaintext.isEmpty()) {
                users.saveAll(plaintext);
                log.info("Hashed {} plaintext password(s).", plaintext.size());
            }
        } catch (RuntimeException e) {
            log.warn("Data maintenance skipped: {}", e.getMessage());
        }
    }
}
