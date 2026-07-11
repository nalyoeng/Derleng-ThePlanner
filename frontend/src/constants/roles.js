export const ADMIN_ROLES = [
  "super_admin",
  "moderator",
  "place_manager",
];

export const USER_ROLES = ["user"];

export const normalizeRole = (role) =>
  String(role || "user")
    .trim()
    .toLowerCase();

export const isAdminRole = (role) =>
  ADMIN_ROLES.includes(normalizeRole(role));