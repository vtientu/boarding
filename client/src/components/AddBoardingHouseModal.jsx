import React, { useState } from "react";
import "../styles/AddBoardingHouseModal.css";

const AddBoardingHouseModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    location: "",
    status: "Active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      location: "",
      status: "Active",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thêm Nhà Trọ Mới</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Địa chỉ</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
              placeholder="Nhập địa chỉ nhà trọ"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Trạng thái</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              required
            >
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Tạm ngưng</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button">
              Thêm nhà trọ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBoardingHouseModal; 