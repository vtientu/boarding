import React from "react";
import { FaTimes, FaPlus, FaCheck } from "react-icons/fa";
import "../styles/ContractDetailsModal.css";

const ContractDetailsModal = ({
	isOpen,
	onClose,
	contract,
	onCancel,
	onExtend,
	onApprove,
	onReject,
	type,
}) => {
	if (!isOpen || !contract) return null;

	return (
		<div className="contract-details-modal">
			<div className="modal-content">
				<div className="modal-header">
					<h2>Chi Tiết Hợp Đồng</h2>
					<button className="close-button" onClick={onClose}>
						<FaTimes />
					</button>
				</div>

				<div className="modal-body">
					<div className="details-section">
						<h3>Thông Tin Chung</h3>
						<div className="details-grid">
							<div className="detail-item">
								<span className="label">Mã hợp đồng:</span>
								<span className="value">#{contract._id.slice(-6)}</span>
							</div>
							<div className="detail-item">
								<span className="label">Trạng thái:</span>
								<span
									className={`status-badge ${contract.status.toLowerCase()}`}
								>
									{contract.status}
								</span>
							</div>
						</div>
					</div>

					<div className="details-section">
						<h3>Thông Tin Phòng</h3>
						<div className="details-grid">
							<div className="detail-item">
								<span className="label">Số phòng:</span>
								<span className="value">
									{contract.room_id?.room_number}
								</span>
							</div>
							<div className="detail-item">
								<span className="label">Loại phòng:</span>
								<span className="value">
									{contract.room_id?.room_type}
								</span>
							</div>
							<div className="detail-item">
								<span className="label">Giá thuê:</span>
								<span className="value">
									{contract.rental_price.toLocaleString()}đ/tháng
								</span>
							</div>
						</div>
					</div>

					<div className="details-section">
						<h3>Thông Tin Người Thuê</h3>
						<div className="details-grid">
							<div className="detail-item">
								<span className="label">Họ tên:</span>
								<span className="value">{contract.user_id?.name}</span>
							</div>
							<div className="detail-item">
								<span className="label">Số điện thoại:</span>
								<span className="value">{contract.user_id?.phone}</span>
							</div>
							<div className="detail-item">
								<span className="label">Email:</span>
								<span className="value">{contract.user_id?.email}</span>
							</div>
						</div>
					</div>

					<div className="details-section">
						<h3>Thông Tin Thời Hạn</h3>
						<div className="details-grid">
							<div className="detail-item">
								<span className="label">Ngày bắt đầu:</span>
								<span className="value">
									{new Date(contract.start_date).toLocaleDateString()}
								</span>
							</div>
							<div className="detail-item">
								<span className="label">Ngày kết thúc:</span>
								<span className="value">
									{new Date(contract.end_date).toLocaleDateString()}
								</span>
							</div>
							<div className="detail-item">
								<span className="label">Thời hạn:</span>
								<span className="value">
									{contract.rental_period} tháng
								</span>
							</div>
						</div>
					</div>

					{contract.description && (
						<div className="details-section">
							<h3>Ghi chú</h3>
							<div className="detail-item">
								<span className="value">{contract.description}</span>
							</div>
						</div>
					)}

					<div className="modal-actions">
						{contract.status === "Active" && (
							<>
								<button
									className="cancel-btn"
									onClick={() => onCancel(contract)}
								>
									<FaTimes /> Yêu cầu hủy
								</button>
								<button
									className="extend-btn"
									onClick={() => onExtend(contract)}
								>
									<FaPlus /> Yêu cầu gia hạn
								</button>
							</>
						)}
						{contract.status === "PendingCancel" && (
							<>
								<button
									className="approve-btn"
									onClick={() => onApprove(contract._id, "cancel")}
								>
									<FaCheck /> Duyệt yêu cầu hủy
								</button>
								<button
									className="reject-btn"
									onClick={() => onReject(contract._id, "cancel")}
								>
									<FaTimes /> Từ chối yêu cầu
								</button>
							</>
						)}
						{contract.status === "PendingExtend" && (
							<>
								<button
									className="approve-btn"
									onClick={() => onApprove(contract._id, "extend")}
								>
									<FaCheck /> Duyệt yêu cầu gia hạn
								</button>
								<button
									className="reject-btn"
									onClick={() => onReject(contract._id, "extend")}
								>
									<FaTimes /> Từ chối yêu cầu
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContractDetailsModal;
