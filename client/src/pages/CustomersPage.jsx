import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { customersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function CustomersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await customersAPI.list({ page, limit: pageSize, search });
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    try {
      await customersAPI.deactivate(id);
      message.success('Customer deactivated');
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('Failed to deactivate customer');
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contact_person', key: 'contact' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Terms', dataIndex: 'payment_terms', key: 'terms', render: (v) => v ? `${v} days` : '-' },
    { title: 'Credit Limit', dataIndex: 'credit_limit', key: 'credit', render: (v) => v ? `$${parseFloat(v).toLocaleString()}` : '-' },
    { title: 'Status', dataIndex: 'is_active', key: 'status', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          {hasPermission('customers', 'update') && <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/customers/${record.id}/edit`)} />}
          {hasPermission('customers', 'delete') && (
            <Popconfirm title="Deactivate?" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Customers</Title>
        <Space>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 250 }} />
          {hasPermission('customers', 'create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/customers/new')}>Add Customer</Button>}
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
    </Card>
  );
}
