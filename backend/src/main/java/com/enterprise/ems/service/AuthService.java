package com.enterprise.ems.service;

import com.enterprise.ems.dto.JwtResponse;
import com.enterprise.ems.dto.LoginRequest;
import com.enterprise.ems.dto.RegisterRequest;
import com.enterprise.ems.entity.Role;
import com.enterprise.ems.entity.User;
import com.enterprise.ems.exception.CustomException;
import com.enterprise.ems.repository.UserRepository;
import com.enterprise.ems.security.JwtUtils;
import com.enterprise.ems.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        auditLogService.logAction("LOGIN_SUCCESS", userDetails.getUsername(), "Successfully logged into the system", ipAddress);

        return JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .role(userDetails.getAuthorities().stream().findFirst().get().getAuthority())
                .build();
    }

    @Transactional
    public User registerUser(RegisterRequest registerRequest, String ipAddress) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new CustomException("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        Role userRole = Role.valueOf("ROLE_" + registerRequest.getRole().toUpperCase());

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        auditLogService.logAction("REGISTER_SUCCESS", savedUser.getEmail(), "Registered new account with role: " + savedUser.getRole().name(), ipAddress);

        return savedUser;
    }
}
