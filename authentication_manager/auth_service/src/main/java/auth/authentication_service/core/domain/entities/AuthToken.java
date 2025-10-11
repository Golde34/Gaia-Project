package auth.authentication_service.core.domain.entities;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;

import auth.authentication_service.core.domain.enums.TokenType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AuthToken {

    @Id
    @GeneratedValue(generator = "token_id")
    private Long id;

    private String token;

    private TokenType tokenType;

    private Date expiryDate;
    
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
