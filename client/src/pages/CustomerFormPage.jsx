import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Switch, Button, message, Row, Col, Typography, Spin } from 'antd';
import { customersAPI } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

export default function CustomerFormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      customersAPI.getById(id)
        .then((res) => form.setFieldsValue(res.data.data))
        .catch(() => message.error('Failed to load customer'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      if (isEdit) {
        await customersAPI.update(id, values);
        message.success('Customer updated');
      } else {
        await customersAPI.create(values);
        message.success('Customer created');
      }
      navigate('/customers');
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Customer' : 'New Customer'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true, country: 'USA', payment_terms: 30, credit_limit: 0 }}>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={16}><Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="contact_person" label="Contact Person"><Input /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="address_line1" label="Address Line 1"><Input /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="address_line2" label="Address Line 2"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={6}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item name="postal_code" label="Postal Code"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col xs={12} md={6}><Form.Item name="payment_terms" label="Payment Terms (days)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="credit_limit" label="Credit Limit ($)"><InputNumber style={{ width: '100%' }} min={0} step={1000} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
        <Form.Item name="notes" label="Notes"><TextArea rows={3} /></Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button onClick={() => navigate('/customers')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
