import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usersAPI } from '../services/api';

const { Title } = Typography;

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await usersAPI.list({ page, limit: pageSize, search });
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    try {
      await usersAPI.deactivate(id);
      message.success('User deactivated');
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('Failed to deactivate user');
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Name', key: 'name', render: (_, r) => `${r.first_name} ${r.last_name}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', key: 'role', render: (_, r) => <Tag color="blue">{r.Role?.name}</Tag> },
    { title: 'Status', dataIndex: 'is_active', key: 'status', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Last Login', dataIndex: 'last_login', key: 'login', render: (d) => d ? new Date(d).toLocaleString() : 'Never' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/users/${record.id}/edit`)} />
          <Popconfirm title="Deactivate user?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Users</Title>
        <Space>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/new')}>Add User</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)} />
    </Card>
  );
}
