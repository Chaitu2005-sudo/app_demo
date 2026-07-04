import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Mock Database State
let departments = [
  { id: 1, name: "Engineering", description: "Builds core web applications and infrastructure", headId: 3, headName: "Sarah Jenkins", employeeCount: 3 },
  { id: 2, name: "Human Resources", description: "Recruits, manages, and supports employee growth", headId: 2, headName: "Emily Davis", employeeCount: 2 },
  { id: 3, name: "Sales & Marketing", description: "Drives product adoption and commercial contracts", headId: 4, headName: "Michael Roberts", employeeCount: 1 },
  { id: 4, name: "Finance", description: "Handles general cashflows, payroll, and reporting", headId: 5, headName: "Robert Miller", employeeCount: 1 }
];

let employees = [
  { id: 1, firstName: "Alice", lastName: "Vance", email: "admin@enterprise.com", phoneNumber: "+1 (555) 101-0001", departmentId: 1, departmentName: "Engineering", designation: "Enterprise Architect", salary: 145000, joiningDate: "2024-01-15", address: "100 Innovation Way, San Francisco, CA", profileImage: "", status: "ACTIVE", role: "ROLE_ADMIN" },
  { id: 2, firstName: "Emily", lastName: "Davis", email: "hr@enterprise.com", phoneNumber: "+1 (555) 101-0002", departmentId: 2, departmentName: "Human Resources", designation: "HR Director", salary: 98000, joiningDate: "2024-03-01", address: "404 Talent Blvd, Austin, TX", profileImage: "", status: "ACTIVE", role: "ROLE_HR" },
  { id: 3, firstName: "Sarah", lastName: "Jenkins", email: "sarah@enterprise.com", phoneNumber: "+1 (555) 101-0003", departmentId: 1, departmentName: "Engineering", designation: "Lead Engineer", salary: 130000, joiningDate: "2024-06-10", address: "78 Silicon Valley Dr, San Jose, CA", profileImage: "", status: "ACTIVE", role: "ROLE_EMPLOYEE" },
  { id: 4, firstName: "Michael", lastName: "Roberts", email: "michael@enterprise.com", phoneNumber: "+1 (555) 101-0004", departmentId: 3, departmentName: "Sales & Marketing", designation: "VP of Sales", salary: 110000, joiningDate: "2024-05-15", address: "88 Market St, Chicago, IL", profileImage: "", status: "ACTIVE", role: "ROLE_EMPLOYEE" },
  { id: 5, firstName: "Robert", lastName: "Miller", email: "robert@enterprise.com", phoneNumber: "+1 (555) 101-0005", departmentId: 4, departmentName: "Finance", designation: "Financial Controller", salary: 105000, joiningDate: "2024-02-20", address: "200 Capital Dr, New York, NY", profileImage: "", status: "ACTIVE", role: "ROLE_EMPLOYEE" },
  { id: 6, firstName: "David", lastName: "Wilson", email: "david@enterprise.com", phoneNumber: "+1 (555) 101-0006", departmentId: 1, departmentName: "Engineering", designation: "Frontend Developer", salary: 85000, joiningDate: "2025-01-10", address: "12 Pine St, Seattle, WA", profileImage: "", status: "ACTIVE", role: "ROLE_EMPLOYEE" },
  { id: 7, firstName: "Jessica", lastName: "Taylor", email: "jessica@enterprise.com", phoneNumber: "+1 (555) 101-0007", departmentId: 2, departmentName: "Human Resources", designation: "HR Specialist", salary: 65000, joiningDate: "2025-02-01", address: "45 Oak Ave, Boston, MA", profileImage: "", status: "ACTIVE", role: "ROLE_EMPLOYEE" }
];

let leaves = [
  { id: 1, employeeId: 3, employeeName: "Sarah Jenkins", leaveType: "SICK", startDate: "2026-07-10", endDate: "2026-07-12", reason: "Dental surgery recovery", status: "PENDING", approvedBy: "" },
  { id: 2, employeeId: 5, employeeName: "Robert Miller", leaveType: "ANNUAL", startDate: "2026-08-01", endDate: "2026-08-15", reason: "Family vacation to Hawaii", status: "APPROVED", approvedBy: "hr@enterprise.com" }
];

