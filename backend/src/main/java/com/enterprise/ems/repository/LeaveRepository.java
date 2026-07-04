package com.enterprise.ems.repository;

import com.enterprise.ems.entity.Leave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByEmployeeId(Long employeeId);
    Page<Leave> findByEmployeeId(Long employeeId, Pageable pageable);
    List<Leave> findByStatus(String status);
}
