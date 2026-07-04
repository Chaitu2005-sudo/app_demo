package com.enterprise.ems.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "leaves")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    @NotNull
    private Employee employee;

    @NotBlank
    @Column(name = "leave_type")
    private String leaveType; // CASUAL, SICK, ANNUAL, UNPAID

    @NotNull
    @Column(name = "start_date")
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date")
    private LocalDate endDate;

    private String reason;

    @NotBlank
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "approved_by")
    private String approvedBy;
}
