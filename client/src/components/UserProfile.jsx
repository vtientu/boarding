import React, { useState } from "react";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import "../styles/UserProfile.css";
import {
	FaUser,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaBirthdayCake,
	FaVenusMars,
	FaIdCard,
	FaUserFriends,
} from "react-icons/fa";

const UserProfile = () => {
	const [formData, setFormData] = useState({
		fullName: "Vương Huy",
		email: "huy@example.com",
		phone: "0123456789",
		address: "123 Đường ABC, Quận 1, TP.HCM",
		dateOfBirth: "2000-01-01",
		gender: "Nam",
		cccd: "123456789012",
		emergencyContact: "0987654321",
		emergencyName: "Nguyễn Văn A",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission here
		console.log("Form submitted:", formData);
	};

	return (
		<div className="profile-container">
			<UserHeader />
			<div className="profile-content">
				<UserSidebar />
				<div className="profile-main">
					<div className="profile-header">
						<h2>Thông tin cá nhân</h2>
						<button className="save-btn" onClick={handleSubmit}>
							<FaUser /> Lưu thay đổi
						</button>
					</div>

					<form className="profile-form">
						<div className="form-grid">
							<div className="form-group">
								<label>
									<FaUser className="form-icon" /> Họ và tên
								</label>
								<input
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									placeholder="Nhập họ và tên"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaEnvelope className="form-icon" /> Email
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="Nhập email"
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
									<FaBirthdayCake className="form-icon" /> Ngày sinh
								</label>
								<input
									type="date"
									name="dateOfBirth"
									value={formData.dateOfBirth}
									onChange={handleChange}
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

							<div className="form-group">
								<label>
									<FaIdCard className="form-icon" /> Số CCCD
								</label>
								<input
									type="text"
									name="cccd"
									value={formData.cccd}
									onChange={handleChange}
									placeholder="Nhập số CCCD"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaPhone className="form-icon" /> Số điện thoại người
									thân
								</label>
								<input
									type="tel"
									name="emergencyContact"
									value={formData.emergencyContact}
									onChange={handleChange}
									placeholder="Nhập số điện thoại người thân"
								/>
							</div>

							<div className="form-group">
								<label>
									<FaUserFriends className="form-icon" /> Tên người
									thân
								</label>
								<input
									type="text"
									name="emergencyName"
									value={formData.emergencyName}
									onChange={handleChange}
									placeholder="Nhập tên người thân"
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
