import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import {
  ToolOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ContainerOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = {
  Draft: 'default',
  Confirmed: 'blue',
  'In Progress': 'processing',
  Shipped: 'cyan',
  Delivered: 'green',
  Sent: 'blue',
  'Partially Received': 'orange',
  Received: 'green',
  Cancelled: 'red',
  Pending: 'default',
  'In Transit': 'processing',
  'At Port': 'cyan',
  Customs: 'orange',
  Arrived: 'green',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecent(),
        ]);
        setStats(statsRes.data.data);
        setRecent(recentRes.data.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const soColumns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number' },
    { title: 'Customer', dataIndex: ['Customer', 'name'], key: 'customer' },
    { title: 'Date', dataIndex: 'order_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
    { title: 'Total', dataIndex: 'total_amount', key: 'total', render: (v) => `$${parseFloat(v).toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
  ];

  const poColumns = [
    { title: 'PO #', dataIndex: 'po_number', key: 'po_number' },
    { title: 'Supplier', dataIndex: ['Supplier', 'name'], key: 'supplier' },
    { title: 'Date', dataIndex: 'order_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
    { title: 'Total', dataIndex: 'total_amount', key: 'total', render: (v) => `$${parseFloat(v).toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
  ];

  const containerColumns = [
    { title: 'Container #', dataIndex: 'container_number', key: 'container_number' },
    { title: 'ETA', dataIndex: 'expected_arrival_date', key: 'eta', render: (d) => d ? dayjs(d).format('MM/DD/YYYY') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/parts')}>
            <Statistic title="Active Parts" value={stats?.totalParts || 0} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/customers')}>
            <Statistic title="Customers" value={stats?.totalCustomers || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/suppliers')}>
            <Statistic title="Suppliers" value={stats?.totalSuppliers || 0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/sales-orders')}>
            <Statistic title="Active SOs" value={stats?.activeSalesOrders || 0} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/purchase-orders')}>
            <Statistic title="Active POs" value={stats?.activePurchaseOrders || 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/containers')}>
            <Statistic title="Pending Containers" value={stats?.pendingContainers || 0} prefix={<ContainerOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card hoverable onClick={() => navigate('/inventory')}>
            <Statistic title="Low Stock" value={stats?.lowStockCount || 0} prefix={<WarningOutlined />} valueStyle={stats?.lowStockCount > 0 ? { color: '#cf1322' } : {}} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Sales Orders" size="small">
            <Table
              columns={soColumns}
              dataSource={recent?.recentSalesOrders || []}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({ onClick: () => navigate(`/sales-orders/${record.id}`) })}
              style={{ cursor: 'pointer' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Purchase Orders" size="small">
            <Table
              columns={poColumns}
              dataSource={recent?.recentPurchaseOrders || []}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({ onClick: () => navigate(`/purchase-orders/${record.id}`) })}
              style={{ cursor: 'pointer' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Containers" size="small">
            <Table
              columns={containerColumns}
              dataSource={recent?.recentContainers || []}
              rowKey="id"
              size="small"
              pagination={false}
              onRow={(record) => ({ onClick: () => navigate(`/containers/${record.id}`) })}
              style={{ cursor: 'pointer' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
