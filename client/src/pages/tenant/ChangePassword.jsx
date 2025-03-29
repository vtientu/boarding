import React, { useState } from "react";
import UserHeader from "../../components/UserHeader";
import UserSidebar from "../../components/UserSidebar";
import "../../styles/UserProfile.css";
import { FaLock, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ChangePassword = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const validateForm = () => {
		if (
			!formData.currentPassword ||
			!formData.newPassword ||
			!formData.confirmPassword
		) {
			toast.error("Vui lòng điền đầy đủ thông tin");
			return false;
		}

		if (formData.newPassword.length < 6) {
			toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
			return false;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
			return false;
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);
		try {
			const token = JSON.parse(localStorage.getItem("auth"));
			const response = await axios.post(
				"http://localhost:3000/users/change-password",
				{
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.msg) {
				toast.success("Đổi mật khẩu thành công!");
				setFormData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				// Chuyển hướng về trang profile sau 2 giây
				setTimeout(() => {
					navigate("/profile");
				}, 2000);
			}
		} catch (err) {
			const errorMessage =
				err.response?.data?.msg || "Có lỗi xảy ra khi đổi mật khẩu";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="profile-container">
			<UserHeader />
			<div className="profile-content">
				<UserSidebar />
				<div className="profile-main">
					<div className="profile-header">
						<h2>Đổi mật khẩu</h2>
						<button
							className="save-btn"
							onClick={handleSubmit}
							disabled={isLoading}
						>
							<FaCheck /> {isLoading ? "Đang xử lý..." : "Xác nhận"}
						</button>
					</div>

					<form className="profile-form" onSubmit={handleSubmit}>
						<div className="form-grid">
							<div className="form-group">
								<label>
									<FaLock className="form-icon" /> Mật khẩu hiện tại
								</label>
								<div className="password-input">
									<input
										type={showPasswords.current ? "text" : "password"}
										name="currentPassword"
										value={formData.currentPassword}
										onChange={handleChange}
										placeholder="Nhập mật khẩu hiện tại"
										disabled={isLoading}
									/>
									<button
										type="button"
										className="toggle-password"
										onClick={() =>
											togglePasswordVisibility("current")
										}
									>
										{showPasswords.current ? (
											<FaEyeSlash />
										) : (
											<FaEye />
										)}
									</button>
								</div>
							</div>

							<div className="form-group">
								<label>
									<FaLock className="form-icon" /> Mật khẩu mới
								</label>
								<div className="password-input">
									<input
										type={showPasswords.new ? "text" : "password"}
										name="newPassword"
										value={formData.newPassword}
										onChange={handleChange}
										placeholder="Nhập mật khẩu mới"
										disabled={isLoading}
									/>
									<button
										type="button"
										className="toggle-password"
										onClick={() => togglePasswordVisibility("new")}
									>
										{showPasswords.new ? <FaEyeSlash /> : <FaEye />}
									</button>
								</div>
							</div>

							<div className="form-group">
								<label>
									<FaLock className="form-icon" /> Xác nhận mật khẩu
									mới
								</label>
								<div className="password-input">
									<input
										type={showPasswords.confirm ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Xác nhận mật khẩu mới"
										disabled={isLoading}
									/>
									<button
										type="button"
										className="toggle-password"
										onClick={() =>
											togglePasswordVisibility("confirm")
										}
									>
										{showPasswords.confirm ? (
											<FaEyeSlash />
										) : (
											<FaEye />
										)}
									</button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChangePassword;
