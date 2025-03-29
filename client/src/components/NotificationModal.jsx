import React from "react";
import "../styles/NotificationModal.css";

const NotificationModal = ({ isOpen, onClose, unpaidTenants }) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h2>Gửi thông báo đóng tiền</h2>
					<button className="close-button" onClick={onClose}>
						&times;
					</button>
				</div>
				<div className="modal-body">
					<h3>Danh sách người thuê chưa đóng tiền:</h3>
					<div className="tenants-list">
						{unpaidTenants.map((tenant) => (
							<div key={tenant.roomId} className="tenant-item">
								<div className="tenant-info">
									<span>
										Phòng {tenant.roomId} - {tenant.tenant}
									</span>
									<span className="amount">
										Số tiền: {tenant.price} VND
									</span>
								</div>
								<label className="checkbox-container">
									<input type="checkbox" defaultChecked />
									<span className="checkmark"></span>
								</label>
							</div>
						))}
					</div>
					<div className="notification-message">
						<h3>Nội dung thông báo:</h3>
						<textarea
							placeholder="Nhập nội dung thông báo..."
							defaultValue="Kính gửi người thuê,
Vui lòng thanh toán tiền phòng tháng này trước ngày 15.
Xin cảm ơn!"
						/>
					</div>
				</div>
				<div className="modal-footer">
					<button className="cancel-button" onClick={onClose}>
						Hủy
					</button>
					<button
						className="send-button"
						onClick={() => {
							alert("Đã gửi thông báo thành công!");
							onClose();
						}}
					>
						Gửi thông báo
					</button>
				</div>
			</div>
		</div>
	);
};

export default NotificationModal;
