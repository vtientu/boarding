import React, { useState } from "react";
import "../styles/AddRoomModal.css";

const AddRoomModal = ({ isOpen, onClose, onSubmit }) => {
	const [roomData, setRoomData] = useState({
		id: "",
		price: "",
		type: "Đơn", // giá trị mặc định
		capacity: "",
		status: "Trống", // giá trị mặc định
		tenant: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setRoomData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(roomData);
		setRoomData({
			// Reset form
			id: "",
			price: "",
			type: "Đơn",
			capacity: "",
			status: "Trống",
			tenant: "",
		});
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<h2>Thêm Phòng Trọ Mới</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Số phòng:</label>
						<input
							type="text"
							name="id"
							value={roomData.id}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Giá thuê:</label>
						<input
							type="text"
							name="price"
							value={roomData.price}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Loại phòng:</label>
						<select
							name="type"
							value={roomData.type}
							onChange={handleChange}
							required
						>
							<option value="Đơn">Đơn</option>
							<option value="Đôi">Đôi</option>
						</select>
					</div>

					<div className="form-group">
						<label>Số người tối đa:</label>
						<input
							type="number"
							name="capacity"
							value={roomData.capacity}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="form-group">
						<label>Trạng thái:</label>
						<select
							name="status"
							value={roomData.status}
							onChange={handleChange}
							required
						>
							<option value="Trống">Trống</option>
							<option value="Đã thuê">Đã thuê</option>
						</select>
					</div>

					<div className="form-group">
						<label>Tên người thuê:</label>
						<input
							type="text"
							name="tenant"
							value={roomData.tenant}
							onChange={handleChange}
						/>
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

export default AddRoomModal;
