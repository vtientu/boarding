import axios from "axios";
import { useEffect, useState } from "react";

const PeopleOccupiedModal = ({ open, onClose }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth"));
    const fetchRooms = async () => {
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: "Tenant",
        },
      });
      setRooms(response.data.users);
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
          <h2>Danh sách người thuê</h2>
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
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Giới tính</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td>{room.name}</td>
                  <td>{room.email}</td>
                  <td>{room.phone}</td>
                  <td>
                    <span className={`status ${room.gender.toLowerCase()}`}>
                      {room.gender === "Male" ? "Nam" : "Nữ"}
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

export default PeopleOccupiedModal;
