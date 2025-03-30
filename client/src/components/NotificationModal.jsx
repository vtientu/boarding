import React, { useState } from "react";
import "../styles/NotificationModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const NotificationModal = ({ isOpen, onClose, unpaidBills }) => {
  const [notificationContent, setNotificationContent] = useState("");
  const [selectedBillIds, setSelectedBillIds] = useState(
    unpaidBills?.map((bill) => bill?._id) || []
  );

  const handleSelectBill = (billId) => {
    if (selectedBillIds.includes(billId)) {
      setSelectedBillIds(selectedBillIds.filter((id) => id !== billId));
    } else {
      setSelectedBillIds([...selectedBillIds, billId]);
    }
  };

  const handleClose = () => {
    setSelectedBillIds([]);
    setNotificationContent("");
    onClose();
  };

  const handleSendNotification = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/owners/bills/send-notification",
        {
          bill_ids: selectedBillIds,
          notification_content: notificationContent,
        },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth"))}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Gửi thông báo thành công!");
        setSelectedBillIds([]);
        setNotificationContent("");
        handleClose();
      } else {
        toast.error(response.data.message || "Gửi thông báo thất bại!");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Gửi thông báo thất bại!");
    }
  };

  if (!isOpen) return null;
  console.log(unpaidBills);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Gửi thông báo đóng tiền</h2>
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <h3>Danh sách người thuê chưa đóng tiền:</h3>
          <div className="tenants-list">
            {unpaidBills?.map((bill) => {
              const totalAmount =
                bill?.room_price +
                bill?.electricity +
                bill?.water +
                bill?.additional_services;

              return (
                <div key={bill._id} className="tenant-item">
                  <div className="tenant-info">
                    <span>
                      Phòng {bill?.room_id?.room_number} -{" "}
                      {bill?.tenant_id?.name}
                    </span>
                    <span className="amount">
                      Số tiền: {totalAmount || 0} VND
                    </span>
                  </div>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      defaultChecked
                      checked={selectedBillIds.includes(bill?._id)}
                      onChange={() => handleSelectBill(bill?._id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
              );
            })}
          </div>
          <div className="notification-message">
            <h3>Nội dung thông báo:</h3>
            <textarea
              placeholder="Nhập nội dung thông báo..."
              defaultValue="Kính gửi người thuê,
Vui lòng thanh toán tiền phòng tháng này trước ngày 15.
Xin cảm ơn!"
              onChange={(e) => setNotificationContent(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Hủy
          </button>
          <button className="send-button" onClick={handleSendNotification}>
            Gửi thông báo
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
