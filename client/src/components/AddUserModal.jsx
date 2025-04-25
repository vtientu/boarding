import { useEffect, useState } from "react";
import "./AddUserModal.css";
import { FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
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
    room_id: "",
    user_id: "",
    start_date: "",
    rental_period: "",
    rental_price: "",
    deposit: "",
    description: "",
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Họ và tên là bắt buộc";
    if (!formData.username) errors.username = "Tên đăng nhập là bắt buộc";
    if (!formData.email) errors.email = "Email là bắt buộc";
    if (!formData.password) errors.password = "Mật khẩu là bắt buộc";
    if (!formData.phone) errors.phone = "Số điện thoại là bắt buộc";
    if (!formData.address) errors.address = "Địa chỉ là bắt buộc";
    if (formData.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (formData.role === "Tenant") {
      if (!formData.room_id) errors.room_id = "Vui lòng nhập số phòng";
      if (!formData.start_date)
        errors.start_date = "Vui lòng chọn ngày bắt đầu";
      if (!formData.rental_period)
        errors.rental_period = "Vui lòng nhập thời hạn thuê";
      if (!formData.deposit) errors.deposit = "Vui lòng nhập tiền đặt cọc";
    }

    return errors;
  };
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role" && value === "Owner") {
      setError((prev) => ({
        ...prev,
        room_id: "",
        user_id: "",
        start_date: "",
        rental_period: "",
        rental_price: "",
        deposit: "",
      }));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const fetchUsers = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch users
      const usersResponse = await axios.get(
        "http://localhost:3000/users/tenant/combo",
        {
          headers,
        }
      );
      setUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu người dùng");
    }
  };

  const fetchRooms = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const headers = { Authorization: `Bearer ${token}` };

      const roomsResponse = await axios.get(
        "http://localhost:3000/rooms/combo",
        {
          params: {
            status: "Available",
          },
          headers,
        }
      );
      setRooms(roomsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu phòng");
    }
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

  useEffect(() => {
    if (isOpen) {
      // Fetch users when modal opens
      fetchUsers();
      fetchRooms();
      // If in edit mode, populate form with contract data
    }
  }, [isOpen]);

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

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <h3
            style={{
              gridColumn: "1 / 3",
            }}
          >
            Thông tin chung
          </h3>
          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            />
            {error.email && <p className="error-message">{error.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <div
              className="password-input"
              style={{
                alignItems: "center",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash
                    style={{
                      fontSize: 20,
                    }}
                  />
                ) : (
                  <FaEye
                    style={{
                      fontSize: 20,
                    }}
                  />
                )}
              </button>
            </div>
            {error.password && (
              <p className="error-message">{error.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
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
            <label htmlFor="address">Địa chỉ *</label>
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
            {error.gender && <p className="error-message">{error.gender}</p>}
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
              <h3
                style={{
                  gridColumn: "1 / 3",
                }}
              >
                Thông tin người thuê
              </h3>
              <div className="form-group">
                <label className="form-label">Số phòng</label>
                <select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Chọn số phòng</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
                {error.room_id && (
                  <div className="error-message">
                    <FaExclamationCircle /> {error.room_id}
                  </div>
                )}
              </div>

              {/* <div className="form-group">
              <label className="form-label">Loại phòng</label>
              <input
                type="text"
                name="room_type"
                value={roomType}
                className="form-input"
                disabled
                placeholder="Nhập loại phòng"
              />
              {error.room_type && (
                <div className="error-message">
                  <FaExclamationCircle /> {error.room_type}
                </div>
              )}
            </div> */}

              <div className="form-group">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="form-input"
                />
                {error.start_date && (
                  <div className="error-message">
                    <FaExclamationCircle /> {error.start_date}
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
                {error.rental_period && (
                  <div className="error-message">
                    <FaExclamationCircle /> {error.rental_period}
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
                {error.deposit && (
                  <div className="error-message">
                    <FaExclamationCircle /> {error.deposit}
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
            </>
          )}

          <div
            className="modal-footer"
            style={{
              gridColumn: "1 / 3",
            }}
          >
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
