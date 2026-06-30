import { useState, useEffect } from 'react';
import { Table, Card, Select, Space, message, Typography, Tag } from 'antd';
import { auditLogsAPI } from '../services/api';

const { Title } = Typography;

const actionColors = { create: 'green', update: 'blue', delete: 'red' };

export default function AuditLogsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (entityFilter) params.entity_type = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await auditLogsAPI.list(params);
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [entityFilter, actionFilter]);

  const columns = [
    { title: 'Timestamp', dataIndex: 'created_at', key: 'date', render: (d) => new Date(d).toLocaleString(), width: 180 },
    { title: 'User', key: 'user', render: (_, r) => r.User ? `${r.User.first_name} ${r.User.last_name}` : '-' },
    { title: 'Action', dataIndex: 'action', key: 'action', render: (a) => <Tag color={actionColors[a]}>{a}</Tag> },
    { title: 'Entity', dataIndex: 'entity_type', key: 'entity' },
    { title: 'Entity ID', dataIndex: 'entity_id', key: 'entity_id' },
    { title: 'IP', dataIndex: 'ip_address', key: 'ip' },
    { title: 'Changes', key: 'changes', ellipsis: true, render: (_, r) => r.new_values ? JSON.stringify(r.new_values).substring(0, 100) : '-' },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Audit Logs</Title>
        <Space>
          <Select placeholder="Entity" allowClear style={{ width: 180 }} onChange={(v) => setEntityFilter(v || '')}
            options={['User', 'Part', 'Supplier', 'Customer', 'SalesOrder', 'PurchaseOrder', 'Container'].map((e) => ({ value: e, label: e }))} />
          <Select placeholder="Action" allowClear style={{ width: 120 }} onChange={(v) => setActionFilter(v || '')}
            options={['create', 'update', 'delete'].map((a) => ({ value: a, label: a }))} />
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)} />
    </Card>
  );
}
