import React, { useState, useEffect } from "react";
import "./AddUserModal.css";

const EditUserModal = ({ isOpen, onClose, onSubmit, user }) => {
	const [formData, setFormData] = useState({
		name: "",
		username: "",
		email: "",
		phone: "",
		address: "",
		role: "",
		age: "",
		gender: "",
		status: "",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
				username: user.username || "",
				email: user.email || "",
				phone: user.phone || "",
				address: user.address || "",
				role: user.role_id?.role_name || "",
				age: user.age || "",
				gender: user.gender || "",
				status: user.status || "active",
			});
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h2>Sửa Thông Tin Người Dùng</h2>
					<button className="close-button" onClick={onClose}>
						&times;
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="name">Họ và tên *</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="username">Tên đăng nhập *</label>
						<input
							type="text"
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="email">Email *</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label htmlFor="phone">Số điện thoại</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="address">Địa chỉ</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleChange}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="role">Vai trò *</label>
						<select
							id="role"
							name="role"
							value={formData.role}
							onChange={handleChange}
							required
						>
							<option value="">Chọn vai trò</option>
							<option value="Owner">Chủ trọ</option>
							<option value="Tenant">Người thuê</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="status">Trạng thái *</label>
						<select
							id="status"
							name="status"
							value={formData.status}
							onChange={handleChange}
							required
						>
							<option value="active">Hoạt động</option>
							<option value="inactive">Không hoạt động</option>
						</select>
					</div>

					{formData.role === "Tenant" && (
						<>
							<div className="form-group">
								<label htmlFor="age">Tuổi</label>
								<input
									type="number"
									id="age"
									name="age"
									value={formData.age}
									onChange={handleChange}
									min="18"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="gender">Giới tính</label>
								<select
									id="gender"
									name="gender"
									value={formData.gender}
									onChange={handleChange}
								>
									<option value="">Chọn giới tính</option>
									<option value="Nam">Nam</option>
									<option value="Nữ">Nữ</option>
								</select>
							</div>
						</>
					)}

					<div className="modal-footer">
						<button type="button" className="cancel-button" onClick={onClose}>
							Hủy
						</button>
						<button type="submit" className="submit-button">
							Cập nhật
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditUserModal; 