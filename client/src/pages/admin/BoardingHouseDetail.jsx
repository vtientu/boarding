import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import EditBoardingHouseModal from "../../components/EditBoardingHouseModal";
import "../../styles/BoardingHouseDetail.css";
import axios from "axios";

const BoardingHouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boardingHouse, setBoardingHouse] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomsError, setRoomsError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBoardingHouseDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/boardinghouses/detail/${id}`);
      if (response.data.boardingHouse) {
        setBoardingHouse(response.data.boardingHouse);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải thông tin nhà trọ");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await axios.get(`http://localhost:3000/rooms/boardinghouse/${id}`);
      if (response.data.rooms) {
        setRooms(response.data.rooms);
      }
    } catch (err) {
      setRoomsError(err.response?.data?.msg || "Có lỗi xảy ra khi tải danh sách phòng");
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardingHouseDetail();
    fetchRooms();
  }, [id]);

  const handleUpdateBoardingHouse = async (updatedData) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      await axios.patch(
        `http://localhost:3000/boardinghouses/update/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBoardingHouseDetail();
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi cập nhật nhà trọ");
    }
  };

  const handleDeleteBoardingHouse = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà trọ này?")) {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        if (!token) {
          setError("Vui lòng đăng nhập để thực hiện thao tác này");
          return;
        }

        await axios.delete(`http://localhost:3000/boardinghouses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate("/boardinghouses");
      } catch (err) {
        setError(err.response?.data?.msg || "Có lỗi xảy ra khi xóa nhà trọ");
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

  if (!boardingHouse) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-content">
          <Sidebar />
          <main className="main-content">
            <div className="error-message">Không tìm thấy thông tin nhà trọ</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="boarding-house-detail">
            <div className="detail-header">
              <h2>Chi tiết nhà trọ</h2>
              <div className="header-buttons">
                <button
                  className="edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Sửa thông tin
                </button>
                <button
                  className="delete-btn"
                  onClick={handleDeleteBoardingHouse}
                >
                  Xóa nhà trọ
                </button>
              </div>
            </div>

            <div className="detail-content">
              <div className="info-section">
                <h3>Thông tin cơ bản</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Địa chỉ:</label>
                    <span>{boardingHouse.location}</span>
                  </div>
                  <div className="info-item">
                    <label>Phòng trống:</label>
                    <span>{boardingHouse.empty_rooms}</span>
                  </div>
                  <div className="info-item">
                    <label>Phòng đã thuê:</label>
                    <span>{boardingHouse.occupied_rooms}</span>
                  </div>
                  <div className="info-item">
                    <label>Tổng thu nhập:</label>
                    <span>{formatCurrency(boardingHouse.total_income)}</span>
                  </div>
                </div>
              </div>

              <div className="rooms-section">
                <div className="section-header">
                  <h3>Danh sách phòng</h3>
                  <button className="add-btn">Thêm phòng mới</button>
                </div>
                <div className="table-container">
                  {roomsLoading ? (
                    <div className="loading">Đang tải danh sách phòng...</div>
                  ) : roomsError ? (
                    <div className="error-message">{roomsError}</div>
                  ) : rooms.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Số phòng</th>
                          <th>Loại phòng</th>
                          <th>Giá thuê</th>
                          <th>Sức chứa</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id}>
                            <td>{room.room_number}</td>
                            <td>{room.room_type}</td>
                            <td>{formatCurrency(room.rent_price)}</td>
                            <td>{room.capacity}</td>
                            <td>
                              <span className={`status ${room.status.toLowerCase()}`}>
                                {room.status}
                              </span>
                            </td>
                            <td>
                              <button className="edit-btn">Sửa</button>
                              <button className="delete-btn">Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-rooms">
                      <p>Chưa có phòng nào. Nhấn "Thêm phòng mới" để bắt đầu.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <EditBoardingHouseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateBoardingHouse}
        boardingHouse={boardingHouse}
      />
    </div>
  );
};

export default BoardingHouseDetail; 