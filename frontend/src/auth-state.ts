export type UserRole = 'OPERATOR' | 'GRID_ENGINEER' | 'CHIEF_ADMIN';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeId: string;
  department: string;
}

export interface AuthorityUser {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export const MOCK_USERS: Record<string, { passkey: string; user: AuthSession }> = {
  "operator@optigrid.io": {
    passkey: "op123",
    user: {
      id: "usr_op_01",
      name: "David Kimani",
      email: "operator@optigrid.io",
      role: "OPERATOR",
      badgeId: "OP-4091",
      department: "Field Maintenance & Monitoring",
    },
  },
  "engineer@optigrid.io": {
    passkey: "eng123",
    user: {
      id: "usr_eng_02",
      name: "Eng. Marcus Thorne",
      email: "engineer@optigrid.io",
      role: "GRID_ENGINEER",
      badgeId: "GE-8820",
      department: "Power Systems & Optimization",
    },
  },
  "admin@optigrid.io": {
    passkey: "admin123",
    user: {
      id: "usr_adm_03",
      name: "Dr. Amina Patel",
      email: "admin@optigrid.io",
      role: "CHIEF_ADMIN",
      badgeId: "CA-0012",
      department: "Executive Microgrid Operations",
    },
  },
};

export const AUTHORITIES_DIRECTORY: AuthorityUser[] = [
  { id: 'auth_1', name: 'Dr. Amina Patel', role: 'CHIEF_ADMIN', avatar: 'AP' },
  { id: 'auth_2', name: 'Eng. Marcus Thorne', role: 'GRID_ENGINEER', avatar: 'MT' },
  { id: 'auth_3', name: 'Director Tariq Vance', role: 'CHIEF_ADMIN', avatar: 'TV' },
];

export interface EmergencyActionTicket {
  id: string;
  actionTitle: string;
  severity: 'HIGH' | 'CRITICAL';
  description: string;
  commandPayload: string;
  requiredApprovals: 2;
  approvedBy: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}