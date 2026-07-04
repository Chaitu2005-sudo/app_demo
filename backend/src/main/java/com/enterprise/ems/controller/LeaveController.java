package com.enterprise.ems.controller;

import com.enterprise.ems.entity.Leave;
import com.enterprise.ems.service.LeaveService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Leave>> getEmployeeLeaves(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(id));
    }

    @PostMapping("/request/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<Leave> requestLeave(
            @PathVariable Long employeeId,
            @RequestBody Leave leaveRequest,
            HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String ip = request.getRemoteAddr();
        Leave saved = leaveService.requestLeave(employeeId, leaveRequest, username, ip);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Leave> reviewLeave(
            @PathVariable Long id,
            @RequestParam String status,
            HttpServletRequest request) {
        String reviewer = SecurityContextHolder.getContext().getAuthentication().getName();
        String ip = request.getRemoteAddr();
        Leave updated = leaveService.reviewLeave(id, status, reviewer, ip);
        return ResponseEntity.ok(updated);
    }
}
