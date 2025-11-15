package auth.authentication_service.core.domain.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Collection;

@Data
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "role")
public class Role {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    private int grantedRank;

    @JsonBackReference
    @ManyToMany(mappedBy="roles")
    private Collection<User> users;

    @JsonManagedReference
    @ManyToMany
    @JoinTable(name="roles_privileges", 
        joinColumns = @JoinColumn(name="role_id", referencedColumnName="id"), 
        inverseJoinColumns = @JoinColumn(name="privilege_id", referencedColumnName="id"))
    private Collection<Privilege> privileges;
}