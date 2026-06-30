import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Select, InputNumber, Popconfirm, Modal, message, Typography, Spin } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { containersAPI, purchaseOrdersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = { Pending: 'default', 'In Transit': 'processing', 'At Port': 'cyan', Customs: 'orange', Arrived: 'green', Received: 'blue' };

export default function ContainerDetailPage() {
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addLineModal, setAddLineModal] = useState(false);
  const [poLines, setPOLines] = useState([]);
  const [selectedPOLine, setSelectedPOLine] = useState(null);
  const [lineQty, setLineQty] = useState(1);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const fetchContainer = async () => {
    try {
      const res = await containersAPI.getById(id);
      setContainer(res.data.data);
    } catch (err) {
      message.error('Failed to load container');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContainer(); }, [id]);

  const openAddLine = async () => {
    try {
      const res = await purchaseOrdersAPI.list({ limit: 100, status: 'Confirmed' });
      setPurchaseOrders(res.data.data);
      setAddLineModal(true);
    } catch (err) {
      message.error('Failed to load POs');
    }
  };

  const loadPOLines = async (poId) => {
    setSelectedPO(poId);
    try {
      const res = await purchaseOrdersAPI.getById(poId);
      setPOLines(res.data.data.lines || []);
    } catch (err) {
      message.error('Failed to load PO lines');
    }
  };

  const handleAddLine = async () => {
    if (!selectedPOLine || !lineQty) { message.error('Select a PO line and quantity'); return; }
    try {
      await containersAPI.addLine(id, { purchase_order_line_id: selectedPOLine, quantity: lineQty });
      message.success('Line added');
      setAddLineModal(false);
      setSelectedPOLine(null);
      setLineQty(1);
      fetchContainer();
    } catch (err) {
      message.error('Failed to add line');
    }
  };

  const handleRemoveLine = async (lineId) => {
    try {
      await containersAPI.removeLine(id, lineId);
      message.success('Line removed');
      fetchContainer();
    } catch (err) {
      message.error('Failed to remove line');
    }
  };

  const handleReceive = async () => {
    try {
      await containersAPI.receive(id);
      message.success('Container received - Purchase receipt created and inventory updated');
      fetchContainer();
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to receive container');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!container) return <Card><Title level={4}>Container not found</Title></Card>;

  const lineColumns = [
    { title: 'PO #', key: 'po', render: (_, r) => r.PurchaseOrderLine?.PurchaseOrder?.po_number || '-' },
    { title: 'Part Number', key: 'part', render: (_, r) => r.PurchaseOrderLine?.Part?.part_number || '-' },
    { title: 'Description', key: 'desc', render: (_, r) => r.PurchaseOrderLine?.Part?.description || '-', ellipsis: true },
    { title: 'Quantity', dataIndex: 'quantity', key: 'qty', render: (v) => parseFloat(v) },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => container.status !== 'Received' && hasPermission('containers', 'update') ? (
        <Popconfirm title="Remove line?" onConfirm={() => handleRemoveLine(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ) : null,
    },
  ];

  return (
    <Card>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Container: {container.container_number}</Title>
        <Space>
          {container.status !== 'Received' && hasPermission('containers', 'update') && (
            <>
              <Button icon={<PlusOutlined />} onClick={openAddLine}>Add PO Lines</Button>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/containers/${id}/edit`)}>Edit</Button>
            </>
          )}
          {container.status !== 'Received' && container.lines?.length > 0 && hasPermission('purchase_receipts', 'create') && (
            <Popconfirm title="Receive this container? This will create a purchase receipt and update inventory." onConfirm={handleReceive}>
              <Button type="primary" icon={<CheckCircleOutlined />}>Receive Container</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Container Number">{container.container_number}</Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={statusColors[container.status]}>{container.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="Vessel">{container.vessel_name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Bill of Lading">{container.bill_of_lading || '-'}</Descriptions.Item>
        <Descriptions.Item label="Expected Arrival">{container.expected_arrival_date ? dayjs(container.expected_arrival_date).format('MM/DD/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Actual Arrival">{container.actual_arrival_date ? dayjs(container.actual_arrival_date).format('MM/DD/YYYY') : '-'}</Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>{container.description || '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={3}>{container.notes || '-'}</Descriptions.Item>
      </Descriptions>

      <Title level={5}>PO Lines in Container</Title>
      <Table columns={lineColumns} dataSource={container.lines || []} rowKey="id" pagination={false} />

      {container.PurchaseReceipts?.length > 0 && (
        <>
          <Title level={5} style={{ marginTop: 24 }}>Purchase Receipts</Title>
          <Table
            columns={[
              { title: 'Receipt #', dataIndex: 'receipt_number', key: 'receipt' },
              { title: 'Date', dataIndex: 'receipt_date', key: 'date', render: (d) => dayjs(d).format('MM/DD/YYYY') },
              { title: '', key: 'view', render: (_, r) => <Button type="link" onClick={() => navigate(`/purchase-receipts/${r.id}`)}>View</Button> },
            ]}
            dataSource={container.PurchaseReceipts}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </>
      )}

      <Modal title="Add PO Lines to Container" open={addLineModal} onOk={handleAddLine} onCancel={() => setAddLineModal(false)} width={600}>
        <div style={{ marginBottom: 16 }}>
          <label>Purchase Order:</label>
          <Select style={{ width: '100%', marginTop: 8 }} placeholder="Select PO" showSearch optionFilterProp="label"
            options={purchaseOrders.map((po) => ({ value: po.id, label: `${po.po_number} - ${po.Supplier?.name}` }))}
            onChange={loadPOLines} />
        </div>
        {selectedPO && (
          <div style={{ marginBottom: 16 }}>
            <label>PO Line:</label>
            <Select style={{ width: '100%', marginTop: 8 }} placeholder="Select PO Line" showSearch optionFilterProp="label"
              options={poLines.map((l) => ({
                value: l.id,
                label: `${l.Part?.part_number} - ${l.Part?.description} (Qty: ${l.quantity}, Rcvd: ${l.quantity_received})`,
              }))}
              onChange={(v) => setSelectedPOLine(v)} />
          </div>
        )}
        <div>
          <label>Quantity:</label>
          <InputNumber value={lineQty} min={0.01} onChange={setLineQty} style={{ width: '100%', marginTop: 8 }} />
        </div>
      </Modal>
    </Card>
  );
}
