package com.enterprise.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // e.g. "CREATE_EMPLOYEE", "APPROVE_LEAVE"

    @Column(name = "executed_by", nullable = false)
    private String executedBy;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String details;

    @Column(name = "ip_address")
    private String ipAddress;
}
