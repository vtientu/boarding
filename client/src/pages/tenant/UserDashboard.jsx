import React, { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";
import DashboardCard from "../../components/DashboardCard";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth"));
    if (!token) {
      navigate("/login");
      toast.warn("Please login first to access dashboard");
      return;
    }
    const fetchDashboardData = async () => {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get(
          "http://localhost:3000/tenants/dashboard",
          axiosConfig
        );
        setData(response.data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <UserHeader />
      <div className="dashboard-content">
        <UserSidebar />
        <main className="main-content">
          <div className="stats-container">
            <DashboardCard title="Phòng" value={data.room} icon="🏠" />
            <DashboardCard
              title="Khóa đơn chưa thanh toán"
              value={data.bills}
              icon="💵"
            />
            <DashboardCard title="Liên hệ" value={data.contact} icon="📞" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
