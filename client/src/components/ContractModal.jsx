import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTimes, FaExclamationCircle } from "react-icons/fa";
import "../styles/ContractModal.css";

const ContractModal = ({ isOpen, onClose, contract, onSubmit, mode }) => {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    user_id: "",
    start_date: "",
    rental_period: "",
    rental_price: "",
    deposit: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch users when modal opens
      fetchUsers();

      // If in edit mode, populate form with contract data
      if (mode === "edit" && contract) {
        setFormData({
          room_number: contract.room_id?.room_number || "",
          room_type: contract.room_id?.room_type || "",
          user_id: contract.user_id?._id || "",
          start_date: new Date(contract.start_date).toISOString().split("T")[0],
          rental_period: contract.rental_period || "",
          rental_price: contract.rental_price || "",
          deposit: contract.deposit || "",
          description: contract.description || "",
        });
      }
    }
  }, [isOpen, mode, contract]);

  const fetchUsers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch users
      const usersResponse = await fetch("http://localhost:3000/users", {
        headers,
      });
      const usersData = await usersResponse.json();
      setUsers(usersData.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu người dùng");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.room_number) newErrors.room_number = "Vui lòng nhập số phòng";
    if (!formData.room_type) newErrors.room_type = "Vui lòng nhập loại phòng";
    if (!formData.user_id) newErrors.user_id = "Vui lòng chọn người thuê";
    if (!formData.start_date)
      newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!formData.rental_period)
      newErrors.rental_period = "Vui lòng nhập thời hạn thuê";
    if (!formData.rental_price)
      newErrors.rental_price = "Vui lòng nhập giá thuê";
    if (!formData.deposit) newErrors.deposit = "Vui lòng nhập tiền đặt cọc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu hợp đồng"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contract-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === "create" ? "Tạo Hợp Đồng Mới" : "Chỉnh Sửa Hợp Đồng"}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Số phòng</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nhập số phòng"
                />
                {errors.room_number && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.room_number}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Loại phòng</label>
                <input
                  type="text"
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nhập loại phòng"
                />
                {errors.room_type && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.room_type}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Người thuê</label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nhập loại phòng"
                />
                {errors.user_id && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.user_id}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.start_date && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.start_date}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Thời hạn thuê (tháng)</label>
                <input
                  type="number"
                  name="rental_period"
                  value={formData.rental_period}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                />
                {errors.rental_period && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.rental_period}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Giá thuê (đồng/tháng)</label>
                <input
                  type="number"
                  name="rental_price"
                  value={formData.rental_price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                />
                {errors.rental_price && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.rental_price}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Tiền đặt cọc (đồng)</label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                />
                {errors.deposit && (
                  <div className="error-message">
                    <FaExclamationCircle /> {errors.deposit}
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Ghi chú</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading
                ? "Đang lưu..."
                : mode === "create"
                ? "Tạo hợp đồng"
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractModal;
