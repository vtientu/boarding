import { useEffect, useState } from "react";
import { socketClient } from "../../socket";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import NewChatModal from "../../components/NewChatModal";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/UserSidebar";

const Chat = () => {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  useEffect(() => {
    const authToken = JSON.parse(localStorage.getItem("auth")) || "";
    // Kết nối socket khi component mount
    socketClient.connect(authToken);

    socketClient.getConversations().then((data) => {
      console.log(data);
      setConversation(data);
    });

    return () => {
      setConversation([]);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        {user.role_id.role_name === "Tenant" ? <UserSidebar /> : <Sidebar />}
        <main className="main-content">
          <div className="bill-management">
            <div className="bill-header">
              <h2>Chat</h2>
              <button
                className="add-boarding-house-btn"
                onClick={() => setIsNewChatModalOpen(true)}
              >
                Tạo cuộc hội thoại mới
              </button>
            </div>
            <div>
              {conversation.length > 0 ? (
                conversation.map((contact) => {
                  console.log(contact);

                  return (
                    <div
                      key={contact.room_id}
                      style={styles.conversation}
                      onClick={() => navigate(`/chat/${contact.contact._id}`)}
                    >
                      <div
                        style={{
                          ...styles.avatar,
                          backgroundColor: getRandomColor(),
                        }}
                      >
                        {contact.contact.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={styles.content}>
                        <div style={styles.name}>
                          {contact.contact.name}{" "}
                          <span style={styles.role}>
                            ({contact.contact.role})
                          </span>
                        </div>
                        <div style={styles.message}>
                          {contact.last_message.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  Không có cuộc hội thoại nào
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
};

export default Chat;

const getRandomColor = () => {
  const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ✅ Hàm format thời gian
const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ✅ CSS Inline
const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  conversation: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #ddd",
    cursor: "pointer",
  },
  avatar: {
    width: "50px",
    height: "50px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "20px",
    borderRadius: "50%",
  },
  content: {
    flex: 1,
    marginLeft: "10px",
  },
  name: {
    fontWeight: "bold",
  },
  role: {
    fontSize: "12px",
    color: "gray",
  },
  message: {
    color: "gray",
    fontSize: "14px",
  },
  info: {
    textAlign: "right",
  },
  time: {
    fontSize: "12px",
    color: "gray",
  },
  unread: {
    background: "red",
    color: "white",
    fontSize: "12px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5px",
  },
  online: {
    color: "green",
    fontSize: "12px",
    fontWeight: "bold",
  },
};
