import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Select, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { containersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Pending: 'default', 'In Transit': 'processing', 'At Port': 'cyan', Customs: 'orange', Arrived: 'green', Received: 'blue' };

export default function ContainersPage() {
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
      const res = await containersAPI.list(params);
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const columns = [
    { title: 'Container #', dataIndex: 'container_number', key: 'container_number' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Vessel', dataIndex: 'vessel_name', key: 'vessel' },
    { title: 'ETA', dataIndex: 'expected_arrival_date', key: 'eta', render: (d) => d ? dayjs(d).format('MM/DD/YYYY') : '-' },
    { title: 'Arrived', dataIndex: 'actual_arrival_date', key: 'arrived', render: (d) => d ? dayjs(d).format('MM/DD/YYYY') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/containers/${record.id}`)}>View</Button>,
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Containers</Title>
        <Space>
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 200 }} />
          <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={(v) => setStatusFilter(v || '')}
            options={['Pending', 'In Transit', 'At Port', 'Customs', 'Arrived', 'Received'].map((s) => ({ value: s, label: s }))} />
          {hasPermission('containers', 'create') && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/containers/new')}>New Container</Button>}
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)} />
    </Card>
  );
}
