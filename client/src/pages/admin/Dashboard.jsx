import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "../../styles/Dashboard.css";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import DashboardCard from "../../components/DashboardCard";

const Dashboard = () => {
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    let axiosConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/dashboard",
        axiosConfig
      );
      setData(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token === "") {
      navigate("/login");
      toast.warn("Please login first to access dashboard");
      return;
    }
    // fetchDashboardData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="stats-container">
            <DashboardCard title="Tổng số phòng" value="10" icon="🏠" />
            <DashboardCard
              title="Số phòng đang hoạt động"
              value="8"
              icon="🔑"
            />
            <DashboardCard
              title="Lượng tiêu thụ điện, nước"
              value="1,234,000 VND"
              icon="💡"
            />
            <DashboardCard title="Doanh thu" value="12,345,000 VND" icon="💰" />
          </div>
          {/* Thêm các phần nội dung khác ở đây */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
