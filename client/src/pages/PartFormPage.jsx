import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Switch, Button, message, Row, Col, Typography, Spin } from 'antd';
import { partsAPI } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

export default function PartFormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      partsAPI.getById(id)
        .then((res) => form.setFieldsValue(res.data.data))
        .catch(() => message.error('Failed to load part'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      if (isEdit) {
        await partsAPI.update(id, values);
        message.success('Part updated');
      } else {
        await partsAPI.create(values);
        message.success('Part created');
      }
      navigate('/parts');
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to save part');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Part' : 'New Part'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true, weight_unit: 'kg', unit_of_measure: 'EA' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="part_number" label="Part Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="material" label="Material">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="weight" label="Weight">
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="weight_unit" label="Weight Unit">
              <Select options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="unit_of_measure" label="Unit of Measure">
              <Select options={[
                { value: 'EA', label: 'Each (EA)' },
                { value: 'KG', label: 'Kilogram (KG)' },
                { value: 'LB', label: 'Pound (LB)' },
                { value: 'SET', label: 'Set' },
              ]} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="hs_code" label="HS Code">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="drawing_number" label="Drawing Number">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button onClick={() => navigate('/parts')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
