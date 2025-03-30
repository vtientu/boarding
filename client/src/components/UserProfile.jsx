import React, { useState, useEffect } from "react";
import axios from "axios";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import "../styles/UserProfile.css";
import {
	FaUser,
	FaPhone,
	FaMapMarkerAlt,
	FaBirthdayCake,
	FaVenusMars,
	FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserProfile = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		address: "",
		age: "",
		gender: "Nam",
	});
	const [loading, setLoading] = useState(true);

	// Cấu hình axios
	const api = axios.create({
		baseURL: "http://localhost:3000",
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Add a request interceptor
	api.interceptors.request.use(
		(config) => {
			const token = JSON.parse(localStorage.getItem("auth"));
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Fetch user profile
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await api.get("/tenants/profile");
				const userData = response.data;
				setFormData({
					name: userData.name || "",
					phone: userData.phone || "",
					address: userData.address || "",
					age: userData.age || "",
					gender: userData.gender || "Nam",
				});
			} catch (error) {
				console.error("Error fetching profile:", error);
				toast.error("Không thể tải thông tin cá nhân");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await api.patch("/tenants/profile", formData);
			toast.success("Cập nhật thông tin thành công");
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error(
				error.response?.data?.message ||
					"Có lỗi xảy ra khi cập nhật thông tin"
			);
		}
	};

	const handleChangePassword = () => {
		navigate("/tenant/change-password");
	};

	if (loading) {
		return (
			<div className="profile-container">
				<UserHeader />
				<div className="profile-content">
					<UserSidebar />
					<div className="profile-main">
						<div className="loading">Đang tải...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="profile-container">
			<UserHeader />
			<div className="profile-content">
				<UserSidebar />
				<div className="profile-main">
					<div className="profile-header">
						<h2>Thông tin cá nhân</h2>
						<div className="header-buttons">
							<button
								className="change-password-btn"
								onClick={handleChangePassword}
							>
								<FaLock /> Đổi mật khẩu
							</button>
							<button className="save-btn" onClick={handleSubmit}>
								<FaUser /> Lưu thay đổi
							</button>
						</div>
					</div>

					<form className="profile-form">
						<div className="form-grid">
							<div className="form-group">
								<label>
									<FaUser className="form-icon" /> Họ và tên
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Nhập họ và tên"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaPhone className="form-icon" /> Số điện thoại
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="Nhập số điện thoại"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaMapMarkerAlt className="form-icon" /> Địa chỉ
								</label>
								<input
									type="text"
									name="address"
									value={formData.address}
									onChange={handleChange}
									placeholder="Nhập địa chỉ"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaBirthdayCake className="form-icon" /> Tuổi
								</label>
								<input
									type="number"
									name="age"
									value={formData.age}
									onChange={handleChange}
									placeholder="Nhập tuổi"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaVenusMars className="form-icon" /> Giới tính
								</label>
								<select
									name="gender"
									value={formData.gender}
									onChange={handleChange}
								>
									<option value="Nam">Nam</option>
									<option value="Nữ">Nữ</option>
								</select>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