let attendance = [
  { id: 1, employeeId: 1, employeeName: "Alice Vance", date: "2026-07-03", checkIn: "08:52:10", checkOut: "17:30:15", status: "PRESENT" },
  { id: 2, employeeId: 2, employeeName: "Emily Davis", date: "2026-07-03", checkIn: "09:05:00", checkOut: "17:00:00", status: "PRESENT" },
  { id: 3, employeeId: 3, employeeName: "Sarah Jenkins", date: "2026-07-03", checkIn: "09:45:00", checkOut: "18:00:00", status: "LATE" }
];

let auditLogs = [
  { id: 1, action: "SYSTEM_INITIALIZATION", executedBy: "system", timestamp: "2026-07-04T00:00:00-07:00", details: "Core system successfully bootstrapped with demo schemas", ipAddress: "127.0.0.1" },
  { id: 2, action: "SEED_DATA_INJECT", executedBy: "system", timestamp: "2026-07-04T00:05:00-07:00", details: "Injected 7 default employee profiles and 4 departments", ipAddress: "127.0.0.1" }
];

let users = [
  { id: 1, email: "admin@enterprise.com", password: "password", role: "ROLE_ADMIN" },
  { id: 2, email: "hr@enterprise.com", password: "password", role: "ROLE_HR" },
  { id: 3, email: "sarah@enterprise.com", password: "password", role: "ROLE_EMPLOYEE" },
  { id: 4, email: "michael@enterprise.com", password: "password", role: "ROLE_EMPLOYEE" },
  { id: 5, email: "robert@enterprise.com", password: "password", role: "ROLE_EMPLOYEE" },
  { id: 6, email: "david@enterprise.com", password: "password", role: "ROLE_EMPLOYEE" },
  { id: 7, email: "jessica@enterprise.com", password: "password", role: "ROLE_EMPLOYEE" }
];

function logAction(action: string, executedBy: string, details: string, ip: string) {
  auditLogs.unshift({
    id: auditLogs.length + 1,
    action,
    executedBy,
    timestamp: new Date().toISOString(),
    details,
    ipAddress: ip
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '10mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // --- REST API ROUTING ---

  // Auth Operations
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      logAction("LOGIN_FAIL", email || "unknown", "Failed login attempt: invalid credentials", req.ip);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = `mock-jwt-token-for-${user.email}-${user.role}`;
    logAction("LOGIN_SUCCESS", user.email, "Successfully logged into the portal", req.ip);
    res.json({
      token,
      id: user.id,
      email: user.email,
      role: user.role
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, role } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const newUser = {
      id: users.length + 1,
      email,
      password,
      role: `ROLE_${role.toUpperCase()}`
    };
    users.push(newUser);
    logAction("REGISTER_SUCCESS", email, `Registered account with role ROLE_${role.toUpperCase()}`, req.ip);
    res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role });
  });

  // Dashboard Statistics
  app.get("/api/dashboard/stats", (req, res) => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "ACTIVE").length;
    const inactiveEmployees = employees.filter(e => e.status !== "ACTIVE").length;
    const totalDepartments = departments.length;
    const pendingLeaves = leaves.filter(l => l.status === "PENDING").length;

    // Recalculate department headcount
    departments.forEach(dept => {
      dept.employeeCount = employees.filter(e => e.departmentId === dept.id).length;
    });

    const departmentDistribution: Record<string, number> = {};
    departments.forEach(dept => {
      departmentDistribution[dept.name] = dept.employeeCount;
    });

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      pendingLeaves,
      departmentDistribution,
      attendanceStatusToday: {
        Present: attendance.filter(a => a.date === "2026-07-03" && a.status === "PRESENT").length,
        Late: attendance.filter(a => a.date === "2026-07-03" && a.status === "LATE").length,
        Absent: 0,
        Leave: leaves.filter(l => l.status === "APPROVED").length
      }
    });
  });

  // Department CRUD
  app.get("/api/departments", (req, res) => {
    departments.forEach(dept => {
      dept.employeeCount = employees.filter(e => e.departmentId === dept.id).length;
    });
    res.json(departments);
  });

  app.get("/api/departments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const dept = departments.find(d => d.id === id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    dept.employeeCount = employees.filter(e => e.departmentId === dept.id).length;
    res.json(dept);
  });

  app.post("/api/departments", (req, res) => {
    const { name, description, headId } = req.body;
    const head = employees.find(e => e.id === headId);
    const newDept = {
      id: departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1,
      name,
      description,
      headId: head ? head.id : null,
      headName: head ? `${head.firstName} ${head.lastName}` : "",
      employeeCount: 0
    };
    departments.push(newDept);
    logAction("CREATE_DEPARTMENT", "ADMIN/HR", `Created department: ${name}`, req.ip);
    res.status(201).json(newDept);
  });

  app.put("/api/departments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const deptIndex = departments.findIndex(d => d.id === id);
    if (deptIndex === -1) return res.status(404).json({ message: "Department not found" });

    const { name, description, headId } = req.body;
    const head = employees.find(e => e.id === headId);

    departments[deptIndex] = {
      ...departments[deptIndex],
      name,
      description,
      headId: head ? head.id : null,
      headName: head ? `${head.firstName} ${head.lastName}` : ""
    };

    logAction("UPDATE_DEPARTMENT", "ADMIN/HR", `Updated department: ${name}`, req.ip);
    res.json(departments[deptIndex]);
  });

  app.delete("/api/departments/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ message: "Department not found" });
    const dept = departments[index];
    departments.splice(index, 1);
    logAction("DELETE_DEPARTMENT", "ADMIN", `Deleted department: ${dept.name}`, req.ip);
    res.sendStatus(204);
  });

  // Employee CRUD
  app.get("/api/employees", (req, res) => {
    let result = [...employees];
    const { search, departmentId, status } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(e =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      );
    }

    if (departmentId) {
      result = result.filter(e => e.departmentId === parseInt(departmentId as string));
    }

    if (status) {
      result = result.filter(e => e.status.toLowerCase() === (status as string).toLowerCase());
    }

    // Mock Pagination response object matching Spring Boot PageImpl
    const page = parseInt(req.query.page as string || "0");
    const size = parseInt(req.query.size as string || "10");
    const paginatedItems = result.slice(page * size, (page + 1) * size);

    res.json({
      content: paginatedItems,
      totalElements: result.length,
      totalPages: Math.ceil(result.length / size),
      size: size,
      number: page
    });
  });

  app.get("/api/employees/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const emp = employees.find(e => e.id === id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  });

  app.post("/api/employees", (req, res) => {
    const { firstName, lastName, email, phoneNumber, departmentId, designation, salary, joiningDate, address, profileImage, status } = req.body;
    const dept = departments.find(d => d.id === parseInt(departmentId));

    const newEmp = {
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      firstName,
      lastName,
      email,
      phoneNumber,
      departmentId: dept ? dept.id : null,
      departmentName: dept ? dept.name : "",
      designation,
      salary: parseFloat(salary),
      joiningDate,
      address,
      profileImage: profileImage || "",
      status: status || "ACTIVE",
      role: "ROLE_EMPLOYEE"
    };

    employees.push(newEmp);

    // Auto-create matching login user if not exists
    if (!users.find(u => u.email === email)) {
      users.push({
        id: users.length + 1,
        email,
        password: "password",
        role: "ROLE_EMPLOYEE"
      });
    }

    logAction("CREATE_EMPLOYEE", "ADMIN/HR", `Created employee profile: ${firstName} ${lastName} (${email})`, req.ip);
    res.status(201).json(newEmp);
  });

  app.put("/api/employees/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ message: "Employee not found" });

    const { firstName, lastName, email, phoneNumber, departmentId, designation, salary, joiningDate, address, profileImage, status } = req.body;
    const dept = departments.find(d => d.id === parseInt(departmentId));

    employees[index] = {
      ...employees[index],
      firstName,
      lastName,
      email,
      phoneNumber,
      departmentId: dept ? dept.id : null,
      departmentName: dept ? dept.name : "",
      designation,
      salary: parseFloat(salary),
      joiningDate,
      address,
      profileImage: profileImage || employees[index].profileImage,
      status: status || employees[index].status
    };

    logAction("UPDATE_EMPLOYEE", "ADMIN/HR", `Updated employee: ${firstName} ${lastName}`, req.ip);
    res.json(employees[index]);
  });

  app.delete("/api/employees/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ message: "Employee not found" });
    const emp = employees[index];
    employees.splice(index, 1);
    logAction("DELETE_EMPLOYEE", "ADMIN", `Deleted employee profile: ${emp.firstName} ${emp.lastName}`, req.ip);
    res.sendStatus(204);
  });

  // Leave operations
  app.get("/api/leaves", (req, res) => {
    res.json(leaves);
  });

  app.get("/api/leaves/employee/:id", (req, res) => {
    const empId = parseInt(req.params.id);
    res.json(leaves.filter(l => l.employeeId === empId));
  });

  app.post("/api/leaves/request/:employeeId", (req, res) => {
    const empId = parseInt(req.params.employeeId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const { leaveType, startDate, endDate, reason } = req.body;
    const newLeave = {
      id: leaves.length > 0 ? Math.max(...leaves.map(l => l.id)) + 1 : 1,
      employeeId: empId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "PENDING",
      approvedBy: ""
    };
    leaves.push(newLeave);
    logAction("REQUEST_LEAVE", emp.email, `Submitted a new ${leaveType} leave request`, req.ip);
    res.status(201).json(newLeave);
  });

  app.put("/api/leaves/:id/review", (req, res) => {
    const id = parseInt(req.params.id);
    const leaveIndex = leaves.findIndex(l => l.id === id);
    if (leaveIndex === -1) return res.status(404).json({ message: "Leave request not found" });

    const { status, reviewer } = req.body;
    leaves[leaveIndex].status = status;
    leaves[leaveIndex].approvedBy = reviewer || "hr@enterprise.com";

    logAction("REVIEW_LEAVE", reviewer || "hr@enterprise.com", `Reviewed leave request ${id} -> ${status}`, req.ip);
    res.json(leaves[leaveIndex]);
  });

  // Attendance operations
  app.get("/api/attendance/today", (req, res) => {
    res.json(attendance.filter(a => a.date === new Date().toISOString().split('T')[0]));
  });

  app.get("/api/attendance/employee/:id", (req, res) => {
    const empId = parseInt(req.params.id);
    res.json(attendance.filter(a => a.employeeId === empId));
  });

  app.post("/api/attendance/check-in/:employeeId", (req, res) => {
    const empId = parseInt(req.params.employeeId);
    const emp = employees.find(e => e.id === empId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(a => a.employeeId === empId && a.date === today);
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const status = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30) ? "LATE" : "PRESENT";

    const log = {
      id: attendance.length > 0 ? Math.max(...attendance.map(a => a.id)) + 1 : 1,
      employeeId: empId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      date: today,
      checkIn: timeStr,
      checkOut: "",
      status
    };

    attendance.push(log);
    logAction("CHECK_IN", emp.email, `Checked in at ${timeStr} (${status})`, req.ip);
    res.status(201).json(log);
  });

  app.post("/api/attendance/check-out/:employeeId", (req, res) => {
    const empId = parseInt(req.params.employeeId);
    const today = new Date().toISOString().split('T')[0];
    const logIndex = attendance.findIndex(a => a.employeeId === empId && a.date === today);

    if (logIndex === -1) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (attendance[logIndex].checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    attendance[logIndex].checkOut = timeStr;

    const emp = employees.find(e => e.id === empId);
    logAction("CHECK_OUT", emp?.email || "unknown", `Checked out at ${timeStr}`, req.ip);
    res.json(attendance[logIndex]);
  });

  // Get Audit Logs
  app.get("/api/audit-logs", (req, res) => {
    res.json(auditLogs);
  });

  // --- VITE MIDDLEWARE SETUP ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Development Server running on port ${PORT}`);
  });
}

startServer();
