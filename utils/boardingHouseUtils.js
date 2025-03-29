const Room = require("../models/Room");
const Bill = require("../models/Bill");

// Tính toán tổng thu nhập từ các hóa đơn đã thanh toán
const calculateTotalIncome = async (boardingHouseId) => {
    try {
        // Lấy tất cả phòng trong nhà trọ
        const rooms = await Room.find({ boarding_house_id: boardingHouseId });
        const roomIds = rooms.map(room => room._id);

        // Lấy tổng số tiền từ các hóa đơn đã thanh toán
        const bills = await Bill.find({
            room_id: { $in: roomIds },
            status: "Paid"
        });

        const totalIncome = bills.reduce((sum, bill) => {
            return sum + (bill.room_price + bill.electricity + bill.water + bill.additional_services);
        }, 0);

        return totalIncome;
    } catch (error) {
        console.error("Error calculating total income:", error);
        throw error;
    }
};

// Tính toán số phòng trống và đã thuê
const calculateRoomStats = async (boardingHouseId) => {
    try {
        const rooms = await Room.find({ boarding_house_id: boardingHouseId });
        const stats = rooms.reduce((acc, room) => {
            if (room.status === "Available") {
                acc.empty_rooms++;
            } else if (room.status === "Occupied") {
                acc.occupied_rooms++;
            }
            return acc;
        }, { empty_rooms: 0, occupied_rooms: 0 });

        return stats;
    } catch (error) {
        console.error("Error calculating room stats:", error);
        throw error;
    }
};

// Cập nhật tất cả thống kê của nhà trọ
const updateBoardingHouseStats = async (boardingHouseId) => {
    try {
        const [totalIncome, roomStats] = await Promise.all([
            calculateTotalIncome(boardingHouseId),
            calculateRoomStats(boardingHouseId)
        ]);

        return {
            total_income: totalIncome,
            empty_rooms: roomStats.empty_rooms,
            occupied_rooms: roomStats.occupied_rooms
        };
    } catch (error) {
        console.error("Error updating boarding house stats:", error);
        throw error;
    }
};

module.exports = {
    calculateTotalIncome,
    calculateRoomStats,
    updateBoardingHouseStats
}; 