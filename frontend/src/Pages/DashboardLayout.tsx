import { Outlet } from "react-router-dom";
import DashboardHeader from "../Components/DashboardHeader";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {role !== "admin" && <DashboardHeader />}
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
