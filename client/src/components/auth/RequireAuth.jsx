import { Navigate, useLocation } from "react-router-dom"
import useAuth from "../../hooks/useAuth";

const RequireAuth = ({ children }) => {
    const { auth } = useAuth();
    const location = useLocation();

    if (Object.keys(auth).length === 0 || !auth) {
        console.log(auth);
        return <Navigate to="/login" state={{ from: location }} replace />
    } else {
        console.log(auth);
        return children
    }
};

export default RequireAuth;
