import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";
import { socketClient } from "../socket";
import { useNavigate } from "react-router-dom";

const NewChatModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [receivers, setReceivers] = useState([]);
  const [formData, setFormData] = useState({
    receiver_id: "",
    message_content: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchReceivers = async () => {
    const response = await axios.get("http://localhost:3000/chat/users", {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth"))}`,
      },
    });
    setReceivers(response.data.data);
  };

  useEffect(() => {
    fetchReceivers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setFormData({
      receiver_id: "",
      message_content: "",
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await socketClient.sendMessage(formData);
    if (response) {
      handleClose();
      navigate(`/chat/${response.receiver_id._id}`);
    }
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
          <h2 className="modal-title">Tạo cuộc hội thoại mới</h2>
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Người dùng</label>
            <select
              name="receiver_id"
              value={formData.receiver_id}
              onChange={handleChange}
              className="form-input"
            >
              {receivers.map((receiver) => (
                <option key={receiver._id} value={receiver._id}>
                  {receiver.name}
                </option>
              ))}
            </select>
            {errors.receiver_id && (
              <div className="error-message">
                <FaExclamationCircle /> {errors.receiver_id}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Nội dung</label>
            <textarea
              type="text"
              name="message_content"
              value={formData.message_content}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập nội dung"
            />
            {errors.message_content && (
              <div className="error-message">
                <FaExclamationCircle /> {errors.message_content}
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

export default NewChatModal;
