import axios from "axios";
import React, { useState } from "react";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setFormData({
      email: "",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateForm();
    setLoading(true);
    const token = JSON.parse(localStorage.getItem("auth"));
    try {
      const response = await axios.post(
        "http://localhost:3000/users/forgot-password",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Email đã được gửi đến email của bạn");
        navigate("/forgot-password");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="contract-modal">
      <div
        className="modal-content"
        style={{
          padding: "15px",
          maxWidth: "450px",
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: 0,
          }}
        >
          <h2 className="modal-title">Quên mật khẩu</h2>
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập email"
            />
            {errors.email && (
              <div className="error-message">
                <FaExclamationCircle /> {errors.email}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Đang lưu..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
