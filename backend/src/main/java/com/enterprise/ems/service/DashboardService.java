package com.enterprise.ems.service;

import com.enterprise.ems.dto.DashboardStatsDto;
import com.enterprise.ems.entity.Department;
import com.enterprise.ems.repository.DepartmentRepository;
import com.enterprise.ems.repository.EmployeeRepository;
import com.enterprise.ems.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus("ACTIVE");
        long inactiveEmployees = employeeRepository.countByStatus("INACTIVE") + employeeRepository.countByStatus("TERMINATED");
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRepository.findByStatus("PENDING").size();

        // Department distributions
        Map<String, Long> departmentDistribution = new HashMap<>();
        List<Object[]> deptResults = departmentRepository.getDepartmentsWithEmployeeCount();
        for (Object[] row : deptResults) {
            Department dept = (Department) row[0];
            Long count = (Long) row[1];
            departmentDistribution.put(dept.getName(), count);
        }

        return DashboardStatsDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .totalDepartments(totalDepartments)
                .pendingLeaves(pendingLeaves)
                .departmentDistribution(departmentDistribution)
                .attendanceStatusToday(new HashMap<>()) // Loaded on demand
                .build();
    }
}
