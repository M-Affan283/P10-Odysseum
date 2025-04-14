import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, authError, clearAuthError } = useAdminStore();
  const navigate = useNavigate();
  
  const handleValuesChange = () => {
    if (authError) {
      clearAuthError();
    }
  };
  
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    const success = await login(values);
    
    setIsSubmitting(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Login Form Section (Left) */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-purple-500">Odysseum Admin</h2>
            <p className="text-gray-400 mt-2">Please sign in to access your dashboard</p>
          </div>
          
          {authError && (
            <Alert
              message={authError}
              type="error"
              className="mb-6 bg-red-900/30 border border-red-700 text-red-400"
              showIcon
            />
          )}
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
            requiredMark={false}
            className="space-y-6"
          >
            <Form.Item
              name="identifier"
              label={<span className="text-sm font-medium text-gray-400">Email or Username</span>}
              rules={[{ required: true, message: 'Please input your username or email!' }]}
              className="mb-4"
            >
              <Input 
                prefix={<UserOutlined className="text-gray-500" />}
                placeholder="Enter your username or email"
                className="py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              label={<span className="text-sm font-medium text-gray-400">Password</span>}
              rules={[{ required: true, message: 'Please input your password!' }]}
              className="mb-4"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-500" />}
                placeholder="Enter your password"
                className="py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                
              />
            </Form.Item>
            
            <div className="flex justify-end mb-6">
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>
            
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                className="w-full h-12 flex items-center justify-center rounded-lg text-white bg-purple-600 hover:bg-purple-700 border-none text-base font-medium shadow-md"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      
      {/* Image Section (Right) */}
      <div className="hidden md:block md:w-3/5 bg-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800/90 to-gray-900/90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://img.freepik.com/free-vector/hand-drawn-tourists-illustrated_52683-69578.jpg?t=st=1743493722~exp=1743497322~hmac=018ca43bee31ba8091210dfe3338feff7c27ecf7cfb66e3dc7fc23725627fd8d&w=996')",
            backgroundPosition: "center",
            filter: "brightness(0.7)"
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="w-full max-w-xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Welcome to Odysseum</h1>
            <p className="text-xl text-purple-200 mb-8">
              Manage your digital experiences with our powerful admin dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;