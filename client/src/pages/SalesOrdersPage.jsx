import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Select, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { salesOrdersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Draft: 'default', Confirmed: 'blue', 'In Progress': 'processing', Shipped: 'cyan', Delivered: 'green', Cancelled: 'red' };

export default function SalesOrdersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, search };
      if (statusFilter) params.status = statusFilter;
      const res = await salesOrdersAPI.list(params);
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number' },
    { title: 'Customer', dataIndex: ['Customer', 'name'], key: 'customer' },
    { title: 'Date', dataIndex: 'order_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
    { title: 'Required', dataIndex: 'required_date', key: 'required', render: (d) => d ? dayjs(d).format('MM/DD/YYYY') : '-' },
    { title: 'Total', dataIndex: 'total_amount', key: 'total', render: (v) => `$${parseFloat(v).toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Created By', key: 'creator', render: (_, r) => r.creator ? `${r.creator.first_name} ${r.creator.last_name}` : '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/sales-orders/${record.id}`)}>View</Button>
      ),
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Sales Orders</Title>
        <Space>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 200 }} />
          <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={(v) => setStatusFilter(v || '')}
            options={['Draft', 'Confirmed', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'].map((s) => ({ value: s, label: s }))} />
          {hasPermission('sales_orders', 'create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/sales-orders/new')}>New Sales Order</Button>}
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
    </Card>
  );
}
