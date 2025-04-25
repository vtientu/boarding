import axios from "axios";
import { useEffect, useState } from "react";

const RoomOccupiedModal = ({ open, onClose }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth"));
    const fetchRooms = async () => {
      const response = await axios.get("http://localhost:3000/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: "Occupied",
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
          <h2>Danh sách phòng đã thuê</h2>
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
                <th>Số phòng</th>
                <th>Loại phòng</th>
                <th>Giá thuê</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>{room.month_rent?.toLocaleString("vi-VN")}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <span className={`status ${room.status.toLowerCase()}`}>
                      {room.status === "Available"
                        ? "Trống"
                        : room.status === "Occupied"
                        ? "Đã thuê"
                        : "Đang sửa"}
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

export default RoomOccupiedModal;
