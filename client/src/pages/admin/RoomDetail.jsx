import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import EditRoomModal from "../../components/EditRoomModal";
import "../../styles/RoomDetail.css";
import axios from "axios";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/rooms/detail/${id}`);
        setRoom(response.data.room);
      } catch (err) {
        setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải thông tin phòng");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetail();
  }, [id]);

  const handleEditRoom = async (updatedData) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      await axios.patch(`http://localhost:3000/rooms/update/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Refresh room data after update
      const response = await axios.get(`http://localhost:3000/rooms/detail/${id}`);
      setRoom(response.data.room);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi cập nhật thông tin phòng");
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        if (!token) {
          setError("Vui lòng đăng nhập để thực hiện thao tác này");
          return;
        }

        await axios.delete(`http://localhost:3000/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate("/rooms");
      } catch (err) {
        setError(err.response?.data?.msg || "Có lỗi xảy ra khi xóa phòng");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="loading">Đang tải...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="error-message">{error}</div>
          </main>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="error-message">Không tìm thấy thông tin phòng</div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'occupied':
        return 'occupied';
      case 'available':
        return 'available';
      case 'maintenance':
        return 'maintenance';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Không xác định';
    switch (status) {
      case 'Occupied':
        return 'Đã thuê';
      case 'Available':
        return 'Trống';
      case 'Maintenance':
        return 'Đang sửa';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="room-detail">
            <div className="room-detail-header">
              <button className="back-button" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left"></i> Quay lại
              </button>
              <h2>Chi tiết phòng {room.room_number}</h2>
            </div>

            <div className="room-detail-content">
              <div className="room-info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Loại phòng:</label>
                    <span>{room.room_type || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="info-item">
                    <label>Giá thuê:</label>
                    <span>{formatCurrency(room.month_rent || 0)}</span>
                  </div>
                  <div className="info-item">
                    <label>Số người tối đa:</label>
                    <span>{room.capacity || 0} người</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span className={`status-badge ${getStatusClass(room.status)}`}>
                      {getStatusText(room.status)}
                    </span>
                  </div>
                </div>
              </div>

              {room.contract && (
                <div className="tenant-info-section">
                  <h3>Thông tin người thuê</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ tên:</label>
                      <span>{room.contract.user_id?.name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại:</label>
                      <span>{room.contract.user_id?.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{room.contract.user_id?.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày bắt đầu:</label>
                      <span>{room.contract.start_date ? new Date(room.contract.start_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày kết thúc:</label>
                      <span>{room.contract.end_date ? new Date(room.contract.end_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="room-actions">
                <button className="edit-button" onClick={() => setIsEditModalOpen(true)}>
                  <i className="fas fa-edit"></i> Chỉnh sửa
                </button>
                <button className="delete-button" onClick={handleDeleteRoom}>
                  <i className="fas fa-trash"></i> Xóa phòng
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditRoom}
        room={room}
      />
    </div>
  );
};

export default RoomDetail; 