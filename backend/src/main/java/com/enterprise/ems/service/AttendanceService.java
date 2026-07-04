package com.enterprise.ems.service;

import com.enterprise.ems.entity.Attendance;
import com.enterprise.ems.entity.Employee;
import com.enterprise.ems.exception.CustomException;
import com.enterprise.ems.exception.ResourceNotFoundException;
import com.enterprise.ems.repository.AttendanceRepository;
import com.enterprise.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceToday() {
        return attendanceRepository.findByDate(LocalDate.now());
    }

    @Transactional
    public Attendance checkIn(Long employeeId, String username, String ip) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByEmployeeIdAndDate(employeeId, today).isPresent()) {
            throw new CustomException("Employee has already checked in today!", HttpStatus.BAD_REQUEST);
        }

        LocalTime now = LocalTime.now();
        String status = now.isAfter(LocalTime.of(9, 30)) ? "LATE" : "PRESENT";

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .checkIn(now)
                .status(status)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.logAction("CHECK_IN", username, "Checked in today at " + now, ip);
        return saved;
    }

    @Transactional
    public Attendance checkOut(Long employeeId, String username, String ip) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new CustomException("No check-in found for today. Please check in first.", HttpStatus.BAD_REQUEST));

        if (attendance.getCheckOut() != null) {
            throw new CustomException("Employee has already checked out today!", HttpStatus.BAD_REQUEST);
        }

        LocalTime now = LocalTime.now();
        attendance.setCheckOut(now);

        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.logAction("CHECK_OUT", username, "Checked out today at " + now, ip);
        return saved;
    }
}
