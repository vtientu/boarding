import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AddRoomModal from "../../components/AddRoomModal";
import EditRoomModal from "../../components/EditRoomModal";
import SearchFilter from "../../components/SearchFilter";
import "../../styles/RoomManagement.css";
import axios from "axios";

const RoomManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    totalMonthlyIncome: 0,
  });

  const filterOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "Available", label: "Trống" },
    { value: "Occupied", label: "Đã thuê" },
    { value: "Maintenance", label: "Đang sửa" },
  ];

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/rooms/search", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filterStatus,
          keyword: searchTerm,
        },
      });

      if (response.data.data) {
        setRooms(response.data.data);
      }

      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || 1,
          limit: response.data.pagination.limit || 10,
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 1,
        });
      }

      if (response.data.stats) {
        setStats({
          totalRooms: response.data.stats.totalRooms || 0,
          availableRooms: response.data.stats.availableRooms || 0,
          occupiedRooms: response.data.stats.occupiedRooms || 0,
          maintenanceRooms: response.data.stats.maintenanceRooms || 0,
          totalMonthlyIncome: response.data.stats.totalMonthlyIncome || 0,
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải dữ liệu");
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [pagination.page, filterStatus, searchTerm]);

  const handleAddRoom = async (roomData) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      await axios.post("http://localhost:3000/rooms", roomData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRooms();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi thêm phòng");
    }
  };

  const handleEditRoom = async (roomId) => {
    try {
      const response = await axios.get(`http://localhost:3000/rooms/detail/${roomId}`);
      setSelectedRoom(response.data.room);
      setIsEditModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải thông tin phòng");
    }
  };

  const handleUpdateRoom = async (updatedData) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      await axios.patch(`http://localhost:3000/rooms/update/${selectedRoom._id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRooms();
      setIsEditModalOpen(false);
      setSelectedRoom(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi cập nhật phòng");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        if (!token) {
          setError("Vui lòng đăng nhập để thực hiện thao tác này");
          return;
        }

        await axios.delete(`http://localhost:3000/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchRooms();
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

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="room-management">
            <div className="room-header">
              <h2>Quản Lý Phòng trọ</h2>
              <button
                className="add-room-btn"
                onClick={() => setIsModalOpen(true)}
              >
                + Thêm phòng trọ mới
              </button>
            </div>

            <AddRoomModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddRoom}
            />

            <EditRoomModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedRoom(null);
              }}
              onSubmit={handleUpdateRoom}
              room={selectedRoom}
            />

            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchPlaceholder="Tìm kiếm theo số phòng..."
              filterOptions={filterOptions}
            />

            {error && <div className="error-message">{error}</div>}

            <div className="rooms-table">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <div className="rooms-table-container">
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
                        <tr key={room._id}>
                          <td>{room.room_number}</td>
                          <td>{room.room_type}</td>
                          <td>{formatCurrency(room.rent_price)}</td>
                          <td>{room.capacity}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                room.status === "Available" ? "available" : "occupied"
                              }`}
                            >
                              {room.status === "Available" ? "Còn trống" : "Đã thuê"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="view-btn"
                                onClick={() => navigate(`/rooms/${room._id}`)}
                              >
                                Chi tiết
                              </button>
                              <button
                                className="edit-btn"
                                onClick={() => handleEditRoom(room._id)}
                              >
                                Sửa
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteRoom(room._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!loading && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(pagination.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoomManagement;
