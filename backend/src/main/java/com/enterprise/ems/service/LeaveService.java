package com.enterprise.ems.service;

import com.enterprise.ems.entity.Employee;
import com.enterprise.ems.entity.Leave;
import com.enterprise.ems.exception.ResourceNotFoundException;
import com.enterprise.ems.repository.EmployeeRepository;
import com.enterprise.ems.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public List<Leave> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    @Transactional
    public Leave requestLeave(Long employeeId, Leave leaveRequest, String username, String ip) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        Leave leave = Leave.builder()
                .employee(employee)
                .leaveType(leaveRequest.getLeaveType().toUpperCase())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .reason(leaveRequest.getReason())
                .status("PENDING")
                .build();

        Leave saved = leaveRepository.save(leave);
        auditLogService.logAction("REQUEST_LEAVE", username, "Requested leave " + leave.getLeaveType() + " from " + leave.getStartDate(), ip);
        return saved;
    }

    @Transactional
    public Leave reviewLeave(Long leaveId, String status, String reviewerUsername, String ip) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        leave.setStatus(status.toUpperCase());
        leave.setApprovedBy(reviewerUsername);

        Leave updated = leaveRepository.save(leave);
        auditLogService.logAction("REVIEW_LEAVE", reviewerUsername, "Reviewed leave id: " + leaveId + ", status: " + status, ip);
        return updated;
    }
}
