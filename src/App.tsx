import { Navigate, Route, Routes } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAppSelector } from "./app/hooks";
import IsAdmin from "./components/IsAdmin";
import CustomerDashboard from "./pages/CustomerDashboard";
import IsCustomer from "./components/IsCustomer";

function App() {
  const userRole = useAppSelector((state) => state.authReducer.role);
  return (
    <>
      <Routes>
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              {userRole === "admin" ? (
                <Navigate to="/admin" />
              ) : userRole === "customer" ? (
                <Navigate to="/customer" />
              ) : (
                <Navigate to="/login" />
              )}
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <IsAdmin>
                <Dashboard />
              </IsAdmin>
            </PrivateRoute>
          }
        />

        <Route
          path="/customer"
          element={
            <PrivateRoute>
              <IsCustomer>
                <CustomerDashboard />
              </IsCustomer>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
