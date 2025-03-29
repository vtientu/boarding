import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("auth");
        
        if (token) {
          // Call logout API if needed
          await axios.post("http://localhost:3000/auth/logout", {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }

        // Remove token and user data from localStorage
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        
        // Remove authorization header from axios defaults
        delete axios.defaults.headers.common['Authorization'];
        
        toast.success("Đăng xuất thành công!");
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
        // Still remove local data even if API call fails
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common['Authorization'];
        navigate("/login");
      }
    };

    handleLogout();
  }, [navigate]);

  return null;
};

export default Logout; 