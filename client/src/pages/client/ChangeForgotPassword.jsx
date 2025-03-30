import React, { useEffect, useState } from "react";
import Image from "../../assets/image.png";
import Logo from "../../assets/logo.png";
import GoogleSvg from "../../assets/icons8-google.svg";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import "../../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";

const ChangeForgotPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("auth")) || ""
  );
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let code = e.target.code.value;
    let password = e.target.password.value;

    if (code.length > 0 && password.length > 0) {
      const formData = {
        code,
        password,
      };
      try {
        const response = await axios.post(
          "http://localhost:3000/users/reset-password",
          formData
        );

        localStorage.setItem("auth", JSON.stringify(response.data.token));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Reset password successfull");
        if (response.data.user.role_id.role_name === "Tenant") {
          navigate("/user-dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      }
    } else {
      toast.error("Please fill all inputs");
    }
  };

  useEffect(() => {
    if (token !== "") {
      toast.success("You already logged in");
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="login-center">
            <h2>Forgot Password!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Code" name="code" />
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  name="password"
                />
                {showPassword ? (
                  <FaEyeSlash
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                ) : (
                  <FaEye
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                )}
              </div>
              <div className="login-center-buttons">
                <button type="submit">Change Password</button>
              </div>
            </form>
          </div>
          <p className="login-bottom-p">
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangeForgotPassword;
