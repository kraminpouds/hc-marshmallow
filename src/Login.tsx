import { Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = (values) => {
         // 发送登录请求到后端
       axios.post('/xumu/password', values)
            .then(() => navigate('/xumu'))
            .catch(() => setErrorMessage('用户名或密码不正确'));
    };

    type FieldType = {
        username?: string;
        password?: string;
    };

    return (
        <div>
            <Typography.Title className="title">狐乱生草の棉花糖 - 后台</Typography.Title>
            <Card style={{ maxWidth: 600, margin: '0 auto'}}>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={handleLogin}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: '请输入你的用户名!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType>
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: '请输入你的密码!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Login
                    </Button>
                </Form.Item>
            </Form>
            {errorMessage && <div style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</div>}
            </Card>
        </div>
    );
}

export default Login
