import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && (!user.roles || !user.roles.includes(requiredRole))) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
