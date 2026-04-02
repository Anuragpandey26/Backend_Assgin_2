/**
 * Industry Level Permissions Architecture
 * Define granular permissions for every action.
 */

export const PERMISSIONS = {
  // User Management
  USER_READ_ALL: "user:read_all",
  USER_UPDATE_ROLE: "user:update_role",
  USER_UPDATE_STATUS: "user:update_status",
  USER_MANAGE: "user:manage",

  // Finance Records
  FINANCE_READ_ALL: "finance:read_all",
  FINANCE_READ_OWN: "finance:read_own",
  FINANCE_CREATE: "finance:create",
  FINANCE_UPDATE_ALL: "finance:update_all",
  FINANCE_UPDATE_OWN: "finance:update_own",
  FINANCE_DELETE_ALL: "finance:delete_all",
  FINANCE_DELETE_OWN: "finance:delete_own",

  // Dashboard & Summary
  DASHBOARD_VIEW: "dashboard:view",
};

/**
 * Mapping of Roles to Permission Sets
 */
export const ROLE_PERMISSIONS = {
  ADMIN: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_UPDATE_ROLE,
    PERMISSIONS.USER_UPDATE_STATUS,
    PERMISSIONS.FINANCE_READ_ALL,
    PERMISSIONS.FINANCE_CREATE,
    PERMISSIONS.FINANCE_UPDATE_ALL,
    PERMISSIONS.FINANCE_DELETE_ALL,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  ANALYST: [
    PERMISSIONS.FINANCE_READ_ALL,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.FINANCE_READ_OWN,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
};
