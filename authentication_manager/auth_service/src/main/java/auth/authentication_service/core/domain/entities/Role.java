package auth.authentication_service.core.domain.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;

@Entity
@Getter
@Setter
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

    public Role(String name) {
        this.name = name;
    }

    public Role() {

    }

    public String toString() {
        return "[Role] id: " + id + ", name: " + name + ", description: " + description + ", grantedRank: " + grantedRank + ", users: " + users + ", privileges: " + privileges;
    }
}