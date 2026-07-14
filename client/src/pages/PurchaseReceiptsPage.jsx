import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Card, Space, message, Typography } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { purchaseReceiptsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PurchaseReceiptsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await purchaseReceiptsAPI.list({ page, limit: pageSize, search });
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: 'Receipt #', dataIndex: 'receipt_number', key: 'receipt_number' },
    { title: 'Container', key: 'container', render: (_, r) => r.Container?.container_number || '-' },
    { title: 'Date', dataIndex: 'receipt_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
    { title: 'Received By', key: 'receiver', render: (_, r) => r.receiver ? `${r.receiver.first_name} ${r.receiver.last_name}` : '-' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/purchase-receipts/${record.id}`)}>View</Button>,
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Purchase Receipts</Title>
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 250 }} />
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)} />
    </Card>
  );
}
