import React, { useState, useEffect } from "react";
import "../../styles/Dashboard.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";
import DashboardCard from "../../components/DashboardCard";
import axios from "axios";
import { toast } from "react-toastify";

const UserDashboard = () => {
	const [dashboardData, setDashboardData] = useState({
		roomNumber: "",
		utilityCost: "0",
		contact: "",
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const token = JSON.parse(localStorage.getItem("auth"));
				const user = JSON.parse(localStorage.getItem("user"));

				if (!token || !user) {
					toast.error("Vui lòng đăng nhập để xem thông tin");
					return;
				}

				// Fetch active contract by user ID
				const response = await axios.get(
					`http://localhost:3000/contracts/user/${user._id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				console.log(response);

				if (response.data && response.data.room_id) {
					const contract = response.data.room_id;
					
					// Fetch room details
					const roomResponse = await axios.get(
						`http://localhost:3000/rooms/detail/${contract.room_id}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);
					console.log(roomResponse);

					// Fetch latest bill
					const billResponse = await axios.get(
						`http://localhost:3000/tenants/${user._id}/bills/latest`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);
					setDashboardData({
						roomNumber: roomResponse.data.room.room_number || "Chưa có phòng",
						utilityCost: billResponse.data.bill?.total_amount 
							? `${billResponse.data.bill.total_amount.toLocaleString()} VND`
							: "0 VND",
						contact: user.phone || "Chưa cập nhật",
					});
				} else {
					setDashboardData({
						roomNumber: "Chưa có phòng",
						utilityCost: "0 VND",
						contact: user.phone || "Chưa cập nhật",
					});
				}
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				toast.error("Không thể tải thông tin dashboard");
				setDashboardData({
					roomNumber: "Lỗi tải dữ liệu",
					utilityCost: "0 VND",
					contact: "Lỗi tải dữ liệu",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	if (loading) {
		return (
			<div className="dashboard-container">
				<UserHeader />
				<div className="dashboard-content">
					<UserSidebar />
					<main className="main-content">
						<div className="loading">Đang tải...</div>
					</main>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-container">
			<UserHeader />
			<div className="dashboard-content">
				<UserSidebar />
				<main className="main-content">
					<div className="stats-container">
						<DashboardCard 
							title="Phòng" 
							value={dashboardData.roomNumber} 
							icon="🏠" 
						/>
						<DashboardCard
							title="Lượng tiêu thụ điện nước"
							value={dashboardData.utilityCost}
							icon="💡"
						/>
						<DashboardCard 
							title="Liên hệ" 
							value={dashboardData.contact} 
							icon="📞" 
						/>
					</div>
				</main>
			</div>
		</div>
	);
};

export default UserDashboard;
