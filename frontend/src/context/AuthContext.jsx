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

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
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
                const refresh = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refresh.ok) {
                    const { accessToken: newToken } = await refresh.json();
                    localStorage.setItem('accessToken', newToken);
                    setToken(newToken);

                    //Retry with new token
                    const retryAuth = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
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


    const register = async (registrationId, otp) => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    registrationId,
                    otp
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Set the user and token after successful registration
                localStorage.setItem('accessToken', data.accessToken);
                setToken(data.accessToken);
                setUser(data.user);
                
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                throw new Error(data.message || 'Registration completion failed');
            }
        } catch (error) {
            console.error('Registration completion error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password, captchaToken, requiresCaptcha = false) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    identifier,
                    password,
                    captchaToken,
                    requiresCaptcha
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.accessToken);
                localStorage.setItem('accessToken', data.accessToken);
                
                await fetchCurrentUser(data.accessToken);
                
                return { 
                    success: true, 
                    user: data.user, 
                    message: data.message 
                };
            } else {
                return { 
                    success: false, 
                    message: data.message || 'Login failed' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: 'Network error occurred' 
            };
        }
    };

    const loginWithGoogle = async () => {
        const google_client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = `${import.meta.env.VITE_FRONTEND_URL}/auth/callback`;
        const scope = encodeURIComponent("openid email profile");
        const responseType = "code";

        //Generate random state 
        const state = crypto.randomUUID ? crypto.randomUUID() :
            ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );

        sessionStorage.setItem("oauthState", state);

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${google_client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=${responseType}&state=${state}`;

        window.location.href = googleAuthUrl;
    };

    const logout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
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