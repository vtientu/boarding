import React, { useState } from "react";
import "../styles/AddTenantModal.css";

const AddTenantModal = ({ isOpen, onClose, onSubmit }) => {
	const [tenantData, setTenantData] = useState({
		roomId: "",
		tenantName: "",
		phoneNumber: "",
		email: "",
		idCard: "",
		birthDate: "",
		address: "",
		emergencyContact: "",
		startDate: "",
		deposit: "",
		monthlyRent: "",
		paymentDate: "",
		status: "Chưa",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setTenantData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(tenantData);
		setTenantData({
			roomId: "",
			tenantName: "",
			phoneNumber: "",
			email: "",
			idCard: "",
			birthDate: "",
			address: "",
			emergencyContact: "",
			startDate: "",
			deposit: "",
			monthlyRent: "",
			paymentDate: "",
			status: "Chưa",
		});
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>Thêm Người Thuê Mới</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Số phòng:</label>
						<input
							type="text"
							name="roomId"
							value={tenantData.roomId}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Họ và tên:</label>
						<input
							type="text"
							name="tenantName"
							value={tenantData.tenantName}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Số điện thoại:</label>
						<input
							type="tel"
							name="phoneNumber"
							value={tenantData.phoneNumber}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Email:</label>
						<input
							type="email"
							name="email"
							value={tenantData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>CCCD/CMND:</label>
						<input
							type="text"
							name="idCard"
							value={tenantData.idCard}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Ngày sinh:</label>
						<input
							type="date"
							name="birthDate"
							value={tenantData.birthDate}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Địa chỉ thường trú:</label>
						<input
							type="text"
							name="address"
							value={tenantData.address}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Số điện thoại người thân:</label>
						<input
							type="tel"
							name="emergencyContact"
							value={tenantData.emergencyContact}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Ngày bắt đầu thuê:</label>
						<input
							type="date"
							name="startDate"
							value={tenantData.startDate}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Tiền đặt cọc:</label>
						<input
							type="number"
							name="deposit"
							value={tenantData.deposit}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Tiền thuê hàng tháng:</label>
						<input
							type="number"
							name="monthlyRent"
							value={tenantData.monthlyRent}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Ngày thanh toán:</label>
						<input
							type="date"
							name="paymentDate"
							value={tenantData.paymentDate}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Trạng thái thanh toán:</label>
						<select
							name="status"
							value={tenantData.status}
							onChange={handleChange}
							required
						>
							<option value="Chưa">Chưa thanh toán</option>
							<option value="Đã thanh toán">Đã thanh toán</option>
						</select>
					</div>

					<div className="modal-buttons">
						<button
							type="button"
							className="cancel-btn"
							onClick={onClose}
						>
							Hủy
						</button>
						<button type="submit" className="submit-btn">
							Lưu
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddTenantModal;
