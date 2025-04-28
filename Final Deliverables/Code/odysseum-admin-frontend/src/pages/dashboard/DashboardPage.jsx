import { useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Avatar,
  List,
  Typography,
  Spin,
  Alert,
  Button,
  Descriptions
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ProfileOutlined,
  ShopOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
import useAdminStore from '../../store/adminStore';
import MainLayout from '../../components/layouts/MainLayout';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// User list item component
const UserListItem = ({ user }) => (
  <List.Item>
    <List.Item.Meta
      avatar={
        <Avatar style={{ backgroundColor: '#722ed1' }}>
          {user.username?.charAt(0).toUpperCase() || '?'}
        </Avatar>
      }
      title={<Text style={{ color: 'white' }}>{user.username}</Text>}
      description={<Text type="secondary">{user.email}</Text>}
    />
    <Text type="secondary">{new Date(user.createdAt).toLocaleDateString()}</Text>
  </List.Item>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    user,
    stats,
    recentUsers,
    dashboardLoading,
    dashboardError,
    fetchDashboardStats
  } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleStatClick = (path) => {
    navigate(path);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
        {/* Welcome header */}
        <Title level={2} style={{ color: 'white', marginBottom: 24 }}>
          Welcome back, {user?.firstName || user?.username || 'Admin'}
        </Title>
        <Text type="secondary" style={{ fontSize: 16, marginBottom: 32, display: 'block' }}>
          Current Platform Stats and Recent Users
        </Text>

        {/* Error message */}
        {dashboardError && (
          <Alert
            message={<span style={{ color: 'white' }}>Error loading dashboard data</span>}
            description={<span style={{ color: 'white' }}>{dashboardError}</span>}
            type="error"
            showIcon
            style={{
              marginBottom: 24,
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid #5c0011',
              color: 'white'  // This sets the main text color to white
            }}
          />
        )}

        {/* Loading state */}
        {dashboardLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats Row - Main counts */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/users')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Users</Text>}
                    value={stats?.userCount || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/posts')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Posts</Text>}
                    value={stats?.postCount || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/locations')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Locations</Text>}
                    value={stats?.locationCount || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/businesses/approved')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Businesses</Text>}
                    value={stats?.businessCount || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<ShopOutlined style={{ color: '#f5a623' }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Pending Items Row */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={8}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/reports/users')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Pending User Reports</Text>}
                    value={stats?.pendingUserReports || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<WarningOutlined style={{ color: stats?.pendingUserReports > 0 ? '#ff4d4f' : '#8c8c8c' }} />}
                  />
                  {stats?.pendingUserReports > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#722ed1' }}>View Reports →</Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/reports/posts')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Pending Post Reports</Text>}
                    value={stats?.pendingPostReports || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<WarningOutlined style={{ color: stats?.pendingPostReports > 0 ? '#ff4d4f' : '#8c8c8c' }} />}
                  />
                  {stats?.pendingPostReports > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#722ed1' }}>View Reports →</Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card
                  bordered={false}
                  style={{ background: '#1f1a2e', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => handleStatClick('/businesses/pending')}
                  hoverable
                >
                  <Statistic
                    title={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Pending Business Approvals</Text>}
                    value={stats?.pendingBusinessCount || 0}
                    valueStyle={{ color: 'white' }}
                    prefix={<BellOutlined style={{ color: stats?.pendingBusinessCount > 0 ? '#faad14' : '#8c8c8c' }} />}
                  />
                  {stats?.pendingBusinessCount > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#722ed1' }}>View Requests →</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Admin profile card */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ProfileOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  <span style={{ color: 'white' }}>Admin Profile</span>
                </div>
              }
              bordered={false}
              style={{ background: '#1f1a2e', borderRadius: 8 }}
            >
              <Descriptions layout="vertical" column={{ xs: 1, sm: 2, md: 3 }} colon={false}>
                <Descriptions.Item
                  label={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Username</Text>}
                >
                  <Text style={{ color: 'white' }}>{user?.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Email</Text>}
                >
                  <Text style={{ color: 'white' }}>{user?.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Role</Text>}
                >
                  <Text style={{ color: 'white', textTransform: 'capitalize' }}>{user?.role}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Recent users */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  <span style={{ color: 'white' }}>Recent Users</span>
                </div>
              }
              extra={
                <Link to="/users" style={{ color: '#722ed1' }}>
                  View all
                </Link>
              }
              bordered={false}
              style={{ background: '#1f1a2e', borderRadius: 8 }}
            >
              <List
                dataSource={recentUsers}
                renderItem={(user) => <UserListItem user={user} />}
                locale={{
                  emptyText: <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '24px 0' }}>No users found</Text>
                }}
                style={{
                  '.ant-list-item': {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }
                }}
              />
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;