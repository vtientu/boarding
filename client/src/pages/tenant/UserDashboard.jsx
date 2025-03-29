import React from "react";
import "../../styles/Dashboard.css";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";
import DashboardCard from "../../components/DashboardCard";

const UserDashboard = () => {
	return (
		<div className="dashboard-container">
			<UserHeader />
			<div className="dashboard-content">
				<UserSidebar />
				<main className="main-content">
					<div className="stats-container">
						<DashboardCard title="Phòng" value="402" icon="🏠" />
						<DashboardCard
							title="Lượng tiêu thụ điện nước"
							value="1,234,000 VND"
							icon="💡"
						/>
						<DashboardCard title="Liên hệ" value="0123456789" icon="📞" />
					</div>
				</main>
			</div>
		</div>
	);
};

export default UserDashboard;
