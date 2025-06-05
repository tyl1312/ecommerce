import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const setLoggedIn = (loggedIn) => {
    return {
        type: 'SET_LOGGED_IN',
        payload: loggedIn
    };
};

export const setUserRole = (role) => ({
    type: "SET_USER_ROLE",
    payload: role,
});

export const setUserData = (userData) => {
    return {
        type: 'SET_USER_DATA',
        payload: userData
    }
}

export const setCourseData = (courseTitle, quizId, quizTitle) => {
    return {
        type: 'SET_COURSE_DATA',
        payload: {
            courseTitle,
            quizId,
            quizTitle
        }
    }
}

export const setExpirationTime = (expirationTime) => {
    localStorage.setItem('expirationTime', expirationTime);
    return {
        type: "SET_EXPIRATION_TIME",
        payload: expirationTime,
    };
};

export const checkStatus = () => async dispatch => {
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + '/user/check-login', { withCredentials: true });
        if (response.status === 200) {
            dispatch(setLoggedIn(true));
            dispatch(setUserData(response.data.user));
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
};

export const logout = () => async dispatch => {
    try {
        const response = await axios.post(import.meta.env.VITE_API_URL + '/user/logout',
            null,
            {
                withCredentials: true,
                headers: {
                    'X-CSRF-Token': localStorage.getItem('csrfToken'),
                }
            },
        );
        // console.log(response)
        if (response.status === 200) {
            dispatch(setLoggedIn(false));
            dispatch(setUserRole(null)); // Clear user role
            dispatch(setUserData(null)); // Clear user data
            localStorage.removeItem('expirationTime');
            localStorage.removeItem('csrfToken')
        }
    } catch (error) {
        console.log('Error logging out:', error);
    }
};

export const refreshAccessToken = () => async dispatch => {
    try {
        const response = await axios.post(import.meta.env.VITE_API_URL + '/user/refresh-token', null, { withCredentials: true });
        if (response.status === 200) {
            console.log("response:", jwtDecode(response.data.accessToken).exp);
            dispatch(setExpirationTime(jwtDecode(response.data.accessToken).exp));
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
};
