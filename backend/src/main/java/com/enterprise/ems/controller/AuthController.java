package com.enterprise.ems.controller;

import com.enterprise.ems.dto.JwtResponse;
import com.enterprise.ems.dto.LoginRequest;
import com.enterprise.ems.dto.RegisterRequest;
import com.enterprise.ems.entity.User;
import com.enterprise.ems.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest, ipAddress);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        User user = authService.registerUser(registerRequest, ipAddress);
        return ResponseEntity.ok(user);
    }
}
