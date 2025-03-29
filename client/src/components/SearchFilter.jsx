import React from "react";
import "../styles/SearchFilter.css";

const SearchFilter = ({
	searchTerm,
	setSearchTerm,
	filterStatus,
	setFilterStatus,
	searchPlaceholder = "Tìm kiếm...",
	filterOptions = [
		{ value: "", label: "Tất cả" },
		{ value: "active", label: "Đang hoạt động" },
		{ value: "inactive", label: "Không hoạt động" },
	],
}) => {
	return (
		<div className="search-filter-container">
			<div className="search-box">
				<h3>Tìm kiếm</h3>
				<input
					type="text"
					placeholder={searchPlaceholder}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="filter-box">
				<h3>Lọc</h3>
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
				>
					{filterOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default SearchFilter;
