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
import PeopleOccupiedModal from "../../components/PeopleOccupiedModal";
import RevenueModal from "../../components/RevenueModal";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [revenueStatistics, setRevenueStatistics] = useState([]);
  const [open, setOpen] = useState(false);
  const [openOccupied, setOpenOccupied] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);
  const [openRevenue, setOpenRevenue] = useState(false);
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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

  const fetchRevenueStatistics = async () => {
    let axiosConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(
        `http://localhost:3000/owners/revenue-statistics/${year}`,
        axiosConfig
      );
      setRevenueStatistics(response.data);
    } catch (error) {
      toast.error(error.message || "Error fetching revenue statistics");
    }
  };

  useEffect(() => {
    fetchRevenueStatistics();
  }, [year, token]);

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
              onClick={() => setOpenPeople(true)}
            />
            <DashboardCard
              title="Doanh thu (VNĐ)"
              value={`${data?.totalRevenue?.toLocaleString("vi-VN")}`}
              icon="💰"
              onClick={() => setOpenRevenue(true)}
            />
          </div>
          {/* Thêm các phần nội dung khác ở đây */}
          <div style={{ padding: "40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                Doanh thu theo tháng
              </h2>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "18px",
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ padding: "0 24px" }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={revenueStatistics?.data || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(v) => `Tháng ${v}`} />
                  <YAxis tickFormatter={(v) => v.toLocaleString("vi-VN")} />
                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      })}`
                    }
                    labelFormatter={(label) => `Tháng ${label}`}
                  />

                  <Bar dataKey="revenue" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
        <RoomListModal open={open} onClose={() => setOpen(false)} />
        <RoomOccupiedModal
          open={openOccupied}
          onClose={() => setOpenOccupied(false)}
        />
        <PeopleOccupiedModal
          open={openPeople}
          onClose={() => setOpenPeople(false)}
        />
        <RevenueModal
          open={openRevenue}
          onClose={() => setOpenRevenue(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
