import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "../../styles/Dashboard.css";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import DashboardCard from "../../components/DashboardCard";
import RoomListModal from "../../components/RoomListModal";
import RoomOccupiedModal from "../../components/RoomOccupiedModal";
const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [openOccupied, setOpenOccupied] = useState(false);
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
        "http://localhost:3000/owners/dashboard",
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
    fetchDashboardData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="stats-container">
            <DashboardCard
              title="Tổng số phòng"
              value={data?.totalRooms?.toLocaleString("vi-VN")}
              icon="🏠"
              onClick={() => setOpen(true)}
            />
            <DashboardCard
              title="Số phòng đã thuê"
              value={data?.totalRoomsOccupied?.toLocaleString("vi-VN")}
              icon="🔑"
              onClick={() => setOpenOccupied(true)}
            />
            <DashboardCard
              title="Số người thuê trọ"
              value={data?.totalTenants?.toLocaleString("vi-VN")}
              icon="👥"
            />
            <DashboardCard
              title="Doanh thu (VNĐ)"
              value={`${data?.totalRevenue?.toLocaleString("vi-VN")}`}
              icon="💰"
            />
          </div>
          {/* Thêm các phần nội dung khác ở đây */}
        </main>
        <RoomListModal open={open} onClose={() => setOpen(false)} />
        <RoomOccupiedModal
          open={openOccupied}
          onClose={() => setOpenOccupied(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
