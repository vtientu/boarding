import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AddTenantModal from "../../components/AddTenantModal";
import SearchFilter from "../../components/SearchFilter";
import "../../styles/TenantManagement.css";

const TenantManagement = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("");
	const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);

	const tenants = [
		{
			id: "001",
			name: "Nguyễn Văn A",
			birthDate: "1990-01-01",
			address: "Hà Nội",
			phone: "0123456789",
			gender: "Nam",
			status: "Đang thuê",
		},
		{
			id: "002",
			name: "Trần Thị B",
			birthDate: "1995-05-15",
			address: "TP.HCM",
			phone: "0987654321",
			gender: "Nữ",
			status: "Đã rời",
		},
	];

	const filterOptions = [
		{ value: "", label: "Tất cả trạng thái" },
		{ value: "active", label: "Đang thuê" },
		{ value: "inactive", label: "Đã rời" },
	];

	const handleAddTenant = (tenantData) => {
		// Xử lý dữ liệu người thuê mới ở đây
		console.log("New tenant data:", tenantData);
		setIsAddTenantModalOpen(false);
	};

	return (
		<div className="dashboard-container">
			<Header />
			<div className="dashboard-content">
				<Sidebar />
				<main className="main-content">
					<div className="tenant-management">
						<div className="tenant-header">
							<h2>Quản Lý Người Thuê</h2>
							<button
								className="add-tenant-btn"
								onClick={() => setIsAddTenantModalOpen(true)}
							>
								Thêm người thuê
							</button>
						</div>

						<SearchFilter
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							filterStatus={filterStatus}
							setFilterStatus={setFilterStatus}
							searchPlaceholder="Tìm kiếm theo tên, số điện thoại..."
							filterOptions={filterOptions}
						/>

						<div className="tenants-table">
							<table>
								<thead>
									<tr>
										<th>ID</th>
										<th>Họ và tên</th>
										<th>Ngày sinh</th>
										<th>Địa chỉ</th>
										<th>Số điện thoại</th>
										<th>Giới tính</th>
										<th>Trạng thái</th>
										<th>Thao tác</th>
									</tr>
								</thead>
								<tbody>
									{tenants.map((tenant) => (
										<tr key={tenant.id}>
											<td>{tenant.id}</td>
											<td>{tenant.name}</td>
											<td>{tenant.birthDate}</td>
											<td>{tenant.address}</td>
											<td>{tenant.phone}</td>
											<td>{tenant.gender}</td>
											<td>
												<span
													className={`status ${
														tenant.status === "Đang thuê"
															? "active"
															: "inactive"
													}`}
												>
													{tenant.status}
												</span>
											</td>
											<td>
												<div className="action-buttons">
													<button className="edit-btn">Sửa</button>
													<button className="delete-btn">
														Xóa
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</main>
			</div>

			<AddTenantModal
				isOpen={isAddTenantModalOpen}
				onClose={() => setIsAddTenantModalOpen(false)}
				onSubmit={handleAddTenant}
			/>
		</div>
	);
};

export default TenantManagement;
