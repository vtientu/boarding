import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SearchFilter from "../../components/SearchFilter";
import AddBoardingHouseModal from "../../components/AddBoardingHouseModal";
import "../../styles/BoardingHouseManagement.css";
import {
  getBoardingHouses,
  createBoardingHouse,
  deleteBoardingHouse,
  updateBoardingHouse,
} from "../../services/boardingHouseService";

const BoardingHouseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [summary, setSummary] = useState({
    totalBoardingHouses: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    emptyRooms: 0,
    totalIncome: 0,
  });

  const filterOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "Active", label: "Đang hoạt động" },
    { value: "Inactive", label: "Tạm ngưng" },
  ];

  const fetchBoardingHouses = async () => {
    try {
      setLoading(true);
      const response = await getBoardingHouses({
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus,
        location: searchTerm,
      });

      // Set boarding houses data
      if (response.data) {
        setBoardingHouses(response.data);
      }

      // Set pagination data
      if (response.pagination) {
        setPagination({
          page: response.pagination.page || 1,
          limit: response.pagination.limit || 10,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 1,
        });
      }

      // Set summary data
      if (response.summary) {
        setSummary({
          totalBoardingHouses: response.summary.totalBoardingHouses || 0,
          totalRooms: response.summary.totalRooms || 0,
          occupiedRooms: response.summary.occupiedRooms || 0,
          emptyRooms: response.summary.emptyRooms || 0,
          totalIncome: response.summary.totalIncome || 0,
        });
      }
    } catch (err) {
      setError(err.msg || "Có lỗi xảy ra khi tải dữ liệu");
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
    fetchBoardingHouses();
  }, [pagination.page, filterStatus, searchTerm]);

  const handleAddBoardingHouse = async (boardingHouseData) => {
    try {
      await createBoardingHouse(boardingHouseData);
      fetchBoardingHouses();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.msg || "Có lỗi xảy ra khi thêm nhà trọ");
    }
  };

  const handleDeleteBoardingHouse = async (boardingHouseId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà trọ này? Tất cả phòng trong nhà trọ cũng sẽ bị xóa.")) {
      try {
        await deleteBoardingHouse(boardingHouseId);
        fetchBoardingHouses();
      } catch (err) {
        setError(err.msg || "Có lỗi xảy ra khi xóa nhà trọ");
      }
    }
  };

  const handleUpdateBoardingHouse = async (boardingHouseId, data) => {
    try {
      await updateBoardingHouse(boardingHouseId, data);
      fetchBoardingHouses();
    } catch (err) {
      setError(err.msg || "Có lỗi xảy ra khi cập nhật nhà trọ");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
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
          <div className="boarding-house-management">
            <div className="boarding-house-header">
              <h2>Quản Lý Nhà Trọ</h2>
              <button
                className="add-boarding-house-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <i className="fas fa-plus"></i>
                Thêm Nhà Trọ
              </button>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <h3>Tổng số nhà trọ</h3>
                <p>{summary.totalBoardingHouses}</p>
              </div>
              <div className="summary-card">
                <h3>Tổng số phòng</h3>
                <p>{summary.totalRooms}</p>
              </div>
              <div className="summary-card">
                <h3>Phòng đã thuê</h3>
                <p>{summary.occupiedRooms}</p>
              </div>
              <div className="summary-card">
                <h3>Phòng trống</h3>
                <p>{summary.emptyRooms}</p>
              </div>
              <div className="summary-card">
                <h3>Tổng thu nhập</h3>
                <p>{formatCurrency(summary.totalIncome)}</p>
              </div>
            </div>

            <SearchFilter
              searchTerm={searchTerm}
              onSearch={handleSearch}
              filterOptions={filterOptions}
              selectedFilter={filterStatus}
              onFilterChange={handleFilterChange}
            />

            {error && <div className="error-message">{error}</div>}

            <div className="boarding-houses-table">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Địa chỉ</th>
                      <th>Số phòng trống</th>
                      <th>Số phòng đã thuê</th>
                      <th>Tổng thu nhập</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardingHouses.map((boardingHouse) => (
                      <tr key={boardingHouse._id}>
                        <td>{boardingHouse.location}</td>
                        <td>{boardingHouse.empty_rooms}</td>
                        <td>{boardingHouse.occupied_rooms}</td>
                        <td>{formatCurrency(boardingHouse.total_income)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              boardingHouse.status === "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {boardingHouse.status === "Active"
                              ? "Đang hoạt động"
                              : "Tạm ngưng"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleUpdateBoardingHouse(boardingHouse._id, {
                                  status:
                                    boardingHouse.status === "Active"
                                      ? "Inactive"
                                      : "Active",
                                })
                              }
                            >
                              <i
                                className={`fas fa-${
                                  boardingHouse.status === "Active"
                                    ? "pause"
                                    : "play"
                                }`}
                              ></i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteBoardingHouse(boardingHouse._id)
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddBoardingHouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBoardingHouse}
      />
    </div>
  );
};

export default BoardingHouseManagement; 