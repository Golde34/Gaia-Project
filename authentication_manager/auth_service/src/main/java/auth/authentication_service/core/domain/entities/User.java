package auth.authentication_service.core.domain.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Entity
@Data
@Table(name = "user_account")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @Column(unique = true, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String username;

    private String email;

    @Column(length = 60)
    @JsonIgnore
    private String password;

    private Date lastLogin;

    private boolean enabled;

    private boolean isUsing2FA;

    private String secret;

    @JsonManagedReference
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    private Collection<Role> roles;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private Collection<AuthToken> tokens;

    @OneToOne(mappedBy = "user")
    private UserSetting userSetting;

    @JsonManagedReference
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_models", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "model_id", referencedColumnName = "modelId"))
    private Collection<LLMModel> llmModels; 

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", lastLogin=" + lastLogin +
                ", enabled=" + enabled +
                ", isUsing2FA=" + isUsing2FA +
                ", secret='" + secret + '\'' +
                ", roles=" + roles.stream().map(Role::getId).toList() +
                '}';
    }
}