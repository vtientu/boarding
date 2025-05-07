import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const RevenueStatistics = () => {
  const [bills, setBills] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth"));
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/owners/bills", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: "Paid",
            fromDate: fromDate,
            toDate: toDate,
          },
        });
        setBills(response.data.data);
        setTotalIncome(response.data.totalIncome);
      } catch (error) {
        console.error("Error fetching bills:", error);
        toast.error(
          error.response?.data?.message || "Lỗi khi tải dữ liệu hóa đơn"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [fromDate, toDate]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <div className="stats-container">
            <div className="bill-management">
              <div className="bill-header">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h2>Thống kê doanh thu</h2>
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    Tổng doanh thu:{" "}
                    <p style={{ fontWeight: "bold" }}>
                      {totalIncome?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <p>Từ ngày</p>
                    <input
                      type="date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e1e4e8",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        backgroundColor: "#f8f9fa",
                      }}
                      value={fromDate}
                      onChange={handleFromDateChange}
                    />
                  </div>
                  <div>
                    <p>Đến ngày</p>
                    <input
                      type="date"
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #e1e4e8",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        backgroundColor: "#f8f9fa",
                      }}
                      value={toDate}
                      onChange={handleToDateChange}
                    />
                  </div>
                  <button
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      padding: "12px 16px",
                      borderRadius: "5px",
                      fontSize: "1rem",
                      height: "48px",
                    }}
                    onClick={() => exportToExcel(bills)}
                  >
                    Xuất file Excel
                  </button>
                </div>
              </div>
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
                        <th>Ngày thanh toán</th>
                        <th>Trạng thái</th>
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
                                <strong>
                                  Phòng {bill.room_id?.room_number}
                                </strong>
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
                                <strong
                                  style={{
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  {(
                                    bill.room_price +
                                    bill.electricity +
                                    bill.water +
                                    bill.additional_services
                                  ).toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  })}
                                </strong>
                              </div>
                            </td>
                            <td>
                              <div className="deadline-info">
                                {new Date(bill.updatedAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
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
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RevenueStatistics;

export const exportToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Thống kê");

  // Thêm tiêu đề lớn
  sheet.mergeCells("A1", "F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Thống kê doanh thu";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Dòng trống (A2)
  sheet.addRow([]);

  // Header
  const headers = [
    "Mã hóa đơn",
    "Thông tin phòng",
    "Thông tin người thuê",
    "Tổng tiền",
    "Ngày thanh toán",
    "Trạng thái",
  ];
  const headerRow = sheet.addRow(headers);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Body
  data.forEach((item) => {
    const rowData = [
      `#${item._id.slice(-6)}`,
      `Phòng ${item?.room_id?.room_number}`,
      `${item?.tenant_id?.name} - ${item?.tenant_id?.phone}`,
      (
        item.room_price +
        item.electricity +
        item.water +
        item.additional_services
      ).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
      new Date(item.updatedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      item?.status || "Đã thanh toán",
    ];

    const row = sheet.addRow(rowData);

    row.eachCell((cell, colNumber) => {
      if ([1, 4, 5, 6].includes(colNumber)) {
        // Căn giữa cột 1, 4 và 5
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      } else {
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Auto width cho các cột
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const text = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, text.length);
    });
    column.width = maxLength + 2;
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-oicedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "thong_ke_doanh_thu.xlsx");
};
