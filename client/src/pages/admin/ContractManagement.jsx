import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SearchFilter from "../../components/SearchFilter";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "../../styles/ContractManagement.css";
import ContractModal from "../../components/ContractModal";
import RequestApprovalModal from "../../components/RequestApprovalModal";
import ContractDetailsModal from "../../components/ContractDetailsModal";

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContract, setSelectedContract] = useState(null);
  const [expandedContractId, setExpandedContractId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState(null);

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

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        // Lấy danh sách phòng trước
        const roomsResponse = await api.get("/rooms");
        if (!roomsResponse?.data?.data) {
          throw new Error("Không thể lấy danh sách phòng");
        }
        const rooms = roomsResponse.data.data;

        // Lấy hợp đồng cho từng phòng
        const contractsPromises = rooms.map(async (room) => {
          if (!room || !room._id) {
            console.warn("Invalid room data:", room);
            return [];
          }
          try {
            const response = await api.get(`/contracts/room/${room._id}`);
            console.log(`Response for room ${room._id}:`, response);

            // Kiểm tra response và data
            if (!response || !response.data) {
              console.warn(`Invalid response for room ${room._id}:`, response);
              return [];
            }

            // Nếu response.data là một mảng, trả về trực tiếp
            if (Array.isArray(response.data)) {
              return response.data;
            }

            // Nếu response.data là một object đơn lẻ, chuyển thành mảng
            if (typeof response.data === "object" && response.data !== null) {
              return [response.data];
            }

            // Nếu response.data có thuộc tính data, trả về data
            if (response.data.data) {
              return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
            }

            console.warn(
              `No valid data found for room ${room._id}:`,
              response.data
            );
            return [];
          } catch (error) {
            console.error(
              `Error fetching contracts for room ${room._id}:`,
              error
            );
            if (error.response?.status === 500) {
              toast.error(
                `Lỗi server khi lấy hợp đồng phòng ${room.room_number}`
              );
            }
            return [];
          }
        });

        const contractsArrays = await Promise.all(contractsPromises);
        const allContracts = contractsArrays.flat();
        console.log("All contracts:", allContracts);
        setContracts(allContracts);
      } catch (err) {
        console.error("Error fetching contracts:", err);
        if (err.response?.status === 500) {
          toast.error(
            "Lỗi server khi lấy danh sách hợp đồng. Vui lòng thử lại sau."
          );
        } else {
          toast.error(
            err.response?.data?.msg || "Có lỗi xảy ra khi tải dữ liệu"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Active", label: "Đang hoạt động" },
    { value: "Expired", label: "Đã hết hạn" },
    { value: "Terminated", label: "Đã hủy" },
  ];

  const handleCreateContract = async (formData) => {
    try {
      const response = await api.post("/contracts/create", formData);
      toast.success("Tạo hợp đồng thành công");
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
    } catch (error) {
      console.error("Error creating contract:", error);
      throw error;
    }
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleUpdateContract = async (formData) => {
    try {
      const response = await api.put(
        `/contracts/${selectedContract._id}`,
        formData
      );
      toast.success("Cập nhật hợp đồng thành công");
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error;
    }
  };

  const handleDeleteContract = async (contractId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này?")) {
      try {
        await api.delete(`/contracts/${contractId}`);
        toast.success("Xóa hợp đồng thành công");
        setContracts(
          contracts.filter((contract) => contract._id !== contractId)
        );
      } catch (error) {
        console.error("Error deleting contract:", error);
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi xóa hợp đồng"
        );
      }
    }
  };

  const handleCancelContract = async (contract) => {
    if (!contract || !contract._id) {
      toast.error("Dữ liệu hợp đồng không hợp lệ");
      return;
    }
    try {
      await api.post(`/contracts/${contract._id}/cancel`);
      toast.success("Yêu cầu hủy hợp đồng đã được gửi");
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
    } catch (error) {
      console.error("Error canceling contract:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu hủy"
      );
    }
  };

  const handleExtendContract = async (contract) => {
    if (!contract || !contract._id) {
      toast.error("Dữ liệu hợp đồng không hợp lệ");
      return;
    }
    try {
      await api.post(`/contracts/${contract._id}/extend`);
      toast.success("Yêu cầu gia hạn hợp đồng đã được gửi");
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
    } catch (error) {
      console.error("Error extending contract:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu gia hạn"
      );
    }
  };

  const handleApproveRequest = async (contractId, type) => {
    try {
      await api.put(`/contracts/${contractId}/approve-request`, {
        requestType: type,
      });
      toast.success(
        `Đã duyệt yêu cầu ${type === "cancel" ? "hủy" : "gia hạn"} hợp đồng`
      );
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
      setIsApprovalModalOpen(false);
      setSelectedContract(null);
      setSelectedRequestType(null);
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu"
      );
    }
  };

  const handleRejectRequest = async (contractId, type) => {
    try {
      await api.put(`/contracts/${contractId}/reject-request`, {
        requestType: type,
      });
      toast.success(
        `Đã từ chối yêu cầu ${type === "cancel" ? "hủy" : "gia hạn"} hợp đồng`
      );
      // Refresh contracts list
      const roomsResponse = await api.get("/rooms");
      const rooms = roomsResponse?.data?.data || [];
      const contractsPromises = rooms.map(async (room) => {
        if (!room || !room._id) {
          console.warn("Invalid room data:", room);
          return [];
        }
        try {
          const response = await api.get(`/contracts/room/${room._id}`);
          if (!response || !response.data) {
            console.warn(`Invalid response for room ${room._id}:`, response);
            return [];
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
          if (response.data.data) {
            return response.data.data;
          }
          console.warn(
            `No valid data found for room ${room._id}:`,
            response.data
          );
          return [];
        } catch (error) {
          console.error(
            `Error fetching contracts for room ${room._id}:`,
            error
          );
          return [];
        }
      });
      const contractsArrays = await Promise.all(contractsPromises);
      const allContracts = contractsArrays.flat();
      setContracts(allContracts);
      setIsApprovalModalOpen(false);
      setSelectedContract(null);
      setSelectedRequestType(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi từ chối yêu cầu"
      );
    }
  };

  const handleOpenApprovalModal = (contract, type) => {
    setSelectedContract(contract);
    setSelectedRequestType(type);
    setIsApprovalModalOpen(true);
  };

  const toggleContractDetails = (contractId) => {
    setExpandedContractId(
      expandedContractId === contractId ? null : contractId
    );
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="contract-management">
            <div className="contract-header">
              <h2>Quản Lý Hợp Đồng</h2>
              <div className="header-buttons">
                <button
                  className="create-contract-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <FaPlus /> Tạo hợp đồng
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
              <div className="contracts-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã HĐ</th>
                      <th>Phòng</th>
                      <th>Người thuê</th>
                      <th>Ngày bắt đầu</th>
                      <th>Thời hạn</th>
                      <th>Giá thuê</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract._id}>
                        <td>#{contract._id.slice(-6)}</td>
                        <td>
                          Phòng {contract.room_id?.room_number}
                          <span className="room-type">
                            ({contract.room_id?.room_type})
                          </span>
                        </td>
                        <td>
                          {contract.user_id?.name}
                          <span className="tenant-phone">
                            {contract.user_id?.phone}
                          </span>
                        </td>
                        <td>
                          {new Date(contract.start_date).toLocaleDateString()}
                        </td>
                        <td>{contract.rental_period} tháng</td>
                        <td>
                          {contract.rental_price.toLocaleString()}
                          đ/tháng
                        </td>
                        <td>
                          <span
                            className={`status-badge ${contract.status.toLowerCase()}`}
                          >
                            {contract.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => handleViewContract(contract)}
                              title="Xem chi tiết"
                            >
                              <FaFileAlt />
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleEditContract(contract)}
                              title="Sửa hợp đồng"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteContract(contract._id)}
                              title="Xóa hợp đồng"
                            >
                              <FaTrash />
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
        </main>
      </div>

      {/* Add Contract Modal */}
      <ContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContract}
        mode="create"
      />

      {/* Edit Contract Modal */}
      <ContractModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onSubmit={handleUpdateContract}
        mode="edit"
      />

      {/* Add Request Approval Modal */}
      <RequestApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedContract(null);
          setSelectedRequestType(null);
        }}
        contract={selectedContract}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        type={selectedRequestType}
      />

      {/* Contract Details Modal */}
      <ContractDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onCancel={handleCancelContract}
        onExtend={handleExtendContract}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        type={selectedRequestType}
      />
    </div>
  );
};

export default ContractManagement;
