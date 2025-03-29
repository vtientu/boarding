import React, { useState } from "react";
import "./RoomBookingForm.css";

interface RoomFormData {
	roomNumber: string;
	roomType: string;
	price: number;
	area: number;
	address: string;
	description: string;
	facilities: string[];
	images: File[];
	status: "available" | "booked";
}

const RoomBookingForm: React.FC = () => {
	const [formData, setFormData] = useState<RoomFormData>({
		roomNumber: "",
		roomType: "",
		price: 0,
		area: 0,
		address: "",
		description: "",
		facilities: [],
		images: [],
		status: "available",
	});

	const [previewImages, setPreviewImages] = useState<string[]>([]);

	// Danh sách các tiện ích có sẵn
	const availableFacilities = [
		"Điều hòa",
		"Nóng lạnh",
		"Tủ lạnh",
		"Máy giặt",
		"Wifi",
		"Bảo vệ",
		"Chỗ để xe",
		"Nhà bếp",
	];

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFacilityChange = (facility: string) => {
		setFormData((prev) => ({
			...prev,
			facilities: prev.facilities.includes(facility)
				? prev.facilities.filter((f) => f !== facility)
				: [...prev.facilities, facility],
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setFormData((prev) => ({
			...prev,
			images: [...prev.images, ...files],
		}));

		// Tạo preview cho ảnh
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImages((prev) => [...prev, reader.result as string]);
			};
			reader.readAsDataURL(file);
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Tạo FormData để gửi lên server
			const submitData = new FormData();
			Object.entries(formData).forEach(([key, value]) => {
				if (key === "images") {
					formData.images.forEach((image, index) => {
						submitData.append(`image${index}`, image);
					});
				} else if (key === "facilities") {
					submitData.append(key, JSON.stringify(value));
				} else {
					submitData.append(key, value.toString());
				}
			});

			// Ở đây sẽ là nơi call API
			// await addNewRoom(submitData);

			// Reset form sau khi thành công
			setFormData({
				roomNumber: "",
				roomType: "",
				price: 0,
				area: 0,
				address: "",
				description: "",
				facilities: [],
				images: [],
				status: "available",
			});
			setPreviewImages([]);

			alert("Thêm phòng thành công!");
		} catch (error) {
			console.error("Lỗi khi thêm phòng:", error);
			alert("Có lỗi xảy ra khi thêm phòng!");
		}
	};

	return (
		<div className="room-booking-form">
			<h2>Thêm Phòng Trọ Mới</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="roomNumber">Số phòng:</label>
					<input
						type="text"
						id="roomNumber"
						name="roomNumber"
						value={formData.roomNumber}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="roomType">Loại phòng:</label>
					<select
						id="roomType"
						name="roomType"
						value={formData.roomType}
						onChange={handleInputChange}
						required
					>
						<option value="">Chọn loại phòng</option>
						<option value="single">Phòng đơn</option>
						<option value="double">Phòng đôi</option>
						<option value="family">Phòng gia đình</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="price">Giá thuê (VNĐ/tháng):</label>
					<input
						type="number"
						id="price"
						name="price"
						value={formData.price}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="area">Diện tích (m²):</label>
					<input
						type="number"
						id="area"
						name="area"
						value={formData.area}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="address">Địa chỉ:</label>
					<input
						type="text"
						id="address"
						name="address"
						value={formData.address}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="description">Mô tả:</label>
					<textarea
						id="description"
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						rows={4}
					/>
				</div>

				<div className="form-group">
					<label>Tiện ích:</label>
					<div className="facilities-grid">
						{availableFacilities.map((facility) => (
							<label key={facility} className="facility-item">
								<input
									type="checkbox"
									checked={formData.facilities.includes(facility)}
									onChange={() => handleFacilityChange(facility)}
								/>
								{facility}
							</label>
						))}
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="images">Hình ảnh phòng:</label>
					<input
						type="file"
						id="images"
						multiple
						accept="image/*"
						onChange={handleImageUpload}
					/>
					<div className="image-preview">
						{previewImages.map((preview, index) => (
							<img
								key={index}
								src={preview}
								alt={`Preview ${index + 1}`}
								className="preview-image"
							/>
						))}
					</div>
				</div>

				<button type="submit" className="submit-button">
					Thêm Phòng
				</button>
			</form>
		</div>
	);
};

export default RoomBookingForm;
