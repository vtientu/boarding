import React, { useState } from "react";
import "../styles/AddRoomModal.css";

const AddRoomModal = ({ isOpen, onClose, onSubmit }) => {
  const [roomData, setRoomData] = useState({
    room_number: "",
    room_type: "Deluxe",
    status: "Available",
    capacity: "",
    month_rent: "",
    description: "",
    address: "",
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
      room_number: "",
      room_type: "Deluxe",
      status: "Available",
      capacity: "",
      month_rent: "",
      description: "",
      address: "",
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
              name="room_number"
              value={roomData.room_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Giá thuê:</label>
            <input
              type="number"
              name="month_rent"
              value={roomData.month_rent}
              onChange={handleChange}
              min={1}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>

          <div className="form-group">
            <label>Loại phòng:</label>
            <select
              name="room_type"
              value={roomData.room_type}
              onChange={handleChange}
              required
            >
              <option value="Deluxe">Deluxe</option>
              <option value="Standard">Standard</option>
              <option value="Basic">Basic</option>
            </select>
          </div>
          <div className="form-group">
            <label>Số người tối đa:</label>
            <input
              type="number"
              name="capacity"
              value={roomData.capacity}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}
              min={1}
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
              <option value="Available">Trống</option>
              <option value="Occupied">Đã thuê</option>
              <option value="Maintenance">Đang sửa</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={roomData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={roomData.address}
              onChange={handleChange}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
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
