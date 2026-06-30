import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PartsPage from './pages/PartsPage';
import PartFormPage from './pages/PartFormPage';
import SuppliersPage from './pages/SuppliersPage';
import SupplierFormPage from './pages/SupplierFormPage';
import CustomersPage from './pages/CustomersPage';
import CustomerFormPage from './pages/CustomerFormPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import SalesOrderFormPage from './pages/SalesOrderFormPage';
import SalesOrderDetailPage from './pages/SalesOrderDetailPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderFormPage from './pages/PurchaseOrderFormPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import ContainersPage from './pages/ContainersPage';
import ContainerFormPage from './pages/ContainerFormPage';
import ContainerDetailPage from './pages/ContainerDetailPage';
import PurchaseReceiptsPage from './pages/PurchaseReceiptsPage';
import PurchaseReceiptDetailPage from './pages/PurchaseReceiptDetailPage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';
import AuditLogsPage from './pages/AuditLogsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '200px auto' }} />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route path="parts/new" element={<PartFormPage />} />
        <Route path="parts/:id/edit" element={<PartFormPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/new" element={<SupplierFormPage />} />
        <Route path="suppliers/:id/edit" element={<SupplierFormPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerFormPage />} />
        <Route path="customers/:id/edit" element={<CustomerFormPage />} />
        <Route path="sales-orders" element={<SalesOrdersPage />} />
        <Route path="sales-orders/new" element={<SalesOrderFormPage />} />
        <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />
        <Route path="sales-orders/:id/edit" element={<SalesOrderFormPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />
        <Route path="containers" element={<ContainersPage />} />
        <Route path="containers/new" element={<ContainerFormPage />} />
        <Route path="containers/:id" element={<ContainerDetailPage />} />
        <Route path="containers/:id/edit" element={<ContainerFormPage />} />
        <Route path="purchase-receipts" element={<PurchaseReceiptsPage />} />
        <Route path="purchase-receipts/:id" element={<PurchaseReceiptDetailPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<UserFormPage />} />
        <Route path="users/:id/edit" element={<UserFormPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
