package com.enterprise.ems.repository;

import com.enterprise.ems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);

    @Query("SELECT d, COUNT(e) FROM Department d LEFT JOIN Employee e ON e.department = d GROUP BY d")
    List<Object[]> getDepartmentsWithEmployeeCount();
}
