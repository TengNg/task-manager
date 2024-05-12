import useAuth from "./useAuth";
import { axiosPrivate } from "../api/axios";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axiosPrivate.get('/refresh');
        const { user, accessToken } = response.data;

        if (!accessToken) {
            await axiosPrivate.get('/logout');
        } else {
            setAuth(prev => {
                return { ...prev, user, accessToken }
            });

            return accessToken;
        }
    }

    return refresh;
}

export default useRefreshToken;
