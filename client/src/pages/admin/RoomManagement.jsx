import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AddRoomModal from "../../components/AddRoomModal";
import SearchFilter from "../../components/SearchFilter";
import "../../styles/RoomManagement.css";
import axios from "axios";

const RoomManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      // Set rooms data
      if (response.data.data) {
        setRooms(response.data.data);
      }

      // Set pagination data with fallback values
      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || 1,
          limit: response.data.pagination.limit || 10,
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 1,
        });
      }

      // Set stats data
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
      // Reset pagination to default values on error
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

  useEffect(() => {
    console.log(rooms);
  }, [rooms]);

  const handleAddRoom = async (roomData) => {
    try {
      await axios.post("/api/rooms", roomData);
      fetchRooms();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi thêm phòng");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      try {
        await axios.delete(`/api/rooms/${roomId}`);
        fetchRooms();
      } catch (err) {
        setError(err.response?.data?.msg || "Có lỗi xảy ra khi xóa phòng");
      }
    }
  };

  const handleEditRoom = async (roomId, updatedData) => {
    try {
      await axios.patch(`/api/rooms/update/${roomId}`, updatedData);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi cập nhật phòng");
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
                <table>
                  <thead>
                    <tr>
                      <th>Số phòng</th>
                      <th>Loại phòng</th>
                      <th>Giá thuê</th>
                      <th>Số người</th>
                      <th>Địa chỉ</th>
                      <th>Mô tả</th>
                      <th>Nhà trọ</th>
                      <th>Tên người thuê</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room._id}>
                        <td>{room.room_number}</td>
                        <td>{room.room_type}</td>
                        <td>{formatCurrency(room.month_rent)}</td>
                        <td>{room.capacity}</td>
                        <td>{room.address || "-"}</td>
                        <td>{room.description || "-"}</td>
                        <td>{room.boarding_house_id?.location || "-"}</td>
                        <td>
                          {room.contract ? (
                            <div className="tenant-info">
                              <div className="tenant-name">{room.contract.user_id.name}</div>
                              <div className="tenant-contact">
                                <span className="tenant-phone">{room.contract.user_id.phone}</span>
                                <span className="tenant-email">{room.contract.user_id.email}</span>
                              </div>
                              <div className="contract-dates">
                                <span>Bắt đầu: {new Date(room.contract.start_date).toLocaleDateString('vi-VN')}</span>
                                <span>Kết thúc: {new Date(room.contract.end_date).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              room.status === "Occupied"
                                ? "occupied"
                                : room.status === "Available"
                                ? "vacant"
                                : "maintenance"
                            }`}
                          >
                            {room.status === "Occupied"
                              ? "Đã thuê"
                              : room.status === "Available"
                              ? "Trống"
                              : "Đang sửa"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
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
