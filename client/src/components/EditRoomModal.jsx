import React, { useState, useEffect } from "react";
import "../styles/EditRoomModal.css";

const EditRoomModal = ({ isOpen, onClose, onSubmit, room }) => {
  const [roomData, setRoomData] = useState({
    room_number: "",
    room_type: "Đơn",
    capacity: "",
    month_rent: "",
    status: "Available",
    description: "",
  });

  useEffect(() => {
    if (room) {
      setRoomData({
        room_number: room.room_number || "",
        room_type: room.room_type || "Đơn",
        capacity: room.capacity || "",
        month_rent: room.month_rent || "",
        status: room.status || "Available",
        description: room.description || "",
      });
    }
  }, [room]);

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
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Chỉnh sửa thông tin phòng</h2>
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
            <label>Loại phòng:</label>
            <select
              name="room_type"
              value={roomData.room_type}
              onChange={handleChange}
              required
            >
              <option value="Đơn">Đơn</option>
              <option value="Đôi">Đôi</option>
              <option value="Ba">Ba</option>
              <option value="Bốn">Bốn</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá thuê:</label>
            <input
              type="number"
              name="month_rent"
              value={roomData.month_rent}
              onChange={handleChange}
              required
            />
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
              rows="4"
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-btn">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoomModal; 