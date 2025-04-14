import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/UpdateBillModal.css";

const UpdateBillModal = ({ isOpen, onClose, bill, onUpdate }) => {
  const token = JSON.parse(localStorage.getItem("auth"));
  const [rooms, setRooms] = useState([]);
  const [tenant, setTanent] = useState([]);

  const [formData, setFormData] = useState({
    room_price: "",
    electricity: "",
    water: "",
    additional_services: "",
    payment_deadline: "",
    room_id: "",
    details: {
      additional_notes: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setFormData({
      room_price: "",
      electricity: "",
      water: "",
      additional_services: "",
      payment_deadline: "",
      room_id: "",
      details: {
        additional_notes: "",
      },
    });
    setErrors({});
    setRooms([]);
    onClose();
  };

  const getTenants = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/users/tenant/combo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTanent(response.data.users);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Không thể lấy danh sách người thanh toán"
      );
    }
  };

  const getRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms/combo", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          status: "Occupied",
        },
      });
      setRooms(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Không thể lấy danh sách phòng"
      );
    }
  };

  const tanentName = useMemo(() => {
    return (
      rooms.find((item) => item._id === formData.room_id)?.tenant_id?.name || ""
    );
  }, [rooms, formData.room_id]);

  const roomPrice = useMemo(() => {
    return (
      rooms.find((item) => item._id === formData.room_id)?.contract
        ?.rental_price || ""
    );
  }, [rooms, formData.room_id]);

  useEffect(() => {
    if (bill) {
      setFormData({
        room_price: bill.room_price || "",
        electricity: bill.electricity || "",
        water: bill.water || "",
        additional_services: bill.additional_services || "",
        payment_deadline: bill.payment_deadline
          ? new Date(bill.payment_deadline).toISOString().split("T")[0]
          : "",
        details: {
          additional_notes: bill.details?.additional_notes || "",
        },
      });
    }
  }, [bill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "additional_notes") {
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          additional_notes: value,
        },
      }));
    } else if (name === "room_id") {
      setFormData((prev) => ({
        ...prev,
        room_id: value,
        tenant_id: rooms.find((item) => item._id === value)?.tenant_id?._id,
        room_price: rooms.find((item) => item._id === value)?.contract
          ?.rental_price,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.room_id) newErrors.room_id = "Vui lòng chọn phòng";
    if (!formData.room_price) newErrors.room_price = "Vui lòng nhập tiền phòng";
    if (!formData.electricity)
      newErrors.electricity = "Vui lòng nhập tiền điện";
    if (!formData.water) newErrors.water = "Vui lòng nhập tiền nước";
    if (!formData.payment_deadline)
      newErrors.payment_deadline = "Vui lòng chọn hạn thanh toán";
    if (!formData.tenant_id)
      newErrors.tenant_id = "Vui lòng chọn người thanh toán";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = bill
        ? await axios.put(
            `http://localhost:3000/owners/bills/${bill._id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        : await axios.post(
            "http://localhost:3000/owners/bills/create",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
      onUpdate(response.data.bill);
      toast.success(
        bill ? "Cập nhật hóa đơn thành công" : "Tạo hóa đơn thành công"
      );
      handleClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (bill
            ? "Có lỗi xảy ra khi cập nhật hóa đơn"
            : "Có lỗi xảy ra khi tạo hóa đơn")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !bill) {
      getRooms();
      getTenants();
    }
    return () => {
      setRooms([]);
    };
  }, [isOpen, bill]);

  if (!isOpen) return null;

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  };

  return (
    <div className="update-bill-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {bill ? "Cập nhật hóa đơn" : "Tạo hóa đơn"}
          </h2>
          <button className="close-button" onClick={handleClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!bill && (
              <>
                <div className="form-group">
                  <label className="form-label">Phòng trọ</label>
                  <div>
                    <select
                      name="room_id"
                      value={formData.room_id}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="">Chọn phòng</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.room_number} - {room.month_rent} VNĐ
                        </option>
                      ))}
                    </select>
                    {errors.room_id && (
                      <div className="error-message">{errors.room_id}</div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Người thanh toán</label>
                  <div>
                    <div>
                      <input
                        type="text"
                        name="tenant_id"
                        className="form-input"
                        value={tanentName}
                        disabled
                        placeholder="Người thanh toán"
                        style={inputStyle}
                      />
                    </div>
                    {errors.tenant_id && (
                      <div className="error-message">{errors.tenant_id}</div>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Tiền phòng</label>
              <div>
                <input
                  type="text"
                  name="room_price"
                  className="form-input"
                  value={roomPrice.toLocaleString("vi-VN")}
                  disabled
                  placeholder="Tiền phòng"
                  style={inputStyle}
                />
              </div>
              {errors.room_price && (
                <div className="error-message">{errors.room_price}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tiền điện</label>
              <div>
                <input
                  type="number"
                  name="electricity"
                  className="form-input"
                  value={formData.electricity}
                  onChange={handleChange}
                  placeholder="Nhập tiền điện"
                  style={inputStyle}
                />
              </div>
              {errors.electricity && (
                <div className="error-message">{errors.electricity}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tiền nước</label>
              <div>
                <input
                  type="number"
                  name="water"
                  className="form-input"
                  value={formData.water}
                  onChange={handleChange}
                  placeholder="Nhập tiền nước"
                  style={inputStyle}
                />
              </div>
              {errors.water && (
                <div className="error-message">{errors.water}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Dịch vụ khác</label>
              <div>
                <input
                  type="number"
                  name="additional_services"
                  className="form-input"
                  value={formData.additional_services}
                  onChange={handleChange}
                  placeholder="Nhập tiền dịch vụ khác"
                  style={inputStyle}
                />
              </div>
              {errors.additional_services && (
                <div className="error-message">
                  {errors.additional_services}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Hạn thanh toán</label>
              <input
                type="date"
                name="payment_deadline"
                className="form-input"
                value={formData.payment_deadline}
                onChange={handleChange}
                style={inputStyle}
              />
              {errors.payment_deadline && (
                <div className="error-message">{errors.payment_deadline}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Ghi chú</label>
              <textarea
                name="additional_notes"
                className="form-textarea"
                value={formData.details?.additional_notes}
                onChange={handleChange}
                placeholder="Nhập ghi chú (nếu có)"
                style={inputStyle}
              />
            </div>
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
              {loading
                ? bill
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : bill
                ? "Lưu thay đổi"
                : "Tạo hóa đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBillModal;
