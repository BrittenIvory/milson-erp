import { useState, useEffect } from 'react';
import { Table, Button, Input, Card, Space, Modal, InputNumber, Select, message, Typography, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { inventoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

export default function InventoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustPartId, setAdjustPartId] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState('Adjustment');
  const [txData, setTxData] = useState([]);
  const [txModal, setTxModal] = useState(false);
  const { hasPermission } = useAuth();

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await inventoryAPI.list({ page, limit: pageSize, search });
      setData(res.data.data);
      setPagination({ current: res.data.pagination.page, pageSize, total: res.data.pagination.total });
    } catch (err) {
      message.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdjust = async () => {
    try {
      await inventoryAPI.adjust(adjustPartId, { quantity: adjustQty, reason: adjustReason, transaction_type: adjustType });
      message.success('Inventory adjusted');
      setAdjustModal(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error('Failed to adjust inventory');
    }
  };

  const showTransactions = async (partId) => {
    try {
      const res = await inventoryAPI.transactions({ part_id: partId, limit: 50 });
      setTxData(res.data.data);
      setTxModal(true);
    } catch (err) {
      message.error('Failed to load transactions');
    }
  };

  const columns = [
    { title: 'Part Number', key: 'part_number', render: (_, r) => r.Part?.part_number },
    { title: 'Description', key: 'desc', render: (_, r) => r.Part?.description, ellipsis: true },
    {
      title: 'On Hand', dataIndex: 'quantity_on_hand', key: 'on_hand',
      render: (v, r) => {
        const qty = parseFloat(v);
        const reorder = parseFloat(r.reorder_point);
        const isLow = reorder > 0 && qty <= reorder;
        return <Tag color={isLow ? 'red' : 'green'}>{qty}</Tag>;
      },
    },
    { title: 'Allocated', dataIndex: 'quantity_allocated', key: 'allocated', render: (v) => parseFloat(v) },
    { title: 'On Order', dataIndex: 'quantity_on_order', key: 'on_order', render: (v) => parseFloat(v) },
    { title: 'Available', key: 'available', render: (_, r) => parseFloat(r.quantity_on_hand) - parseFloat(r.quantity_allocated) },
    { title: 'Reorder Point', dataIndex: 'reorder_point', key: 'reorder', render: (v) => parseFloat(v) },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          {hasPermission('inventory', 'update') && (
            <Button type="link" onClick={() => { setAdjustPartId(record.part_id); setAdjustQty(0); setAdjustReason(''); setAdjustModal(true); }}>
              Adjust
            </Button>
          )}
          <Button type="link" onClick={() => showTransactions(record.part_id)}>History</Button>
        </Space>
      ),
    },
  ];

  const txColumns = [
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (d) => new Date(d).toLocaleString() },
    { title: 'Type', dataIndex: 'transaction_type', key: 'type', render: (t) => <Tag>{t}</Tag> },
    { title: 'Quantity', dataIndex: 'quantity', key: 'qty', render: (v) => { const n = parseFloat(v); return <span style={{ color: n >= 0 ? 'green' : 'red' }}>{n > 0 ? '+' : ''}{n}</span>; } },
    { title: 'Reference', dataIndex: 'reference_type', key: 'ref' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true },
    { title: 'By', key: 'by', render: (_, r) => r.creator ? `${r.creator.first_name} ${r.creator.last_name}` : '-' },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Inventory</Title>
        <Input placeholder="Search parts..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchData(1)} prefix={<SearchOutlined />} style={{ width: 250 }} />
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ ...pagination, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        onChange={(p) => fetchData(p.current, p.pageSize)} />

      <Modal title="Adjust Inventory" open={adjustModal} onOk={handleAdjust} onCancel={() => setAdjustModal(false)}>
        <div style={{ marginBottom: 16 }}>
          <label>Type:</label>
          <Select value={adjustType} onChange={setAdjustType} style={{ width: '100%', marginTop: 8 }}
            options={[{ value: 'Adjustment', label: 'Adjustment' }, { value: 'Count', label: 'Cycle Count' }, { value: 'Return', label: 'Return' }]} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Quantity (positive to add, negative to remove):</label>
          <InputNumber value={adjustQty} onChange={setAdjustQty} style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div>
          <label>Reason:</label>
          <TextArea value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} rows={2} style={{ marginTop: 8 }} />
        </div>
      </Modal>

      <Modal title="Inventory Transactions" open={txModal} onCancel={() => setTxModal(false)} footer={null} width={800}>
        <Table columns={txColumns} dataSource={txData} rowKey="id" size="small" pagination={false} />
      </Modal>
    </Card>
  );
}
