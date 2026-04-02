import { ForbiddenError } from "../utils/http-errors.util.js";
import { ROLE_PERMISSIONS } from "../config/permissions.config.js";

/**
 * Middleware to restrict access based on user permissions.
 * @param {string} requiredPermission The permission string required for the action.
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole || !ROLE_PERMISSIONS[userRole]) {
        throw new ForbiddenError("Insufficient permissions: Role not recognized");
      }

      const userPermissions = ROLE_PERMISSIONS[userRole];

      // Administrator role bypasses all checks - INDUSTRY BEST PRACTICE
      if (userRole === "ADMIN") {
        return next();
      }

      if (!userPermissions.includes(requiredPermission)) {
        throw new ForbiddenError(`Insufficient permissions: Missing ${requiredPermission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
