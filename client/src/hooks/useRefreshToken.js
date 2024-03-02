import useAuth from "./useAuth";
import { axiosPrivate } from "../api/axios";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axiosPrivate.get('/refresh');
        const { user, accessToken } = response.data;

        if (!accessToken) {
            return null;
        }

        setAuth(prev => {
            return { ...prev, user, accessToken: response.data.accessToken }
        });
        return response.data.accessToken;
    }

    return refresh;
}

export default useRefreshToken;
