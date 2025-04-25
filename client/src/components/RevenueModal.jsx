import axios from "axios";
import { useEffect, useState } from "react";

const RevenueModal = ({ open, onClose }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth"));
    const fetchRooms = async () => {
      const response = await axios.get("http://localhost:3000/owners/bills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: "Paid",
        },
      });
      setRooms(response.data.data);
    };
    fetchRooms();
  }, []);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          minWidth: 900,
          height: "100%",
        }}
      >
        <div className="modal-header">
          <h2>Doanh thu</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            width: "100%",
            overflow: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              overflow: "auto",
            }}
          >
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Người thuê</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.room_id.room_number}</td>
                  <td>{room.tenant_id.name}</td>
                  <td>
                    {(
                      (room.room_price || 0) +
                      (room.electricity || 0) +
                      (room.water || 0) +
                      (room.additional_services || 0)
                    ).toLocaleString("vi-VN")}
                  </td>
                  <td>
                    <span className={`status ${room.status.toLowerCase()}`}>
                      {room.status === "Paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueModal;
