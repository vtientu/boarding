import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/UpdateBillModal.css";

const UpdateBillModal = ({ isOpen, onClose, bill, onUpdate }) => {
	const [formData, setFormData] = useState({
		room_price: "",
		electricity: "",
		water: "",
		additional_services: "",
		payment_deadline: "",
		details: {
			additional_notes: "",
		},
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (bill) {
			setFormData({
				room_price: bill.room_price || "",
				electricity: bill.electricity || "",
				water: bill.water || "",
				additional_services: bill.additional_services || "",
				payment_deadline: bill.payment_deadline
					? new Date(bill.payment_deadline).toISOString().split("T")[0]
					: "",
				details: {
					additional_notes: bill.details?.additional_notes || "",
				},
			});
		}
	}, [bill]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "additional_notes") {
			setFormData((prev) => ({
				...prev,
				details: {
					...prev.details,
					additional_notes: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.room_price)
			newErrors.room_price = "Vui lòng nhập tiền phòng";
		if (!formData.electricity)
			newErrors.electricity = "Vui lòng nhập tiền điện";
		if (!formData.water) newErrors.water = "Vui lòng nhập tiền nước";
		if (!formData.payment_deadline)
			newErrors.payment_deadline = "Vui lòng chọn hạn thanh toán";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			setLoading(true);
			const token = JSON.parse(localStorage.getItem("auth"));
			const response = await axios.put(
				`http://localhost:3000/owners/bills/${bill._id}`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			toast.success("Cập nhật hóa đơn thành công");
			onUpdate(response.data.bill);
			onClose();
		} catch (error) {
			console.error("Error updating bill:", error);
			toast.error(
				error.response?.data?.message ||
					"Có lỗi xảy ra khi cập nhật hóa đơn"
			);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="update-bill-modal">
			<div className="modal-content">
				<div className="modal-header">
					<h2 className="modal-title">Cập nhật hóa đơn</h2>
					<button className="close-button" onClick={onClose}>
						&times;
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div className="modal-body">
						<div className="form-group">
							<label className="form-label">Tiền phòng</label>
							<div className="amount-input">
								<input
									type="number"
									name="room_price"
									className="form-input"
									value={formData.room_price}
									onChange={handleChange}
									placeholder="Nhập tiền phòng"
								/>
							</div>
							{errors.room_price && (
								<div className="error-message">{errors.room_price}</div>
							)}
						</div>

						<div className="form-group">
							<label className="form-label">Tiền điện</label>
							<div className="amount-input">
								<input
									type="number"
									name="electricity"
									className="form-input"
									value={formData.electricity}
									onChange={handleChange}
									placeholder="Nhập tiền điện"
								/>
							</div>
							{errors.electricity && (
								<div className="error-message">
									{errors.electricity}
								</div>
							)}
						</div>

						<div className="form-group">
							<label className="form-label">Tiền nước</label>
							<div className="amount-input">
								<input
									type="number"
									name="water"
									className="form-input"
									value={formData.water}
									onChange={handleChange}
									placeholder="Nhập tiền nước"
								/>
							</div>
							{errors.water && (
								<div className="error-message">{errors.water}</div>
							)}
						</div>

						<div className="form-group">
							<label className="form-label">Dịch vụ khác</label>
							<div className="amount-input">
								<input
									type="number"
									name="additional_services"
									className="form-input"
									value={formData.additional_services}
									onChange={handleChange}
									placeholder="Nhập tiền dịch vụ khác"
								/>
							</div>
						</div>

						<div className="form-group">
							<label className="form-label">Hạn thanh toán</label>
							<input
								type="date"
								name="payment_deadline"
								className="form-input"
								value={formData.payment_deadline}
								onChange={handleChange}
							/>
							{errors.payment_deadline && (
								<div className="error-message">
									{errors.payment_deadline}
								</div>
							)}
						</div>

						<div className="form-group full-width">
							<label className="form-label">Ghi chú</label>
							<textarea
								name="additional_notes"
								className="form-textarea"
								value={formData.details.additional_notes}
								onChange={handleChange}
								placeholder="Nhập ghi chú (nếu có)"
							/>
						</div>
					</div>

					<div className="modal-footer">
						<button
							type="button"
							className="cancel-button"
							onClick={onClose}
						>
							Hủy
						</button>
						<button
							type="submit"
							className="save-button"
							disabled={loading}
						>
							{loading ? "Đang cập nhật..." : "Lưu thay đổi"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UpdateBillModal;
