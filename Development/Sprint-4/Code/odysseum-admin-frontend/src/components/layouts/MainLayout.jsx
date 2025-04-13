import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Layout, Menu, Avatar, Button, Typography, theme, Drawer } from 'antd';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Get the current selected key based on the path
  const getCurrentSelectedKey = () => {
    if (location.pathname.startsWith('/reports/users')) return '2';
    if (location.pathname.startsWith('/reports/posts')) return '3';
    if (location.pathname.startsWith('/users')) return '4';
    if (location.pathname.startsWith('/posts')) return '5';
    if (location.pathname.startsWith('/locations')) return '6';
    return '1'; // Dashboard is default
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>
    },
    {
      key: '2',
      icon: <TeamOutlined />,
      label: <Link to="/reports/users">User Reports</Link>
    },
    {
      key: '3',
      icon: <FileTextOutlined />,
      label: <Link to="/reports/posts">Post Reports</Link>
    },
    {
      key: '4',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>
    },
    {
      key: '5',
      icon: <FileTextOutlined />,
      label: <Link to="/posts">Posts</Link>
    },
    {
      key: '6',
      icon: <EnvironmentOutlined />,
      label: <Link to="/locations">Locations</Link>
    },
    {
      key: '7',
      icon: <ShopOutlined />, 
      label: <Link to="/businesses">Business Requests</Link>
    }
  ];

  const userMenu = (
    <div style={{ padding: collapsed ? '8px' : '16px', display: 'flex', alignItems: 'center' }}>
      <Avatar style={{ backgroundColor: '#722ed1' }} size="large">
        {user?.username?.charAt(0).toUpperCase() || 'A'}
      </Avatar>

      {!collapsed && (
        <div style={{ marginLeft: 12 }}>
          <Text style={{ color: 'white' }}>{user?.username || 'Admin'}</Text>
          <br />
          <Button
            type="link"
            size="small"
            icon={<LogoutOutlined />}
            style={{ color: 'rgba(255, 255, 255, 0.65)', padding: 0 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      <Sider
        collapsed={collapsed}
        width={240}
        className="hidden md:block"
        theme="dark"
        style={{ position: 'sticky', height: '100vh', top: 0, left: 0 }}
        trigger={null} // Remove the default trigger
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {!collapsed && <Title level={5} style={{ margin: 0, color: '#722ed1' }}>Odysseum Admin</Title>}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ color: 'white', fontSize: '16px' }}
          />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentSelectedKey()]}
          items={menuItems}
        />

        <div style={{ position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {userMenu}
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        className="md:hidden"
        styles={{
          header: { display: 'none' },
          body: { padding: 0, backgroundColor: '#001529' }
        }}
        width={240}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Title level={5} style={{ margin: 0, color: '#722ed1' }}>Odysseum Admin</Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentSelectedKey()]}
          items={menuItems}
          onClick={() => setMobileDrawerOpen(false)}
        />

        <div style={{ position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {userMenu}
        </div>
      </Drawer>

      <Layout style={{ background: '#1a1325' }}>
        {/* Header */}
        <Header style={{ padding: '0 16px', background: '#16111f', display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={mobileDrawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden"
            style={{ color: 'white' }}
          />
          <div className="md:hidden ml-4">
            <Title level={5} style={{ margin: 0, color: '#722ed1' }}>Odysseum Admin</Title>
          </div>
        </Header>

        {/* Main Content */}
        <Content style={{ margin: '16px', overflow: 'initial' }}>
          <div style={{
            padding: 24,
            background: '#16111f',
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;