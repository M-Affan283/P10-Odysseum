import { Platform } from 'react-native';

const LOCAL_IP = '192.168.100.150'; // Replace with your local IP address
const PORT = '8000';

const config = {
    SOCKET_URL: Platform.select({
        ios: `http://${LOCAL_IP}:${PORT}`,
        android: `http://${LOCAL_IP}:${PORT}`,
        default: `http://localhost:${PORT}`
    }),
    API_URL: Platform.select({
        ios: `http://${LOCAL_IP}:${PORT}/api`,
        android: `http://${LOCAL_IP}:${PORT}/api`,
        default: `http://localhost:${PORT}/api`
    })
};

export default config;