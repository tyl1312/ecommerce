import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setToken] = useState(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }

        const query = new URLSearchParams(window.location.search);
        const urlToken = query.get('token');

        if (urlToken) {
            localStorage.setItem('accessToken', urlToken);
            setToken(urlToken);
            fetchCurrentUser(urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const fetchCurrentUser = async (token) => {
        try {
            setLoading(true);

            if (!token) {
                console.warn('No token provided to fetchCurrentUser');
                logout();
                return;
            }

            const response = await fetch('/api/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else if (response.status === 403) {
                const refresh = await fetch('/api/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refresh.ok) {
                    const { accessToken: newToken } = await refresh.json();
                    localStorage.setItem('accessToken', newToken);
                    setToken(newToken);

                    // Retry with new token
                    const retryAuth = await fetch('/api/user', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newToken}`
                        },
                        credentials: 'include'
                    });

                    if (retryAuth.ok) {
                        const userData = await retryAuth.json();
                        setUser(userData);
                    } else {
                        logout();
                    }
                } else {
                    logout();
                }
            } else {
                logout();
            }
        } catch (err) {
            console.error("Error getting user:", err);
            logout();
        } finally {
            setLoading(false);
        }
    };




    const register = async (userData, captchaToken) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData, captchaToken),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            setToken(data.accessToken);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password, captchaToken) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password, captchaToken }), // <-- include captchaToken
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            setToken(data.accessToken);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: error.message };
        }
    };

    const loginWithGoogle = async (captchaToken) => {
        const googleClientId = '356425652770-qhulq1q61nqvtrk5anfcce8d6sjio9rl.apps.googleusercontent.com';
        const redirectUri = "http://localhost:5173/auth/callback";
        const scope = encodeURIComponent("openid email profile");
        const responseType = "code";
        const state = "secureRandomState123";

        // Store captchaToken in sessionStorage to use after redirect
        sessionStorage.setItem('captchaToken', captchaToken);

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
        window.location.href = authUrl;
    };

    const logout = async () => {
        try {
            await fetch(`/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setToken(null);
            setUser(null);
            navigate('/');
        }
    };

    const value = {
        user,
        setUser,
        setToken,
        accessToken,
        loading,
        login,
        loginWithGoogle,
        register,
        logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);