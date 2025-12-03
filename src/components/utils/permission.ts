// utils/permissions.ts

export interface User {
  id: number;
  email: string;
  role: "leader" | "staff";
  firstName: string;
  lastName: string;
}

export interface Project {
  id: number;
  title: string;
  leaderId: number;
  member: number[];
  // ... other fields
}

export interface Task {
  id: number;
  title: string;
  projectId: number;
  assignedTo: number[];
  createdBy?: number;
  // ... other fields
}

// ==================== LEADER PERMISSIONS ====================

// LD-ADM01: Quản lý nhân viên
export const canManageUsers = (user: User) => {
  return user.role === "leader";
};

// LD-ADM02: Quản lý dự án
export const canCreateProject = (user: User) => {
  return user.role === "leader";
};

export const canViewAllProjects = (user: User) => {
  return user.role === "leader";
};

export const canEditProject = (user: User, project: Project) => {
  return user.role === "leader";
};

export const canDeleteProject = (user: User) => {
  return user.role === "leader";
};

// LD-ADM03: Quản lý nhiệm vụ
export const canManageAllTasks = (user: User) => {
  return user.role === "leader";
};

// LD-ADM04: Quản lý tài nguyên
export const canManageResources = (user: User) => {
  return user.role === "leader";
};

// LD-ADM05: Quản lý thông báo
export const canManageNotifications = (user: User) => {
  return user.role === "leader";
};

// LD-ADM06: Quản lý hỗ trợ
export const canManageSupport = (user: User) => {
  return user.role === "leader";
};

// LD-ADM07: Quản lý bảo mật
export const canManageSecurity = (user: User) => {
  return user.role === "leader";
};

// LD-ADM08: Quản lý tiến độ dự án
export const canManageProjectProgress = (user: User) => {
  return user.role === "leader";
};

// LD-ADM09: Quản lý thành viên dự án
export const canManageProjectMembers = (user: User) => {
  return user.role === "leader";
};

// LD-ADM10: Quản lý khung thời gian
export const canManageTimeline = (user: User) => {
  return user.role === "leader";
};

// ==================== STAFF PERMISSIONS ====================

// ST-PRJJ01: Tạo dự án (KHÔNG có quyền này)
// ST-PRJJ02: Quản lý dự án - Chỉ xem và chỉnh sửa dự án mình tham gia
export const canViewProject = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff chỉ xem được project mình là member
  return project.member?.includes(user.id) || project.leaderId === user.id;
};

export const canEditOwnProject = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff KHÔNG được edit project
  return false;
};

// ST-PRJJ03: Quản lý nhiệm vụ - Tạo, phân công, theo dõi task trong dự án
export const canCreateTask = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff có thể tạo task nếu là member của project
  return project.member?.includes(user.id);
};

export const canEditTask = (user: User, task: Task, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff chỉ edit được task được giao cho mình
  return task.assignedTo?.includes(user.id);
};

export const canDeleteTask = (user: User, task: Task) => {
  if (user.role === "leader") return true;
  
  // Staff KHÔNG được xóa task
  return false;
};

// ST-PRJJ04: Quản lý tài nguyên - Quản lý tài nguyên dự án (không gian lưu trữ)
export const canManageProjectResources = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff có thể quản lý tài nguyên nếu là member
  return project.member?.includes(user.id);
};

// ST-PRJJ05: Theo dõi tiến độ - Xem và theo dõi tiến độ dự án
export const canViewProjectProgress = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff xem được tiến độ project mình tham gia
  return project.member?.includes(user.id);
};

// ST-PRJJ06: Quản lý thành viên - Thêm, xóa, quản lý thành viên
export const canManageMembersInProject = (user: User) => {
  // Chỉ Leader mới được quản lý members
  return user.role === "leader";
};

// ST-PRJJ07: Giao tiếp nhóm
export const canCommunicateInTeam = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff có thể giao tiếp nếu là member
  return project.member?.includes(user.id);
};

// ST-ALRT01: Cài đặt cảnh báo
export const canSetupAlerts = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff có thể cài đặt cảnh báo cho project mình tham gia
  return project.member?.includes(user.id);
};

// ST-RPT01: Xem báo cáo
export const canViewProjectReports = (user: User, project: Project) => {
  if (user.role === "leader") return true;
  
  // Staff xem được báo cáo project mình tham gia
  return project.member?.includes(user.id);
};

// ST-SPT01: Yêu cầu hỗ trợ
export const canRequestSupport = (user: User) => {
  // Tất cả user đều có thể yêu cầu hỗ trợ
  return true;
};

// ST-ACC01: Quản lý tài khoản
export const canManageOwnAccount = (user: User) => {
  // Tất cả user đều quản lý được tài khoản của mình
  return true;
};

// Helper: Lọc projects mà user được xem
export const getVisibleProjects = (user: User, allProjects: Project[]) => {
  if (user.role === "leader") {
    return allProjects; // Leader xem tất cả
  }
  
  // Staff chỉ xem projects mình là member
  return allProjects.filter(
    (project) =>
      project.member?.includes(user.id) || project.leaderId === user.id
  );
};

// Helper: Lọc tasks mà user được xem
export const getVisibleTasks = (
  user: User,
  allTasks: Task[],
  allProjects: Project[]
) => {
  if (user.role === "leader") {
    return allTasks; // Leader xem tất cả
  }
  
  // Staff chỉ xem tasks trong projects mình tham gia
  const visibleProjects = getVisibleProjects(user, allProjects);
  const visibleProjectIds = visibleProjects.map((p) => p.id);
  
  return allTasks.filter((task) => visibleProjectIds.includes(task.projectId));
};