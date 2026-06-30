import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Select, DatePicker, Input, InputNumber, Button, Table, message, Row, Col, Typography, Spin, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { purchaseOrdersAPI, suppliersAPI, partsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

export default function PurchaseOrderFormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  const [lines, setLines] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    Promise.all([
      suppliersAPI.list({ limit: 100, is_active: true }),
      partsAPI.list({ limit: 500, is_active: true }),
    ]).then(([sRes, pRes]) => {
      setSuppliers(sRes.data.data);
      setParts(pRes.data.data);
    });

    if (isEdit) {
      setLoading(true);
      purchaseOrdersAPI.getById(id).then((res) => {
        const po = res.data.data;
        form.setFieldsValue({
          supplier_id: po.supplier_id,
          order_date: dayjs(po.order_date),
          expected_date: po.expected_date ? dayjs(po.expected_date) : null,
          shipping_method: po.shipping_method,
          notes: po.notes,
        });
        setLines(po.lines.map((l) => ({
          key: l.id,
          part_id: l.part_id,
          quantity: parseFloat(l.quantity),
          unit_cost: parseFloat(l.unit_cost),
          line_total: parseFloat(l.line_total),
        })));
      }).catch(() => message.error('Failed to load PO'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const addLine = () => {
    setLines([...lines, { key: Date.now(), part_id: null, quantity: 1, unit_cost: 0, line_total: 0 }]);
  };

  const updateLine = (key, field, value) => {
    setLines(lines.map((line) => {
      if (line.key !== key) return line;
      const updated = { ...line, [field]: value };
      if (field === 'quantity' || field === 'unit_cost') {
        updated.line_total = (updated.quantity || 0) * (updated.unit_cost || 0);
      }
      return updated;
    }));
  };

  const removeLine = (key) => setLines(lines.filter((l) => l.key !== key));
  const getTotal = () => lines.reduce((sum, l) => sum + (l.line_total || 0), 0);

  const onFinish = async (values) => {
    if (lines.length === 0) { message.error('Add at least one line item'); return; }
    setSaving(true);
    try {
      const payload = {
        supplier_id: values.supplier_id,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        expected_date: values.expected_date?.format('YYYY-MM-DD'),
        shipping_method: values.shipping_method,
        notes: values.notes,
        lines: lines.map((l) => ({ part_id: l.part_id, quantity: l.quantity, unit_cost: l.unit_cost })),
      };
      if (isEdit) {
        await purchaseOrdersAPI.update(id, payload);
        message.success('Purchase order updated');
      } else {
        await purchaseOrdersAPI.create(payload);
        message.success('Purchase order created');
      }
      navigate('/purchase-orders');
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const lineColumns = [
    {
      title: 'Part', dataIndex: 'part_id', width: 300,
      render: (val, record) => (
        <Select value={val} style={{ width: '100%' }} showSearch optionFilterProp="label"
          options={parts.map((p) => ({ value: p.id, label: `${p.part_number} - ${p.description}` }))}
          onChange={(v) => updateLine(record.key, 'part_id', v)} />
      ),
    },
    {
      title: 'Qty', dataIndex: 'quantity', width: 120,
      render: (val, record) => <InputNumber value={val} min={0.01} onChange={(v) => updateLine(record.key, 'quantity', v)} style={{ width: '100%' }} />,
    },
    {
      title: 'Unit Cost', dataIndex: 'unit_cost', width: 140,
      render: (val, record) => <InputNumber value={val} min={0} step={0.01} prefix="$" onChange={(v) => updateLine(record.key, 'unit_cost', v)} style={{ width: '100%' }} />,
    },
    { title: 'Line Total', dataIndex: 'line_total', width: 140, render: (v) => `$${(v || 0).toFixed(2)}` },
    { title: '', width: 50, render: (_, record) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeLine(record.key)} /> },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ order_date: dayjs() }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="supplier_id" label="Supplier" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={suppliers.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item name="order_date" label="Order Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item name="expected_date" label="Expected Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="shipping_method" label="Shipping Method">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes"><TextArea rows={2} /></Form.Item>
        <div style={{ marginBottom: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={5} style={{ margin: 0 }}>Line Items</Title>
            <Button icon={<PlusOutlined />} onClick={addLine}>Add Line</Button>
          </Space>
        </div>
        <Table columns={lineColumns} dataSource={lines} rowKey="key" pagination={false} size="small"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={3} index={0}><strong>Total</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><strong>${getTotal().toFixed(2)}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )} />
        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button onClick={() => navigate('/purchase-orders')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
