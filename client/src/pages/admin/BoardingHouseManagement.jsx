import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SearchFilter from "../../components/SearchFilter";
import AddBoardingHouseModal from "../../components/AddBoardingHouseModal";
import EditBoardingHouseModal from "../../components/EditBoardingHouseModal";
import "../../styles/BoardingHouseManagement.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BoardingHouseManagement = () => {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedBoardingHouse, setSelectedBoardingHouse] = useState(null);
	const [boardingHouses, setBoardingHouses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	});

	const fetchBoardingHouses = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				"http://localhost:3000/boardinghouses/search",
				{
					params: {
						page: pagination.page,
						limit: pagination.limit,
						keyword: searchTerm,
					},
				}
			);

			if (response.data.data) {
				setBoardingHouses(response.data.data);
			}

			if (response.data.pagination) {
				setPagination({
					page: response.data.pagination.page || 1,
					limit: response.data.pagination.limit || 10,
					total: response.data.pagination.total || 0,
					pages: response.data.pagination.pages || 1,
				});
			}
		} catch (err) {
			setError(err.response?.data?.msg || "Có lỗi xảy ra khi tải dữ liệu");
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
		fetchBoardingHouses();
	}, [pagination.page, searchTerm]);

	const handleAddBoardingHouse = async (boardingHouseData) => {
		try {
			const token = JSON.parse(localStorage.getItem("auth"));
			if (!token) {
				setError("Vui lòng đăng nhập để thực hiện thao tác này");
				return;
			}

			await axios.post(
				"http://localhost:3000/boardinghouses/create",
				boardingHouseData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			fetchBoardingHouses();
			setIsModalOpen(false);
		} catch (err) {
			setError(err.response?.data?.msg || "Có lỗi xảy ra khi thêm nhà trọ");
		}
	};

	const handleEditBoardingHouse = (boardingHouse) => {
		setSelectedBoardingHouse(boardingHouse);
		setIsEditModalOpen(true);
	};

	const handleUpdateBoardingHouse = async (updatedData) => {
		try {
			const token = JSON.parse(localStorage.getItem("auth"));
			if (!token) {
				setError("Vui lòng đăng nhập để thực hiện thao tác này");
				return;
			}

			await axios.patch(
				`http://localhost:3000/boardinghouses/update/${selectedBoardingHouse._id}`,
				updatedData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			fetchBoardingHouses();
			setIsEditModalOpen(false);
			setSelectedBoardingHouse(null);
		} catch (err) {
			setError(
				err.response?.data?.msg || "Có lỗi xảy ra khi cập nhật nhà trọ"
			);
		}
	};

	const handleDeleteBoardingHouse = async (boardingHouseId) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa nhà trọ này?")) {
			try {
				const token = JSON.parse(localStorage.getItem("auth"));
				if (!token) {
					setError("Vui lòng đăng nhập để thực hiện thao tác này");
					return;
				}

				await axios.delete(
					`http://localhost:3000/boardinghouses/${boardingHouseId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				fetchBoardingHouses();
			} catch (err) {
				setError(
					err.response?.data?.msg || "Có lỗi xảy ra khi xóa nhà trọ"
				);
			}
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<div className="dashboard-container">
			<Header />
			<div className="dashboard-content">
				<Sidebar />
				<main className="main-content">
					<div className="boarding-house-management">
						<div className="boarding-house-header">
							<h2>Quản Lý Nhà Trọ</h2>
							<button
								className="add-boarding-house-btn"
								onClick={() => setIsModalOpen(true)}
							>
								+ Thêm nhà trọ mới
							</button>
						</div>

						<AddBoardingHouseModal
							isOpen={isModalOpen}
							onClose={() => setIsModalOpen(false)}
							onSubmit={handleAddBoardingHouse}
						/>

						<SearchFilter
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							searchPlaceholder="Tìm kiếm theo tên nhà trọ..."
						/>

						{error && <div className="error-message">{error}</div>}

						<div className="boarding-houses-table">
							{loading ? (
								<div className="loading">Đang tải...</div>
							) : (
								<div className="boarding-houses-table-container">
									<table>
										<thead>
											<tr>
												<th>Địa chỉ</th>
												<th>Tổng số phòng</th>
												<th>Phòng trống</th>
												<th>Phòng đã thuê</th>
												<th>Tổng thu nhập</th>
												<th>Thao tác</th>
											</tr>
										</thead>
										<tbody>
											{boardingHouses.map((house) => (
												<tr key={house._id}>
													<td>{house.location}</td>
													<td>{house.total_rooms}</td>
													<td>{house.empty_rooms}</td>
													<td>{house.occupied_rooms}</td>
													<td>
														{formatCurrency(house.total_income)}
													</td>
													<td>
														<div className="action-buttons">
															<button
																className="view-btn"
																onClick={() =>
																	navigate(
																		`/boardinghouses/${house._id}`
																	)
																}
															>
																Chi tiết
															</button>
															<button
																className="edit-btn"
																onClick={() =>
																	handleEditBoardingHouse(
																		house
																	)
																}
															>
																Sửa
															</button>
															<button
																className="delete-btn"
																onClick={() =>
																	handleDeleteBoardingHouse(
																		house._id
																	)
																}
															>
																Xóa
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>

						{!loading && pagination.pages > 1 && (
							<div className="pagination">
								<button
									onClick={() =>
										setPagination((prev) => ({
											...prev,
											page: Math.max(1, prev.page - 1),
										}))
									}
									disabled={pagination.page === 1}
								>
									Trước
								</button>
								<span>
									Trang {pagination.page} / {pagination.pages}
								</span>
								<button
									onClick={() =>
										setPagination((prev) => ({
											...prev,
											page: Math.min(
												pagination.pages,
												prev.page + 1
											),
										}))
									}
									disabled={pagination.page === pagination.pages}
								>
									Sau
								</button>
							</div>
						)}
					</div>
				</main>
			</div>

			<EditBoardingHouseModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedBoardingHouse(null);
				}}
				onSubmit={handleUpdateBoardingHouse}
				boardingHouse={selectedBoardingHouse}
			/>
		</div>
	);
};

export default BoardingHouseManagement;
