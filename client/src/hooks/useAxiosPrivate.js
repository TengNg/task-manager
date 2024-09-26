import { axiosPrivate } from "../api/axios";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();

    axiosPrivate.interceptors.response.use(
        response => response, // every responses with status 2xx will trigger this
        async (error) => {
            const prevRequest = error?.config;
            if (error?.response?.status === 403 && !prevRequest?._retry) {
                prevRequest._retry = true; // prevent infinite loop
                await refresh();
                return axiosPrivate(prevRequest);
            }

            return Promise.reject(error);
        }
    );

    return axiosPrivate;
}

export default useAxiosPrivate;
