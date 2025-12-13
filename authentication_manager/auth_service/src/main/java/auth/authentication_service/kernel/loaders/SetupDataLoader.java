package auth.authentication_service.kernel.loaders;

import auth.authentication_service.core.domain.entities.LLMModel;
import auth.authentication_service.core.domain.entities.Privilege;
import auth.authentication_service.core.domain.entities.Role;
import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.infrastructure.store.repositories.LLMModelRepository;
import auth.authentication_service.infrastructure.store.repositories.PrivilegeRepository;
import auth.authentication_service.infrastructure.store.repositories.RoleRepository;
import auth.authentication_service.infrastructure.store.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SetupDataLoader implements ApplicationListener<ContextRefreshedEvent> {

    private boolean alreadySetup = false;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PrivilegeRepository privilegeRepository;
    private final LLMModelRepository llmModelRepository;
    private final PasswordEncoder passwordEncoder;

    // API

    @Override
    @Transactional
    public void onApplicationEvent(final ContextRefreshedEvent event) {
        if (alreadySetup) {
            return;
        }

        // == create initial privileges
        final Privilege readPrivilege = createPrivilegeIfNotFound("READ_PRIVILEGE");
        final Privilege writPrivilege = createPrivilegeIfNotFound("WRITE_PRIVILEGE");
        final Privilege passwordPrivilege = createPrivilegeIfNotFound("CHANGE_PASSWORD_PRIVILEGE");
        final Privilege readRole = createPrivilegeIfNotFound("READ_ROLE");
        final Privilege writeRole = createPrivilegeIfNotFound("WRITE_ROLE");
        final Privilege readUser = createPrivilegeIfNotFound("READ_USER");
        final Privilege writeUser = createPrivilegeIfNotFound("WRITE_USER");
        final Privilege readTaskService = createPrivilegeIfNotFound("READ_TASK_SERVICE");
        final Privilege writeTaskService = createPrivilegeIfNotFound("WRITE_TASK_SERVICE");

        // == create initial roles
        final List<Privilege> bossPrivileges = new ArrayList<>(Arrays.asList(readPrivilege, writPrivilege,
                passwordPrivilege, readRole, writeRole, readUser, writeUser, readTaskService, writeTaskService));
        final List<Privilege> authAdminPrivileges = new ArrayList<>(
                Arrays.asList(readPrivilege, readRole, readUser, writeUser));
        final List<Privilege> serviceUserPrivileges = new ArrayList<>(Arrays.asList(readTaskService, writeTaskService));

        final Role bossRole = createRoleIfNotFound("ROLE_BOSS", bossPrivileges);
        final Role adminRole = createRoleIfNotFound("ROLE_ADMIN", authAdminPrivileges);
        final Role userTestRole = createRoleIfNotFound("ROLE_USER", serviceUserPrivileges);

        final LLMModel geminiModel = createLLMModelIfNotFound("gemini-2.5-flash");
        final LLMModel unslothModel = createLLMModelIfNotFound("unsloth");

        // == create initial user
        createUserIfNotFound("nguyendongducviet2001@gmail.com", "Nguyen Dong Duc Viet", "golde", "123456",
                new ArrayList<>(Arrays.asList(bossRole)), new ArrayList<>(Arrays.asList(geminiModel )));
        createUserIfNotFound("test@test.com", "Test", "Test", "test", new ArrayList<>(Arrays.asList(adminRole)),
                new ArrayList<>(Arrays.asList(unslothModel)));
        createUserIfNotFound("user@test.com", "User", "usertest", "123456", new ArrayList<>(Arrays.asList(userTestRole)),
                new ArrayList<>(Arrays.asList(unslothModel)));
        alreadySetup = true;
    }

    @Transactional
    public Privilege createPrivilegeIfNotFound(final String name) {
        Privilege privilege = privilegeRepository.findByName(name);
        if (privilege == null) {
            privilegeRepository.save(Privilege.builder().name(name).build());
        }
        return privilege;
    }

    @Transactional
    public Role createRoleIfNotFound(final String name, final Collection<Privilege> privileges) {
        Role role = roleRepository.findByName(name);
        if (role == null) {
            role = Role.builder().name(name).build();
        }
        role.setPrivileges(privileges);
        return roleRepository.save(role);
    }

    @Transactional
    public void createUserIfNotFound(final String email, final String name, final String username,
                                     final String password, final Collection<Role> roles, final Collection<LLMModel> llmModels) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .enabled(true)
                    .build();
        }
        user.setRoles(roles);
        user.setLlmModels(llmModels);
        userRepository.save(user);
    }

    @Transactional
    public LLMModel createLLMModelIfNotFound(final String name) {
        LLMModel llmModel = llmModelRepository.findLLMModelByModelNameAndActiveStatus(name, true);
        if (llmModel == null) {
            LLMModel model = LLMModel.builder()
                    .modelName(name)
                    .activeStatus(true)
                    .build();
            llmModel = llmModelRepository.save(model);
        }
        return llmModel;
    }
}