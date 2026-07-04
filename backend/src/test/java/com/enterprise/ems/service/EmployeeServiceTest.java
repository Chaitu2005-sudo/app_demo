package com.enterprise.ems.service;

import com.enterprise.ems.dto.EmployeeDto;
import com.enterprise.ems.entity.Department;
import com.enterprise.ems.entity.Employee;
import com.enterprise.ems.exception.ResourceNotFoundException;
import com.enterprise.ems.repository.DepartmentRepository;
import com.enterprise.ems.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;
    private Department department;

    @BeforeEach
    void setUp() {
        department = Department.builder()
                .id(1L)
                .name("Engineering")
                .description("Software engineering and development")
                .build();

        employee = Employee.builder()
                .id(101L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@enterprise.com")
                .phoneNumber("1234567890")
                .designation("Senior Software Engineer")
                .salary(new BigDecimal("120000.00"))
                .joiningDate(LocalDate.now())
                .status("ACTIVE")
                .department(department)
                .build();
    }

    @Test
    void whenGetEmployeeById_thenReturnEmployeeDto() {
        Mockito.when(employeeRepository.findById(101L)).thenReturn(Optional.of(employee));

        EmployeeDto result = employeeService.getEmployeeById(101L);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("john.doe@enterprise.com", result.getEmail());
        assertEquals("Engineering", result.getDepartmentName());
    }

    @Test
    void whenGetEmployeeById_withInvalidId_thenThrowException() {
        Mockito.when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            employeeService.getEmployeeById(999L);
        });
    }
}
