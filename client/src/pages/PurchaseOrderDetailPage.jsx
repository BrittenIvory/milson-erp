import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Popconfirm, message, Typography, Spin, Select } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import { purchaseOrdersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Draft: 'default', Sent: 'blue', Confirmed: 'processing', 'Partially Received': 'orange', Received: 'green', Cancelled: 'red' };
const statusTransitions = {
  Draft: ['Sent'], Sent: ['Confirmed'], Confirmed: ['Partially Received', 'Received'],
  'Partially Received': ['Received'],
};

export default function PurchaseOrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const fetchOrder = async () => {
    try {
      const res = await purchaseOrdersAPI.getById(id);
      setOrder(res.data.data);
    } catch (err) {
      message.error('Failed to load PO');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await purchaseOrdersAPI.updateStatus(id, { status });
      message.success(`Status updated to ${status}`);
      fetchOrder();
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleCancel = async () => {
    try {
      await purchaseOrdersAPI.cancel(id);
      message.success('PO cancelled');
      fetchOrder();
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to cancel');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <Card><Title level={4}>PO not found</Title></Card>;

  const lineColumns = [
    { title: '#', dataIndex: 'line_number', key: 'line' },
    { title: 'Part Number', key: 'part', render: (_, r) => r.Part?.part_number },
    { title: 'Description', key: 'desc', render: (_, r) => r.Part?.description, ellipsis: true },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', render: (v) => parseFloat(v) },
    { title: 'Received', dataIndex: 'quantity_received', key: 'received', render: (v) => parseFloat(v) },
    { title: 'Unit Cost', dataIndex: 'unit_cost', key: 'cost', render: (v) => `$${parseFloat(v).toFixed(2)}` },
    { title: 'Line Total', dataIndex: 'line_total', key: 'total', render: (v) => `$${parseFloat(v).toFixed(2)}` },
  ];

  const nextStatuses = statusTransitions[order.status] || [];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Purchase Order: {order.po_number}</Title>
        <Space>
          {nextStatuses.length > 0 && hasPermission('purchase_orders', 'update') && (
            <Select placeholder="Change Status" style={{ width: 200 }} onChange={handleStatusChange}
              options={nextStatuses.map((s) => ({ value: s, label: `Move to ${s}` }))} />
          )}
          {hasPermission('purchase_orders', 'update') && !['Cancelled', 'Received'].includes(order.status) && (
            <Button icon={<EditOutlined />} onClick={() => navigate(`/purchase-orders/${id}/edit`)}>Edit</Button>
          )}
          {hasPermission('purchase_orders', 'delete') && !['Cancelled', 'Received'].includes(order.status) && (
            <Popconfirm title="Cancel this PO?" onConfirm={handleCancel}>
              <Button danger icon={<CloseOutlined />}>Cancel PO</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="PO Number">{order.po_number}</Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={statusColors[order.status]}>{order.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Supplier">{order.Supplier?.name} ({order.Supplier?.code})</Descriptions.Item>
        <Descriptions.Item label="Order Date">{dayjs(order.order_date).format('MM/DD/YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Expected Date">{order.expected_date ? dayjs(order.expected_date).format('MM/DD/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Total">${parseFloat(order.total_amount).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Shipping">{order.shipping_method || '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>{order.notes || '-'}</Descriptions.Item>
      </Descriptions>

      <Title level={5}>Line Items</Title>
      <Table columns={lineColumns} dataSource={order.lines || []} rowKey="id" pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={6} index={0}><strong>Total</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )} />
    </Card>
  );
}
