import React from "react";
import { FaTimes, FaExclamationCircle } from "react-icons/fa";
import "../styles/RequestApprovalModal.css";

const RequestApprovalModal = ({
	isOpen,
	onClose,
	contract,
	onApprove,
	onReject,
	type,
}) => {
	if (!isOpen) return null;

	const getRequestTypeText = () => {
		return type === "cancel" ? "hủy" : "gia hạn";
	};

	const getRequestDetails = () => {
		if (type === "cancel") {
			return {
				title: "Yêu cầu hủy hợp đồng",
				message: "Bạn có chắc chắn muốn duyệt yêu cầu hủy hợp đồng này?",
				warning: "Hành động này sẽ chấm dứt hợp đồng thuê phòng.",
			};
		} else {
			return {
				title: "Yêu cầu gia hạn hợp đồng",
				message:
					"Bạn có chắc chắn muốn duyệt yêu cầu gia hạn hợp đồng này?",
				warning: "Hợp đồng sẽ được gia hạn thêm thời gian thuê.",
			};
		}
	};

	const details = getRequestDetails();

	return (
		<div className="request-approval-modal">
			<div className="modal-content">
				<div className="modal-header">
					<h2 className="modal-title">{details.title}</h2>
					<button className="close-button" onClick={onClose}>
						<FaTimes />
					</button>
				</div>

				<div className="modal-body">
					<div className="contract-info">
						<div className="info-section">
							<h3>Thông tin hợp đồng</h3>
							<div className="info-grid">
								<div className="info-item">
									<span className="label">Mã hợp đồng:</span>
									<span className="value">
										#{contract._id.slice(-6)}
									</span>
								</div>
								<div className="info-item">
									<span className="label">Phòng:</span>
									<span className="value">
										Phòng {contract.room_id?.room_number} -{" "}
										{contract.room_id?.room_type}
									</span>
								</div>
								<div className="info-item">
									<span className="label">Người thuê:</span>
									<span className="value">
										{contract.user_id?.name}
									</span>
								</div>
								<div className="info-item">
									<span className="label">Số điện thoại:</span>
									<span className="value">
										{contract.user_id?.phone}
									</span>
								</div>
								<div className="info-item">
									<span className="label">Ngày bắt đầu:</span>
									<span className="value">
										{new Date(
											contract.start_date
										).toLocaleDateString()}
									</span>
								</div>
								<div className="info-item">
									<span className="label">Ngày kết thúc:</span>
									<span className="value">
										{new Date(contract.end_date).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>

						<div className="warning-section">
							<FaExclamationCircle className="warning-icon" />
							<p className="warning-text">{details.warning}</p>
						</div>
					</div>
				</div>

				<div className="modal-footer">
					<button
						className="reject-button"
						onClick={() => onReject(contract._id, type)}
					>
						Từ chối
					</button>
					<button
						className="approve-button"
						onClick={() => onApprove(contract._id, type)}
					>
						Duyệt yêu cầu
					</button>
				</div>
			</div>
		</div>
	);
};

export default RequestApprovalModal;
