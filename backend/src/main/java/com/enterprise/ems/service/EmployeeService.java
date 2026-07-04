package com.enterprise.ems.service;

import com.enterprise.ems.dto.EmployeeDto;
import com.enterprise.ems.entity.Department;
import com.enterprise.ems.entity.Employee;
import com.enterprise.ems.entity.Role;
import com.enterprise.ems.entity.User;
import com.enterprise.ems.exception.ResourceNotFoundException;
import com.enterprise.ems.repository.DepartmentRepository;
import com.enterprise.ems.repository.EmployeeRepository;
import com.enterprise.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public Page<Employee> getEmployees(String search, Long departmentId, String status, Pageable pageable) {
        return employeeRepository.searchAndFilterEmployees(search, departmentId, status, pageable);
    }

    public EmployeeDto getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return convertToDto(emp);
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto, String username, String ip) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        // Check if matching User exists or create one automatically
        User user = userRepository.findByEmail(dto.getEmail()).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(dto.getEmail())
                    .password(passwordEncoder.encode("Welcome@123")) // Default password
                    .role(Role.ROLE_EMPLOYEE)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        Employee employee = Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .department(dept)
                .designation(dto.getDesignation())
                .salary(dto.getSalary())
                .joiningDate(dto.getJoiningDate())
                .address(dto.getAddress())
                .profileImage(dto.getProfileImage())
                .status(dto.getStatus().toUpperCase())
                .user(user)
                .build();

        Employee saved = employeeRepository.save(employee);
        auditLogService.logAction("CREATE_EMPLOYEE", username, "Created employee profile for " + saved.getEmail(), ip);
        return convertToDto(saved);
    }

    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto, String username, String ip) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setDepartment(dept);
        employee.setDesignation(dto.getDesignation());
        employee.setSalary(dto.getSalary());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setAddress(dto.getAddress());
        employee.setStatus(dto.getStatus().toUpperCase());

        if (dto.getProfileImage() != null) {
            employee.setProfileImage(dto.getProfileImage());
        }

        Employee updated = employeeRepository.save(employee);
        auditLogService.logAction("UPDATE_EMPLOYEE", username, "Updated employee profile: " + updated.getEmail(), ip);
        return convertToDto(updated);
    }

    @Transactional
    public void deleteEmployee(Long id, String username, String ip) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(emp);
        auditLogService.logAction("DELETE_EMPLOYEE", username, "Deleted employee id: " + id + ", email: " + emp.getEmail(), ip);
    }

    private EmployeeDto convertToDto(Employee emp) {
        return EmployeeDto.builder()
                .id(emp.getId())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .departmentId(emp.getDepartment() != null ? emp.getDepartment().getId() : null)
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .designation(emp.getDesignation())
                .salary(emp.getSalary())
                .joiningDate(emp.getJoiningDate())
                .address(emp.getAddress())
                .profileImage(emp.getProfileImage())
                .status(emp.getStatus())
                .build();
    }
}
