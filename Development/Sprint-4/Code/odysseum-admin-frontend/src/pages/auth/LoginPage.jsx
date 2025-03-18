import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminStore from '../../store/adminStore'

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        identifier: '',
        password: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { login, authError, clearAuthError } = useAdminStore()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setCredentials(prev => ({ ...prev, [name]: value }))
        clearAuthError()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const success = await login(credentials)

        setIsSubmitting(false)

        if (success) {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-purple-500 mb-8">
                    Odysseum Admin
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {authError && (
                        <div className="bg-red-900/30 text-red-400 p-3 rounded border border-red-700">
                            {authError}
                        </div>
                    )}

                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-400">
                            Email or Username
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            required
                            value={credentials.identifier}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={credentials.password}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage