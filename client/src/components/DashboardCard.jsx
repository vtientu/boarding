import React from "react";
import "../styles/DashboardCard.css";

const DashboardCard = ({ title, value, icon }) => {
	return (
		<div className="dashboard-card">
			<div className="card-icon">{icon}</div>
			<div className="card-content">
				<h3 className="card-title">{title}</h3>
				<p className="card-value">{value}</p>
			</div>
		</div>
	);
};

export default DashboardCard;
