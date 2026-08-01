import { Navigate } from "react-router-dom";
import { getToken } from "./services/api";

function ProtectedRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
