/**
 * User Data Transfer Object
 * Formats user objects for client responses.
 */

export const toUserResponse = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const toUserList = (users) => {
  return users.map(toUserResponse);
};
