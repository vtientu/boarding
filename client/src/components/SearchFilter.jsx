import { useState, useCallback } from "react";
import "../styles/SearchFilter.css";

const SearchFilter = ({
  hasFilterStatus = true,
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
  const [valueInput, setValueInput] = useState(searchTerm);

  // Định nghĩa debounce một lần duy nhất
  const debounce = useCallback((func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Tạo debounce function chỉ một lần
  const debouncedSetSearchTerm = useCallback(debounce(setSearchTerm, 500), []);

  const handleChangeSearch = (e) => {
    setValueInput(e.target.value);
    debouncedSetSearchTerm(e.target.value);
  };

  return (
    <div className="search-filter-container">
      <div className="search-box">
        <h3>Tìm kiếm</h3>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={valueInput}
          onChange={handleChangeSearch}
        />
      </div>

      {hasFilterStatus && (
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
      )}
    </div>
  );
};

export default SearchFilter;
