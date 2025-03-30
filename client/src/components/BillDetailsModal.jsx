import React from "react";
import { FaTimes, FaPrint } from "react-icons/fa";
import "../styles/BillDetailsModal.css";

const BillDetailsModal = ({ isOpen, onClose, bill }) => {
  if (!isOpen || !bill) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const totalAmount =
    bill.room_price + bill.electricity + bill.water + bill.additional_services;

  return (
    <div className="bill-details-modal">
      <div
        className="modal-content"
        style={{
          maxWidth: 1300,
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            Chi tiết hóa đơn #{bill._id.slice(-6)}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="bill-info">
            <div className="info-section">
              <h3>Thông tin phòng</h3>
              <div className="info-item">
                <span className="info-label">Số phòng</span>
                <span className="info-value">{bill.room_id?.room_number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loại phòng</span>
                <span className="info-value">{bill.room_id?.room_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Giá phòng</span>
                <span className="info-value">
                  {formatCurrency(bill.room_price)}
                </span>
              </div>
            </div>

            <div className="info-section">
              <h3>Thông tin người thuê</h3>
              {bill?.tenant_id ? (
                <>
                  <div className="info-item">
                    <span className="info-label">Họ và tên</span>
                    <span className="info-value">
                      {bill.tenant_id?.name || "--"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Số điện thoại</span>
                    <span className="info-value">
                      {bill.tenant_id?.phone || "--"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">
                      {bill.tenant_id?.email || "--"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="info-item">
                  <span className="info-value">Chưa có người thuê</span>
                </div>
              )}
            </div>
          </div>

          <div className="bill-amounts">
            <div className="amount-item">
              <span className="amount-label">Tiền phòng</span>
              <span className="amount-value">
                {formatCurrency(bill.room_price)}
              </span>
            </div>
            <div className="amount-item">
              <span className="amount-label">Tiền điện</span>
              <span className="amount-value">
                {formatCurrency(bill.electricity)}
              </span>
            </div>
            <div className="amount-item">
              <span className="amount-label">Tiền nước</span>
              <span className="amount-value">{formatCurrency(bill.water)}</span>
            </div>
            <div className="amount-item">
              <span className="amount-label">Dịch vụ khác</span>
              <span className="amount-value">
                {formatCurrency(bill.additional_services)}
              </span>
            </div>
            <div className="total-amount">
              <span className="total-label">Tổng cộng</span>
              <span className="total-value">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Thông tin bổ sung</h3>
            <div className="info-item">
              <span className="info-label">Ngày tạo</span>
              <span className="info-value">{formatDate(bill.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hạn thanh toán</span>
              <span className="info-value">
                {formatDate(bill.payment_deadline)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái</span>
              <span
                className={`status-badge ${
                  bill.payment_status?.toLowerCase() || "pending"
                }`}
              >
                {bill.payment_status || "Chưa thanh toán"}
              </span>
            </div>
            {bill.details?.additional_notes && (
              <div className="info-item">
                <span className="info-label">Ghi chú</span>
                <span className="info-value">
                  {bill.details.additional_notes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsModal;
