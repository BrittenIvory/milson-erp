import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Popconfirm, message, Typography, Spin, Select } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import { salesOrdersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Draft: 'default', Confirmed: 'blue', 'In Progress': 'processing', Shipped: 'cyan', Delivered: 'green', Cancelled: 'red' };
const statusTransitions = {
  Draft: ['Confirmed'], Confirmed: ['In Progress'], 'In Progress': ['Shipped'], Shipped: ['Delivered'],
};

export default function SalesOrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const fetchOrder = async () => {
    try {
      const res = await salesOrdersAPI.getById(id);
      setOrder(res.data.data);
    } catch (err) {
      message.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await salesOrdersAPI.updateStatus(id, { status });
      message.success(`Status updated to ${status}`);
      fetchOrder();
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleCancel = async () => {
    try {
      await salesOrdersAPI.cancel(id);
      message.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to cancel');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <Card><Title level={4}>Order not found</Title></Card>;

  const lineColumns = [
    { title: '#', dataIndex: 'line_number', key: 'line' },
    { title: 'Part Number', key: 'part', render: (_, r) => r.Part?.part_number },
    { title: 'Description', key: 'desc', render: (_, r) => r.Part?.description, ellipsis: true },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', render: (v) => parseFloat(v) },
    { title: 'Unit Price', dataIndex: 'unit_price', key: 'price', render: (v) => `$${parseFloat(v).toFixed(2)}` },
    { title: 'Line Total', dataIndex: 'line_total', key: 'total', render: (v) => `$${parseFloat(v).toFixed(2)}` },
  ];

  const nextStatuses = statusTransitions[order.status] || [];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Sales Order: {order.order_number}</Title>
        <Space>
          {nextStatuses.length > 0 && hasPermission('sales_orders', 'update') && (
            <Select placeholder="Change Status" style={{ width: 180 }} onChange={handleStatusChange}
              options={nextStatuses.map((s) => ({ value: s, label: `Move to ${s}` }))} />
          )}
          {hasPermission('sales_orders', 'update') && !['Cancelled', 'Delivered'].includes(order.status) && (
            <Button icon={<EditOutlined />} onClick={() => navigate(`/sales-orders/${id}/edit`)}>Edit</Button>
          )}
          {hasPermission('sales_orders', 'delete') && !['Cancelled', 'Delivered'].includes(order.status) && (
            <Popconfirm title="Cancel this order?" onConfirm={handleCancel}>
              <Button danger icon={<CloseOutlined />}>Cancel Order</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Order Number">{order.order_number}</Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={statusColors[order.status]}>{order.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Customer">{order.Customer?.name} ({order.Customer?.code})</Descriptions.Item>
        <Descriptions.Item label="Order Date">{dayjs(order.order_date).format('MM/DD/YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Required Date">{order.required_date ? dayjs(order.required_date).format('MM/DD/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Total">${parseFloat(order.total_amount).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Shipping Address" span={3}>{order.shipping_address || '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={3}>{order.notes || '-'}</Descriptions.Item>
        <Descriptions.Item label="Created By">{order.creator ? `${order.creator.first_name} ${order.creator.last_name}` : '-'}</Descriptions.Item>
        <Descriptions.Item label="Created">{dayjs(order.created_at).format('MM/DD/YYYY HH:mm')}</Descriptions.Item>
      </Descriptions>

      <Title level={5}>Line Items</Title>
      <Table columns={lineColumns} dataSource={order.lines || []} rowKey="id" pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={5} index={0}><strong>Total</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
}
