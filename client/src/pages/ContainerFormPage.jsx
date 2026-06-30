import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, DatePicker, Select, Button, message, Row, Col, Typography, Spin } from 'antd';
import { containersAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

export default function ContainerFormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      containersAPI.getById(id).then((res) => {
        const c = res.data.data;
        form.setFieldsValue({
          ...c,
          expected_arrival_date: c.expected_arrival_date ? dayjs(c.expected_arrival_date) : null,
          actual_arrival_date: c.actual_arrival_date ? dayjs(c.actual_arrival_date) : null,
        });
      }).catch(() => message.error('Failed to load container'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        expected_arrival_date: values.expected_arrival_date?.format('YYYY-MM-DD'),
        actual_arrival_date: values.actual_arrival_date?.format('YYYY-MM-DD'),
      };
      if (isEdit) {
        await containersAPI.update(id, payload);
        message.success('Container updated');
      } else {
        await containersAPI.create(payload);
        message.success('Container created');
      }
      navigate('/containers');
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Container' : 'New Container'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'Pending' }}>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="container_number" label="Container Number" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={16}><Form.Item name="description" label="Description"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={6}><Form.Item name="vessel_name" label="Vessel Name"><Input /></Form.Item></Col>
          <Col xs={24} md={6}><Form.Item name="bill_of_lading" label="Bill of Lading"><Input /></Form.Item></Col>
          <Col xs={24} md={6}>
            <Form.Item name="expected_arrival_date" label="Expected Arrival"><DatePicker style={{ width: '100%' }} /></Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="status" label="Status">
              <Select options={['Pending', 'In Transit', 'At Port', 'Customs', 'Arrived'].map((s) => ({ value: s, label: s }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Notes"><TextArea rows={3} /></Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button onClick={() => navigate('/containers')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
