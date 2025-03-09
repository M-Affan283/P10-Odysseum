const ENV = {
    development: {
        SOCKET_URL: 'http://192.168.100.25:8000', // Your local IP when testing
        API_URL: 'http://192.168.100.25:8000/api'
    },
    production: {
        SOCKET_URL: 'https://your-production-server.com',
        API_URL: 'https://your-production-server.com/api'
    }
};

// Use __DEV__ to determine the environment
const getEnvVars = () => {
    return __DEV__ ? ENV.development : ENV.production;
};

export default getEnvVars();