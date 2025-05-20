import React, { useState, useEffect } from "react";
import axios from "axios";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";
import "../../styles/Payment.css";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const message = searchParams.get("message");
  const paymentId = searchParams.get("paymentId");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

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
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchData = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      setLoading(true);
      // Fetch user info
      const userResponse = await api.get("/tenants/profile", {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      setUserInfo(userResponse.data);

      // Fetch bills
      const billsResponse = await api.get("/tenants/bills", {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      setBills(billsResponse.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user info and bills

  const handlePayment = async () => {
    try {
      if (!selectedBill || !paymentMethod) {
        setError("Vui lòng chọn hóa đơn và phương thức thanh toán");
        return;
      }

      const auth = JSON.parse(localStorage.getItem("auth"));

      const response = await api.post(
        "/payments/create",
        {
          billId: selectedBill._id,
          paymentMethod: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        }
      );

      if (paymentMethod === "Online Payment") {
        // Redirect to VNPay payment page
        window.location.href = response.data.data.paymentUrl;
      } else {
        // Show success message for other payment methods
        alert("Yêu cầu thanh toán đã được tạo thành công!");
        // Refresh bills list
        const billsResponse = await api.get("/tenants/bills", {
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        });
        setBills(billsResponse.data.data);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.msg || "Có lỗi xảy ra khi thực hiện thanh toán"
      );
    }
  };

  const paymentMethods = [
    { value: "Online Payment", label: "Thanh toán trực tuyến (VNPay)" },
    { value: "Bank Transfer", label: "Chuyển khoản ngân hàng" },
    { value: "Cash", label: "Tiền mặt" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (type === "success") {
      toast.success("Thanh toán thành công");
    }
    if (type === "failed") {
      toast.error(message);
    }
    if (type === "success" && paymentId) {
      setBills(
        bills.map((bill) =>
          bill._id === paymentId ? { ...bill, status: "Paid" } : bill
        )
      );
    }
  }, [type, message, paymentId]);

  return (
    <div className="dashboard-container">
      <UserHeader />
      <div className="dashboard-content">
        <UserSidebar />
        <main className="main-content">
          <div className="payment-container">
            <div className="payment-header">
              <h2>Thanh Toán Tiền Trọ</h2>
              {error && <div className="error-message">{error}</div>}
            </div>

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <div className="payment-content">
                <div className="payment-left">
                  {/* User Information */}
                  <div className="user-info-card">
                    <div className="card-header">
                      <h3>Thông tin người dùng</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <span className="info-label">Họ và tên:</span>
                        <span className="info-value">{userInfo?.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{userInfo?.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Số điện thoại:</span>
                        <span className="info-value">{userInfo?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="payment-method-card">
                    <div className="card-header">
                      <h3>Phương thức thanh toán</h3>
                    </div>
                    <div className="card-content">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.value}
                          className={`payment-method-option ${
                            paymentMethod === method.value ? "selected" : ""
                          }`}
                          onClick={() => setPaymentMethod(method.value)}
                        >
                          <input
                            type="radio"
                            id={method.value}
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={() => setPaymentMethod(method.value)}
                          />
                          <label htmlFor={method.value}>{method.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Action */}
                  <div className="payment-action-card">
                    <button
                      className="pay-button"
                      onClick={handlePayment}
                      disabled={!selectedBill || !paymentMethod}
                    >
                      Thanh toán
                    </button>
                  </div>
                </div>

                <div className="payment-right">
                  {/* Bills List */}
                  <div className="bills-card">
                    <div className="card-header">
                      <h3>Danh sách hóa đơn</h3>
                    </div>
                    <div className="bills-list">
                      {bills?.slice(0, 1)?.map((bill) => (
                        <div
                          key={bill._id}
                          className={`bill-item ${
                            selectedBill?._id === bill._id
                              ? "selected"
                              : bill.status === "Paid"
                              ? "paid"
                              : ""
                          }`}
                          onClick={() => {
                            if (bill.status !== "Paid") {
                              setSelectedBill(bill);
                            }
                          }}
                        >
                          <div className="bill-header">
                            <h4>Hóa đơn #{bill._id.slice(-6)}</h4>
                            <span
                              className={`status ${bill.status?.toLowerCase()}`}
                            >
                              {bill?.status}
                            </span>
                          </div>
                          <div className="bill-details">
                            <div className="bill-row">
                              <span>Phòng:</span>
                              <span>{bill.room_id?.room_number}</span>
                            </div>
                            <div className="bill-row">
                              <span>Tiền phòng:</span>
                              <span>{bill.room_price.toLocaleString()}đ</span>
                            </div>
                            <div className="bill-row">
                              <span>Tiền điện:</span>
                              <span>{bill.electricity.toLocaleString()}đ</span>
                            </div>
                            <div className="bill-row">
                              <span>Tiền nước:</span>
                              <span>{bill.water.toLocaleString()}đ</span>
                            </div>
                            <div className="bill-row">
                              <span>Dịch vụ khác:</span>
                              <span>
                                {bill.additional_services.toLocaleString()}đ
                              </span>
                            </div>
                            <div className="bill-row total">
                              <span>Tổng cộng:</span>
                              <span>
                                {(
                                  bill.room_price +
                                  bill.electricity +
                                  bill.water +
                                  bill.additional_services
                                ).toLocaleString()}
                                đ
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payment;
