import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Tag, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { partsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

export default function PartsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await partsAPI.list({ page, limit: pageSize, search });
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = () => fetchData(1);

  const handleDelete = async (id) => {
    try {
      await partsAPI.deactivate(id);
      message.success('Part deactivated');
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('Failed to deactivate part');
    }
  };

  const columns = [
    { title: 'Part Number', dataIndex: 'part_number', key: 'part_number', sorter: true },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Material', dataIndex: 'material', key: 'material' },
    { title: 'Weight', key: 'weight', render: (_, r) => r.weight ? `${r.weight} ${r.weight_unit}` : '-' },
    { title: 'UOM', dataIndex: 'unit_of_measure', key: 'uom' },
    { title: 'Status', dataIndex: 'is_active', key: 'status', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {hasPermission('parts', 'update') && (
            <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/parts/${record.id}/edit`)} />
          )}
          {hasPermission('parts', 'delete') && (
            <Popconfirm title="Deactivate this part?" onConfirm={() => handleDelete(record.id)}>
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
        <Title level={4} style={{ margin: 0 }}>Parts</Title>
        <Space>
          <Input
            placeholder="Search parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          {hasPermission('parts', 'create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/parts/new')}>
              Add Part
            </Button>
          )}
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} parts`,
        }}
        onChange={(p) => fetchData(p.current, p.pageSize)}
      />
    </Card>
  );
}
