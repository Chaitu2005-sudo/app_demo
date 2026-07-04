package com.enterprise.ems.controller;

import com.enterprise.ems.entity.Attendance;
import com.enterprise.ems.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(id));
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<Attendance>> getAttendanceToday() {
        return ResponseEntity.ok(attendanceService.getAttendanceToday());
    }

    @PostMapping("/check-in/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<Attendance> checkIn(@PathVariable Long employeeId, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String ip = request.getRemoteAddr();
        Attendance attendance = attendanceService.checkIn(employeeId, username, ip);
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/check-out/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long employeeId, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String ip = request.getRemoteAddr();
        Attendance attendance = attendanceService.checkOut(employeeId, username, ip);
        return ResponseEntity.ok(attendance);
    }
}
