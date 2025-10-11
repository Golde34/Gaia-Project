package auth.authentication_service.ui.controllers;

import auth.authentication_service.core.domain.dto.RoleDto;
import auth.authentication_service.core.services.interfaces.RoleService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/role")
public class RoleController {
   
    @Autowired
    private RoleService roleService;

    @PostMapping("/create-role")
    public ResponseEntity<?> createRole(@RequestBody RoleDto roleDto) {
        return roleService.createRole(roleDto);
    }

    @PutMapping("/update-role")
    public ResponseEntity<?> updateRole(@RequestBody RoleDto roleDto) {
        return roleService.updateRole(roleDto);
    }

    @DeleteMapping("/delete-role")
    public ResponseEntity<?> deleteRole(@RequestBody RoleDto roleDto) {
        return roleService.deleteRole(roleDto);
    }

    @GetMapping("/get-all-roles")
    public ResponseEntity<?> getAllRoles() {
        return roleService.getAllRoles();
    }
    
    @GetMapping("/get-role")
    public ResponseEntity<?> getRole(@RequestBody String name) {
        return roleService.getRoleByName(name);
    }

    @PutMapping("/add-privilege-to-role")
    public ResponseEntity<?> addPrivilegeToRole(@RequestBody RoleDto roleDto) {
        return roleService.addPrivilegeToRole(roleDto, roleDto.getPrivileges());
    }
}
