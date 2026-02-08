import { Outlet } from "react-router-dom";
import DashboardHeader from "../Components/DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
