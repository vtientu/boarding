import React, { useState } from "react";
import "./AddUserModal.css";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "Tenant", // Default role
    age: "",
    gender: "Other",
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Họ và tên là bắt buộc";
    if (!formData.username) errors.username = "Tên đăng nhập là bắt buộc";
    if (!formData.email) errors.email = "Email là bắt buộc";
    if (!formData.password) errors.password = "Mật khẩu là bắt buộc";
    if (formData.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thêm Người Dùng Mới</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {error.name && <p className="error-message">{error.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {error.username && (
              <p className="error-message">{error.username}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {error.email && <p className="error-message">{error.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error.password && (
              <p className="error-message">{error.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {error.phone && <p className="error-message">{error.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {error.address && <p className="error-message">{error.address}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Vai trò *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Tenant">Người thuê</option>
              <option value="Owner">Chủ trọ</option>
            </select>
            {error.role && <p className="error-message">{error.role}</p>}
          </div>

          {formData.role === "Tenant" && (
            <>
              <div className="form-group">
                <label htmlFor="age">Tuổi</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                />
                {error.age && <p className="error-message">{error.age}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Other">Khác</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
                {error.gender && (
                  <p className="error-message">{error.gender}</p>
                )}
              </div>
            </>
          )}

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="submit-button">
              Thêm mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
