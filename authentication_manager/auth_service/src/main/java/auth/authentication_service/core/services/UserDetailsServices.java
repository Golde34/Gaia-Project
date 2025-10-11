package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.LoggerType;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.kernel.utils.LoggerUtils;
import auth.authentication_service.kernel.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
@Transactional
public class UserDetailsServices implements UserDetailsService {

    @Autowired
    LoggerUtils _logger;
    
    private final ObjectUtils objectUtils;
    private final UserCRUDStore userStore;


    public UserDetailsServices(UserCRUDStore userStore, ObjectUtils objectUtils) {
        super();
        this.objectUtils = objectUtils;
        this.userStore = userStore;
    }

    @Override
    public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
        try {
            final User user = userStore.findByUsername(username);
            if (objectUtils.isNullOrEmpty(user)) {
                _logger.log("No user found with username: " + username, LoggerType.ERROR);
                return null;
            }

            return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), user.isEnabled(), true, true, true, getAuthorities(user.getRoles()));
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Collection<? extends GrantedAuthority> getAuthorities(final Collection<Role> roles) {
        return getGrantedAuthorities(getPrivileges(roles));
    }

    private List<GrantedAuthority> getGrantedAuthorities(final List<String> privileges) {
        final List<GrantedAuthority> authorities = new ArrayList<>();
        for (final String privilege : privileges) {
            authorities.add(new SimpleGrantedAuthority(privilege));
        }
        return authorities;
    }

    private List<String> getPrivileges(final Collection<Role> roles) {
        final List<String> privileges = new ArrayList<>();
        final List<Privilege> collection = new ArrayList<>();
        for (final Role role : roles) {
            privileges.add(role.getName());
            collection.addAll(role.getPrivileges());
        }
        for (final Privilege item : collection) {
            privileges.add(item.getName());
        }

        return privileges;
    }

    @PostConstruct
    public UserDetails loadPostConstructServiceUser() throws UsernameNotFoundException {
        try {
            UserDetails user = org.springframework.security.core.userdetails.User.withUsername("services")
                    .password("")
                    .authorities(new SimpleGrantedAuthority(Constants.Role.ADMIN))
                    .build();
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPassword(), user.isEnabled(), true, true, true, user.getAuthorities());
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }
}