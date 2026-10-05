package vn.edu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

/** Key/value site information (school name, address, hotline, map...), editable by admins. */
@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteSetting {
    @Id
    @Column(name = "setting_key", length = 50)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;
}
