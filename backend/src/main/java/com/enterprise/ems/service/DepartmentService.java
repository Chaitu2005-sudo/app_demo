package com.enterprise.ems.service;

import com.enterprise.ems.dto.DepartmentDto;
import com.enterprise.ems.entity.Department;
import com.enterprise.ems.entity.Employee;
import com.enterprise.ems.exception.ResourceNotFoundException;
import com.enterprise.ems.repository.DepartmentRepository;
import com.enterprise.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<DepartmentDto> getAllDepartments() {
        List<Object[]> results = departmentRepository.getDepartmentsWithEmployeeCount();
        return results.stream().map(record -> {
            Department dept = (Department) record[0];
            Long count = (Long) record[1];
            return convertToDto(dept, count);
        }).collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        List<Object[]> results = departmentRepository.getDepartmentsWithEmployeeCount();
        long count = results.stream()
                .filter(record -> ((Department) record[0]).getId().equals(id))
                .map(record -> (Long) record[1])
                .findFirst().orElse(0L);
        return convertToDto(dept, count);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto, String username, String ip) {
        Department department = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        if (dto.getHeadId() != null) {
            Employee head = employeeRepository.findById(dto.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getHeadId()));
            department.setDepartmentHead(head);
        }

        Department saved = departmentRepository.save(department);
        auditLogService.logAction("CREATE_DEPARTMENT", username, "Created department: " + saved.getName(), ip);
        return convertToDto(saved, 0L);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto, String username, String ip) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        department.setName(dto.getName());
        department.setDescription(dto.getDescription());

        if (dto.getHeadId() != null) {
            Employee head = employeeRepository.findById(dto.getHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getHeadId()));
            department.setDepartmentHead(head);
        } else {
            department.setDepartmentHead(null);
        }

        Department updated = departmentRepository.save(department);
        auditLogService.logAction("UPDATE_DEPARTMENT", username, "Updated department: " + updated.getName(), ip);
        return getDepartmentById(id);
    }

    @Transactional
    public void deleteDepartment(Long id, String username, String ip) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        departmentRepository.delete(dept);
        auditLogService.logAction("DELETE_DEPARTMENT", username, "Deleted department id: " + id, ip);
    }

    private DepartmentDto convertToDto(Department dept, Long count) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .headId(dept.getDepartmentHead() != null ? dept.getDepartmentHead().getId() : null)
                .headName(dept.getDepartmentHead() != null ? 
                        dept.getDepartmentHead().getFirstName() + " " + dept.getDepartmentHead().getLastName() : null)
                .employeeCount(count)
                .build();
    }
}
