import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socketClient } from "../../socket";
import { toast } from "react-toastify";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import EmojiPicker, { Emoji } from "emoji-picker-react";

const ChatDetails = () => {
  const { id } = useParams();
  const chatContentRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [receiver, setReceiver] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const getReceiver = async () => {
    const authToken = JSON.parse(localStorage.getItem("auth")) || "";
    const response = await axios.get(`http://localhost:3000/users/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    setReceiver(response.data.user);
  };

  const sendMessage = async (receiverId, content) => {
    try {
      const message = await socketClient.sendMessage({
        receiver_id: receiverId,
        message_content: content,
      });
      setMessageContent("");
      setMessages((prevMessages) => [message, ...prevMessages]);
    } catch (error) {
      toast.error(error.message || "Error sending message");
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageContent(messageContent + emoji.emoji);
  };

  useEffect(() => {
    // Kết nối socket trước
    const authToken = JSON.parse(localStorage.getItem("auth")) || "";
    socketClient.connect(authToken);

    // Sau đó mới lấy thông tin người nhận và join room
    getReceiver();
    socketClient.joinRoom(id);

    // Đăng ký lắng nghe sự kiện
    socketClient.on("receive_message", (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    // Lấy lịch sử tin nhắn
    socketClient.getMessages(id).then((data) => {
      setMessages(data.messages);
    });

    // Cleanup function
    return () => {
      socketClient.off("receive_message");
      socketClient.off("online_users");
      socketClient.disconnect();
    };
  }, [id]); // Thêm id vào dependencies

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <div className="main-content">
          <div className="bill-management">
            <div className="bill-header">
              <h2>{receiver?.name}</h2>
            </div>
            <div style={styles.chatContent} ref={chatContentRef}>
              {messages?.map((message) => {
                const isReceiver = message?.receiver_id?._id === receiver?._id;
                return (
                  <div
                    key={message?._id}
                    style={
                      isReceiver ? styles.messageReceiver : styles.messageSender
                    }
                  >
                    <div style={styles.messageContent}>
                      {message?.message_content}
                    </div>
                    <div style={styles.messageUser}>
                      {isReceiver ? "Bạn" : receiver?.name}
                    </div>
                  </div>
                );
              })}
            </div>{" "}
            <div style={styles.messageInput}>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "end",
                }}
              >
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <EmojiPicker
                    open={showEmojiPicker}
                    onEmojiClick={handleEmojiClick}
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "0",
                    }}
                  />
                  <EmojiIcon />
                </button>

                <button
                  onClick={() => sendMessage(receiver?._id, messageContent)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmojiIcon = () => {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30}>
      <path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.011 9.011 0 0 1-9 9zm6-8a6 6 0 0 1-12 0 1 1 0 0 1 2 0 4 4 0 0 0 8 0 1 1 0 0 1 2 0zM8 10V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0zm6 0V9a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0z" />
    </svg>
  );
};

const SendIcon = () => {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40}>
      <path
        d="M21.707 2.293a1 1 0 0 0-1.069-.225l-18 7a1 1 0 0 0 .145 1.909l8.379 1.861 1.862 8.379a1 1 0 0 0 .9.78L14 22a1 1 0 0 0 .932-.638l7-18a1 1 0 0 0-.225-1.069zm-7.445 15.275L13.1 12.319l2.112-2.112a1 1 0 0 0-1.414-1.414L11.681 10.9 6.432 9.738l12.812-4.982z"
        style={{ fill: "blue" }}
        data-name="Share"
      />
    </svg>
  );
};

export default ChatDetails;

const styles = {
  chatContent: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "10px",
    width: "100%",
    height: 500,
    overflowY: "auto",
    flexDirection: "column-reverse",
  },
  messageReceiver: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: "10px",
    width: "100%",
  },
  messageSender: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: "10px",
    width: "100%",
  },
  messageContent: {
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "5px",
  },
  messageUser: {
    fontWeight: "bold",
    marginBottom: "5px",
    textAlign: "right",
  },
};
