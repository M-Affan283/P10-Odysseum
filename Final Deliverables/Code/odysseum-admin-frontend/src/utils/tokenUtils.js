// Store access token in memory for security (not in localStorage)
let accessToken = null

// Get the current access token
export const getToken = () => accessToken

// Set the token in memory and store refresh token in httpOnly cookie
export const setToken = (access, refresh = null) => {
    accessToken = access

    // If refresh token is provided, store it in httpOnly cookie
    if (refresh) {
        document.cookie = `refreshToken=${refresh}; path=/; secure; samesite=strict;`
    }
}

// Remove the token from memory and clear refresh token cookie
export const removeToken = () => {
    accessToken = null
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
}

// Get refresh token from cookies
export const getRefreshToken = () => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'refreshToken') {
            return value
        }
    }
    return null
}

// Refresh access token using refresh token
export const refreshTokens = async () => {
    try {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
            return false
        }

        // Create a new instance to avoid interceptors
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        })

        const data = await response.json()

        if (data.success) {
            setToken(data.accessToken)
            return true
        }

        return false
    } catch (error) {
        console.error('Token refresh error', error)
        return false
    }
}