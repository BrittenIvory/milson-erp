import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Switch, Button, message, Row, Col, Typography, Spin } from 'antd';
import { usersAPI } from '../services/api';

const { Title } = Typography;

const roles = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Sales' },
  { value: 3, label: 'Purchasing' },
  { value: 4, label: 'Warehouse' },
  { value: 5, label: 'Viewer' },
];

export default function UserFormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      usersAPI.getById(id)
        .then((res) => form.setFieldsValue(res.data.data))
        .catch(() => message.error('Failed to load user'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      if (isEdit) {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        await usersAPI.update(id, payload);
        message.success('User updated');
      } else {
        await usersAPI.create(values);
        message.success('User created');
      }
      navigate('/users');
    } catch (err) {
      message.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit User' : 'New User'}</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true }}>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
          <Col xs={24} md={8}>
            <Form.Item name="password" label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} rules={isEdit ? [] : [{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}><Form.Item name="first_name" label="First Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={4}>
            <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
              <Select options={roles} />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}><Form.Item name="is_active" label="Active" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>{isEdit ? 'Update' : 'Create'}</Button>
          <Button onClick={() => navigate('/users')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
