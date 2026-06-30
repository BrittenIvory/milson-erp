import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (module, action) => {
    if (!user || !user.Role) return false;
    const roleName = user.Role.name;
    if (roleName === 'Admin') return true;

    const ROLE_PERMISSIONS = {
      Sales: {
        parts: ['read'],
        customers: ['create', 'read', 'update', 'delete'],
        customer_prices: ['create', 'read', 'update', 'delete'],
        sales_orders: ['create', 'read', 'update', 'delete'],
        purchase_orders: ['read'],
        containers: ['read'],
        inventory: ['read'],
        dashboard: ['read'],
      },
      Purchasing: {
        parts: ['create', 'read', 'update', 'delete'],
        suppliers: ['create', 'read', 'update', 'delete'],
        supplier_prices: ['create', 'read', 'update', 'delete'],
        purchase_orders: ['create', 'read', 'update', 'delete'],
        containers: ['create', 'read', 'update', 'delete'],
        purchase_receipts: ['read'],
        inventory: ['read'],
        dashboard: ['read'],
      },
      Warehouse: {
        parts: ['read'],
        suppliers: ['read'],
        containers: ['read', 'update'],
        purchase_receipts: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        customers: ['read'],
        dashboard: ['read'],
      },
      Viewer: {
        parts: ['read'],
        suppliers: ['read'],
        supplier_prices: ['read'],
        customers: ['read'],
        customer_prices: ['read'],
        sales_orders: ['read'],
        purchase_orders: ['read'],
        containers: ['read'],
        purchase_receipts: ['read'],
        inventory: ['read'],
        dashboard: ['read'],
      },
    };

    const perms = ROLE_PERMISSIONS[roleName];
    if (!perms) return false;
    const modulePerms = perms[module];
    return modulePerms && modulePerms.includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
