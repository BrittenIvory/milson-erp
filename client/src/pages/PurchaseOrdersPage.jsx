import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Select, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { purchaseOrdersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Draft: 'default', Sent: 'blue', Confirmed: 'processing', 'Partially Received': 'orange', Received: 'green', Cancelled: 'red' };

export default function PurchaseOrdersPage() {
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
      const res = await purchaseOrdersAPI.list(params);
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const columns = [
    { title: 'PO #', dataIndex: 'po_number', key: 'po_number' },
    { title: 'Supplier', dataIndex: ['Supplier', 'name'], key: 'supplier' },
    { title: 'Date', dataIndex: 'order_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
    { title: 'Expected', dataIndex: 'expected_date', key: 'expected', render: (d) => d ? dayjs(d).format('MM/DD/YYYY') : '-' },
    { title: 'Total', dataIndex: 'total_amount', key: 'total', render: (v) => `$${parseFloat(v).toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/purchase-orders/${record.id}`)}>View</Button>,
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Purchase Orders</Title>
        <Space>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 200 }} />
          <Select placeholder="Status" allowClear style={{ width: 180 }} onChange={(v) => setStatusFilter(v || '')}
            options={['Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled'].map((s) => ({ value: s, label: s }))} />
          {hasPermission('purchase_orders', 'create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/purchase-orders/new')}>New PO</Button>}
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
    </Card>
  );
}
