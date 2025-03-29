import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socketClient } from "../../socket";
import { toast } from "react-toastify";
import axios from "axios";

const ChatDetails = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const sendMessage = async (receiverId, content) => {
    try {
      const message = await socketClient.sendMessage({
        receiver_id: receiverId,
        message_content: content,
      });
      setMessageContent("");
      setMessages((prevMessages) => [...prevMessages, message]);
    } catch (error) {
      toast.error(error.message || "Error sending message");
    }
  };

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/chat/messages/" + id,
        {
          params: {
            page: pagination.page,
            limit: pagination.limit,
          },
        }
      );

      // Set rooms data
      if (response.data.data) {
        setMessages(response.data.data);
      }

      // Set pagination data with fallback values
      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || 1,
          limit: response.data.pagination.limit || 10,
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 1,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error fetching messages");
      // Reset pagination to default values on error
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const authToken = JSON.parse(localStorage.getItem("auth")) || "";
    socketClient.connect(authToken);
    socketClient.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socketClient.off("receive_message");
      socketClient.disconnect();
    };
  }, []);

  return <div>ChatDetails</div>;
};

export default ChatDetails;
