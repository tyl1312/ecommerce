import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkStatus } from '../redux/actions/userActions';


/**
 * Using this hook, we can check the user's login status and loading status.
 * @returns loggedIn and isLoading status.
 */
const useUserStatus = () => {
    const loggedIn = useSelector(state => state.user.loggedIn);
    const userData = useSelector(state => state.user.userData);
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(checkStatus());
                setIsLoading(false);
            } catch (error) {
                console.error('Error checking status:', error);
            }
        };

        fetchData();
    }, [dispatch]);

    return { loggedIn, isLoading, userData };
};

export default useUserStatus;