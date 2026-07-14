import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ContainerOutlined,
  InboxOutlined,
  DatabaseOutlined,
  UserOutlined,
  AuditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    hasPermission('parts', 'read') && { key: '/parts', icon: <ToolOutlined />, label: 'Parts' },
    hasPermission('suppliers', 'read') && { key: '/suppliers', icon: <ShopOutlined />, label: 'Suppliers' },
    hasPermission('customers', 'read') && { key: '/customers', icon: <TeamOutlined />, label: 'Customers' },
    hasPermission('sales_orders', 'read') && { key: '/sales-orders', icon: <ShoppingCartOutlined />, label: 'Sales Orders' },
    hasPermission('purchase_orders', 'read') && { key: '/purchase-orders', icon: <FileTextOutlined />, label: 'Purchase Orders' },
    hasPermission('containers', 'read') && { key: '/containers', icon: <ContainerOutlined />, label: 'Containers' },
    hasPermission('purchase_receipts', 'read') && { key: '/purchase-receipts', icon: <InboxOutlined />, label: 'Purchase Receipts' },
    hasPermission('inventory', 'read') && { key: '/inventory', icon: <DatabaseOutlined />, label: 'Inventory' },
    hasPermission('users', 'read') && { key: '/users', icon: <UserOutlined />, label: 'Users' },
    hasPermission('audit_logs', 'read') && { key: '/audit-logs', icon: <AuditOutlined />, label: 'Audit Logs' },
  ].filter(Boolean);

  const getSelectedKey = () => {
    const path = location.pathname;
    const match = menuItems.find((item) => path === item.key || (item.key !== '/' && path.startsWith(item.key)));
    return match ? match.key : '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', label: `${user?.first_name} ${user?.last_name}`, disabled: true },
    { key: 'role', label: `Role: ${user?.Role?.name}`, disabled: true },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#1a3c6e' }}
        width={220}
      >
        <div className="logo">
          {collapsed ? 'M' : 'Milson ERP'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined onClick={() => setCollapsed(false)} style={{ fontSize: 18, cursor: 'pointer' }} />
          ) : (
            <MenuFoldOutlined onClick={() => setCollapsed(true)} style={{ fontSize: 18, cursor: 'pointer' }} />
          )}

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1a3c6e' }} />
              <Text>{user?.first_name} {user?.last_name}</Text>
              <DownOutlined style={{ fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
