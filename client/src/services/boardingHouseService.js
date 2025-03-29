import axios from "axios";

const API_URL = "http://localhost:3000/boardinghouses";

// Lấy danh sách nhà trọ với phân trang và lọc
export const getBoardingHouses = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Lấy chi tiết nhà trọ
export const getBoardingHouseDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Tạo nhà trọ mới
export const createBoardingHouse = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/create`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cập nhật nhà trọ
export const updateBoardingHouse = async (id, data) => {
  try {
    const response = await axios.patch(`${API_URL}/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Xóa nhà trọ
export const deleteBoardingHouse = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Tìm kiếm nhà trọ
export const searchBoardingHouses = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 