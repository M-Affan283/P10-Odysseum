/**
 * Authentication configuration settings
 * Defines public routes and token expiration times
 * Author: Shahrez
 */

export const authConfig = {
    publicRoutes: [
        { path: '/api/user/login', method: 'POST' },
        { path: '/api/user/register', method: 'POST' },
        { path: '/api/user/refresh-token', method: 'POST' },
        { path: '/health', method: 'GET' },
        { path: '/', method: 'GET' }
    ],
    tokenExpiration: {
        access: '1h',
        refresh: '7d'
    },
    tokenSettings: {
        accessToken: {
            algorithm: 'HS256',
            issuer: 'odysseum-api'
        },
        refreshToken: {
            algorithm: 'HS256',
            issuer: 'odysseum-api'
        }
    }
};