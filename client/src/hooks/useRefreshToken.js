import useAuth from "./useAuth";
import { axiosPrivate } from "../api/axios";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await axiosPrivate.get('/refresh');
            const { user } = response.data;
            setAuth({ user });
        } catch (err) {
            console.log(err);
        }
    }

    return refresh;
}

export default useRefreshToken;
