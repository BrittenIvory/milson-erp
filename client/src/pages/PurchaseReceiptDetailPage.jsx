import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, message, Typography, Spin } from 'antd';
import { purchaseReceiptsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PurchaseReceiptDetailPage() {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    purchaseReceiptsAPI.getById(id)
      .then((res) => setReceipt(res.data.data))
      .catch(() => message.error('Failed to load receipt'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!receipt) return <Card><Title level={4}>Receipt not found</Title></Card>;

  const lineColumns = [
    { title: 'PO #', key: 'po', render: (_, r) => r.PurchaseOrderLine?.PurchaseOrder?.po_number || '-' },
    { title: 'Part Number', key: 'part', render: (_, r) => r.Part?.part_number || '-' },
    { title: 'Description', key: 'desc', render: (_, r) => r.Part?.description || '-', ellipsis: true },
    { title: 'Qty Received', dataIndex: 'quantity_received', key: 'qty', render: (v) => parseFloat(v) },
  ];

  return (
    <Card>
      <Title level={4}>Purchase Receipt: {receipt.receipt_number}</Title>
      <Descriptions bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Receipt Number">{receipt.receipt_number}</Descriptions.Item>
        <Descriptions.Item label="Container">{receipt.Container?.container_number || '-'}</Descriptions.Item>
        <Descriptions.Item label="Receipt Date">{dayjs(receipt.receipt_date).format('MM/DD/YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Received By">{receipt.receiver ? `${receipt.receiver.first_name} ${receipt.receiver.last_name}` : '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>{receipt.notes || '-'}</Descriptions.Item>
      </Descriptions>
      <Title level={5}>Items Received</Title>
      <Table columns={lineColumns} dataSource={receipt.lines || []} rowKey="id" pagination={false} />
    </Card>
  );
}
