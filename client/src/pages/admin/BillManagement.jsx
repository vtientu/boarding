import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import NotificationModal from "../../components/NotificationModal";
import SearchFilter from "../../components/SearchFilter";
import BillDetailsModal from "../../components/BillDetailsModal";
import UpdateBillModal from "../../components/UpdateBillModal";
import "../../styles/BillManagement.css";
import { toast } from "react-toastify";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const BillManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [expandedBills, setExpandedBills] = useState(new Set());

  // Cấu hình axios
  const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add a request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = JSON.parse(localStorage.getItem("auth"));
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await api.get("/owners/bills", {
          params: {
            status: filterStatus,
            search: searchTerm,
          },
        });
        setBills(response.data.data);
      } catch (err) {
        console.error("Error fetching bills:", err);
        toast.error(err.response?.data?.msg || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [filterStatus, searchTerm]);

  const unpaidTenants = bills.filter(
    (bill) => !bill.payment_status || bill.payment_status === "Pending"
  );

  const filterOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "Pending", label: "Chờ thanh toán" },
    { value: "Paid", label: "Đã thanh toán" },
    { value: "Overdue", label: "Quá hạn" },
  ];

  const handleCreateBill = () => {
    // TODO: Implement create bill functionality
    setIsUpdateModalOpen(true);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsDetailsModalOpen(true);
  };

  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateBill = (updatedBill) => {
    const isExist = bills.some((bill) => bill._id === updatedBill._id);

    if (!isExist) {
      setBills((prevBills) => [updatedBill, ...prevBills]);
    } else {
      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill._id === updatedBill._id ? updatedBill : bill
        )
      );
    }
  };

  const toggleBillDetails = (billId) => {
    setExpandedBills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="bill-management">
            <div className="bill-header">
              <h2>Quản Lý Hóa đơn</h2>
              <div className="header-buttons">
                <button className="create-bill-btn" onClick={handleCreateBill}>
                  Tạo hóa đơn
                </button>
                <button
                  className="send-notification-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Gửi thông báo
                </button>
              </div>
            </div>

            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchPlaceholder="Tìm kiếm theo số phòng hoặc tên người thuê..."
              filterOptions={filterOptions}
            />

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <div className="bills-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã hóa đơn</th>
                      <th>Thông tin phòng</th>
                      <th>Thông tin người thuê</th>
                      <th>Tổng tiền</th>
                      <th>Hạn thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <React.Fragment key={bill._id}>
                        <tr>
                          <td>
                            <span className="bill-id">
                              #{bill._id.slice(-6)}
                            </span>
                          </td>
                          <td>
                            <div className="room-info">
                              <strong>Phòng {bill.room_id?.room_number}</strong>
                              <span className="room-type">
                                {bill.room_id?.room_type}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="tenant-info">
                              <strong>{bill.tenant_id?.name || "--"}</strong>
                              <span>{bill.tenant_id?.phone || "--"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="amount-info">
                              <strong>
                                {(
                                  bill.room_price +
                                  bill.electricity +
                                  bill.water +
                                  bill.additional_services
                                ).toLocaleString()}
                                đ
                              </strong>
                              <button
                                className="expand-btn"
                                onClick={() => toggleBillDetails(bill._id)}
                              >
                                {expandedBills.has(bill._id) ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="deadline-info">
                              {new Date(
                                bill.payment_deadline
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                bill.status?.toLowerCase() || "pending"
                              }`}
                            >
                              {bill.status || "Chưa thanh toán"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="view-btn"
                                onClick={() => handleViewBill(bill)}
                                title="Xem chi tiết"
                              >
                                Xem
                              </button>
                              {/* <button
                                className="print-btn"
                                onClick={() => handlePrintBill(bill)}
                                title="In hóa đơn"
                              >
                                In
                              </button> */}
                              <button
                                className="edit-btn"
                                onClick={() => handleEditBill(bill)}
                                title="Sửa hóa đơn"
                              >
                                Sửa
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedBills.has(bill._id) && (
                          <tr className="details-row">
                            <td colSpan="7">
                              <div className="bill-details">
                                <div className="details-grid">
                                  <div className="detail-item">
                                    <span className="label">Tiền phòng:</span>
                                    <span className="value">
                                      {bill.room_price.toLocaleString()}đ
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Tiền điện:</span>
                                    <span className="value">
                                      {bill.electricity.toLocaleString()}đ
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Tiền nước:</span>
                                    <span className="value">
                                      {bill.water.toLocaleString()}đ
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Dịch vụ khác:</span>
                                    <span className="value">
                                      {bill.additional_services.toLocaleString()}
                                      đ
                                    </span>
                                  </div>
                                  {bill.details && (
                                    <div className="detail-item">
                                      <span className="label">Ghi chú:</span>
                                      <span className="value">
                                        {bill.details.additional_notes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unpaidBills={unpaidTenants}
      />

      <BillDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        bill={selectedBill}
      />

      <UpdateBillModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
        onUpdate={handleUpdateBill}
      />
    </div>
  );
};

export default BillManagement;
