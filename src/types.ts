export interface User {
  id: number;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_EMPLOYEE';
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: number | null;
  departmentName: string;
  designation: string;
  salary: number;
  joiningDate: string;
  address: string;
  profileImage: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  role?: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  headId: number | null;
  headName: string;
  employeeCount: number;
}

export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
}

export interface AuditLog {
  id: number;
  action: string;
  executedBy: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  departmentDistribution: Record<string, number>;
  attendanceStatusToday: {
    Present: number;
    Late: number;
    Absent: number;
    Leave: number;
  };
}
