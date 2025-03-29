import { useEffect, useState } from "react";
import { socketClient } from "../../socket";
import axios from "axios";
import { toast } from "react-toastify";

const Chat = () => {
  const [conversation, setConversation] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchConversation = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/chat/conversations"
      );
      setConversation(response.data.conversations);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchConversation();
    // const authToken = JSON.parse(localStorage.getItem("auth")) || "";
    // // Kết nối socket khi component mount
    // socketClient.connect(authToken);

    // // Cleanup khi component unmount
    // return () => {
    //   socketClient.disconnect();
    // };
    return () => {
      setConversation([]);
    };
  }, []);

  return <div>Chat</div>;
};

export default Chat;
