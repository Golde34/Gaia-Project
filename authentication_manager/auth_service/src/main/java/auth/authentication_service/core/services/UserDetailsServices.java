package auth.authentication_service.core.services;

import auth.authentication_service.core.domain.constant.Constants;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.port.store.UserCRUDStore;
import auth.authentication_service.kernel.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserDetailsServices implements UserDetailsService {

    private final ObjectUtils objectUtils;
    private final UserCRUDStore userStore;

    @Override
    public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
        try {
            final User user = userStore.findByUsername(username);
            if (objectUtils.isNullOrEmpty(user)) {
                log.error("Load user by username failed: {}", username);
                return null;
            }

            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPassword(), user.isEnabled(),
                    true, true, true, getAuthorities(user.getRoles()));
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Collection<? extends GrantedAuthority> getAuthorities(final Collection<Role> roles) {
        return getGrantedAuthorities(getPrivileges(roles));
    }

    private List<GrantedAuthority> getGrantedAuthorities(final List<String> privileges) {
        return privileges.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

    }

    private List<String> getPrivileges(Collection<Role> roles) {

        List<String> roleNames = roles.stream()
                .map(Role::getName)
                .toList();

        List<String> privilegeNames = roles.stream()
                .flatMap(role -> role.getPrivileges().stream())
                .map(Privilege::getName)
                .toList();

        return Stream.concat(roleNames.stream(), privilegeNames.stream())
                .toList();
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