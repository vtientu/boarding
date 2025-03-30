import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AddUserModal from "../../components/AddUserModal";
import SearchFilter from "../../components/SearchFilter";
import "../../styles/TenantManagement.css";
import axios from "axios";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const filterOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "Owner", label: "Chủ trọ" },
    { value: "Tenant", label: "Người thuê" },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const response = await axios.get("http://localhost:3000/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          role: filterStatus,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.users) {
        setUsers(response.data.users);
      }
      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || 1,
          limit: response.data.pagination.limit || 10,
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 1,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "Có lỗi xảy ra khi tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterStatus, searchTerm]);

  const handleAddUser = async (userData) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (!token) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const endpoint =
        userData.role === "Owner"
          ? "http://localhost:3000/users/register_owner"
          : "http://localhost:3000/users/register_tenant";

      await axios.post(endpoint, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setIsAddUserModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi thêm người dùng");
    }
  };

  const handleChangeStatus = async (userId, newStatus) => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const endpoint = newStatus
        ? `http://localhost:3000/users/active/${userId}`
        : `http://localhost:3000/users/inactive/${userId}`;

      const response = await axios.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        fetchUsers();
        toast.success("Cập nhật trạng thái thành công");
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "Có lỗi xảy ra khi thay đổi trạng thái"
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        if (!token) {
          setError("Vui lòng đăng nhập để thực hiện thao tác này");
          return;
        }

        await axios.delete(`http://localhost:3000/owners/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Hiển thị thông báo thành công
        alert("Xóa người dùng thành công!");

        // Cập nhật lại danh sách người dùng
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.msg || "Có lỗi xảy ra khi xóa người dùng");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="tenant-management">
            <div className="tenant-header">
              <h2>Quản Lý Người Dùng</h2>
              <button
                className="add-tenant-btn"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                Thêm người dùng
              </button>
            </div>

            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchPlaceholder="Tìm kiếm theo tên, email..."
              filterOptions={filterOptions}
            />

            {error && <div className="error-message">{error}</div>}

            <div className="tenants-table">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <p
                            style={{
                              width: "200px",
                              whiteSpace: "normal",
                            }}
                          >
                            {user.address}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`status ${
                              user.role_id?.role_name === "Owner"
                                ? "owner"
                                : "tenant"
                            }`}
                          >
                            {user.role_id?.role_name === "Owner"
                              ? "Chủ trọ"
                              : "Người thuê"}
                          </span>
                        </td>
                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={user.status === "active"}
                              onChange={() =>
                                handleChangeStatus(
                                  user._id,
                                  user.status === "inactive"
                                )
                              }
                            />
                            <span className="slider round"></span>
                          </label>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn">Sửa</button>
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

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default UserManagement;
