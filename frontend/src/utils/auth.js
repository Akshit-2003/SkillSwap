export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (_error) {
    return null;
  }
};

export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('user_updated'));
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('user_updated'));
};

export const getHomeRouteForUser = (user) => {
  if (!user) {
    return '/login';
  }

  if (user.role === 'Main Admin' || user.role === 'Super Admin') {
    return '/super-admin';
  }

  if (user.role === 'Teacher Admin') {
    return '/admin';
  }

  return '/dashboard';
};

export const hasRequiredRole = (user, roles = []) => {
  if (!user) {
    return false;
  }

  return roles.length === 0 || roles.includes(user.role);
};
