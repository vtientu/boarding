import React, { useState, useEffect } from "react";
import "../styles/EditBoardingHouseModal.css";

const EditBoardingHouseModal = ({ isOpen, onClose, onSubmit, boardingHouse }) => {
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    total_rooms: "",
    amenities: "",
  });

  useEffect(() => {
    if (boardingHouse) {
      setFormData({
        location: boardingHouse.location || "",
        description: boardingHouse.description || "",
        total_rooms: boardingHouse.total_rooms || "",
        amenities: boardingHouse.amenities || "",
      });
    }
  }, [boardingHouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Sửa thông tin nhà trọ</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="location">Địa chỉ:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-btn">
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBoardingHouseModal; 