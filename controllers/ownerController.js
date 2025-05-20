const Room = require("../models/Room");
const User = require("../models/User");
const BoardingHouse = require("../models/BoardingHouse");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const Contract = require("../models/Contract");
const { isValidObjectId } = require("mongoose");
const Role = require("../models/Role");
const { sendNotificationEmail } = require("../utils/emailService");

exports.getDashboard = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();

    const totalRoomsOccupied = await Room.countDocuments({
      status: "Occupied",
    });

    const totalRevenue = await Payment.aggregate([
      { $match: { payment_status: "Completed" } },
      { $group: { _id: "$user_id", total: { $sum: "$total_amount" } } },
    ]);

    const role = await Role.findOne({
      role_name: "Tenant",
    });

    const totalTenants = await User.countDocuments({
      role_id: role._id,
      status: "active",
    });

    res.status(200).json({
      totalRooms: totalRooms || 0,
      totalRoomsOccupied: totalRoomsOccupied || 0,
      totalRevenue: totalRevenue?.[0]?.total || 0,
      totalTenants: totalTenants || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.manageRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ landlord_id: req.user.id })
      .populate("tenant_id")
      .populate("boarding_house_id");

    const roomStats = {
      total: rooms.length,
      available: rooms.filter((room) => room.status === "Available").length,
      occupied: rooms.filter((room) => room.status === "Occupied").length,
    };

    res.json({ rooms, roomStats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.manageTenants = async (req, res) => {
  try {
    const { action } = req.query;

    switch (action) {
      case "assignToRoom":
        return await assignTenantToRoom(req, res);
      case "removeFromRoom":
        return await removeTenantFromRoom(req, res);
      default:
        const tenants = await User.find({
          role_id: await Role.findOne({ role_name: "Tenant", status: "active" })
            ._id,
        }).select("-password");
        return res.json(tenants);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function assignTenantToRoom(req, res) {
  const { tenant_id, room_id } = req.body;

  // Verify tenant exists
  const tenant = await User.findById(tenant_id);
  if (!tenant) {
    return res.status(404).json({ message: "Tenant not found" });
  }

  // Update room with tenant
  const updatedRoom = await Room.findByIdAndUpdate(
    room_id,
    {
      tenant_id: tenant_id,
      status: "Occupied",
    },
    { new: true }
  );

  res.json(updatedRoom);
}

async function removeTenantFromRoom(req, res) {
  const { room_id } = req.body;

  // Update room to available
  const updatedRoom = await Room.findByIdAndUpdate(
    room_id,
    {
      tenant_id: null,
      status: "Available",
    },
    { new: true }
  );

  res.json(updatedRoom);
}

exports.createBill = async (req, res) => {
  try {
    const {
      room_id,
      tenant_id,
      room_price,
      electricity,
      water,
      additional_services,
      payment_deadline,
      details,
      image,
    } = req.body;

    // Lấy tháng và năm hiện tại
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Kiểm tra xem đã có hóa đơn nào trong tháng này chưa theo createdAt
    const existingBill = await Bill.findOne({
      room_id,
      createdAt: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      },
    });

    if (existingBill) {
      return res.status(400).json({
        message: "Đã tồn tại hóa đơn cho phòng này trong tháng này",
      });
    }

    const bill = await Bill.create({
      room_id,
      tenant_id,
      room_price,
      electricity,
      water,
      additional_services,
      payment_deadline: new Date(payment_deadline),
      details,
      image,
    });

    const room = await Room.findById(room_id, {
      room_type: 1,
      room_number: 1,
      _id: 1,
    });

    const tenant = await User.findById(tenant_id, {
      name: 1,
      phone: 1,
      email: 1,
    });

    bill.tenant_id = tenant;
    bill.room_id = room;

    res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }
    const {
      room_price,
      electricity,
      water,
      additional_services,
      payment_deadline,
      details,
      image,
    } = req.body;

    const bill = await Bill.findByIdAndUpdate(
      id,
      {
        room_price,
        electricity,
        water,
        additional_services,
        payment_deadline: new Date(payment_deadline),
        details,
        image,
      },
      { new: true }
    );

    res.status(200).json({ message: "Bill updated successfully", bill });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { bill_ids, notification_content } = req.body;
    if (!bill_ids || bill_ids.length === 0) {
      const isValid = bill_ids.every((id) => isValidObjectId(id));
      if (!isValid) {
        return res.status(400).json({ message: "Invalid tenant IDs" });
      }
      return res.status(400).json({ message: "Tenant IDs are required" });
    }

    const bills = await Bill.find({
      _id: { $in: bill_ids },
    })
      .populate("tenant_id", "_id name email")
      .populate("room_id", "_id room_number room_type");

    bills.forEach(async (bill) => {
      if (bill.tenant_id?.email) {
        await sendNotificationEmail(
          bill.tenant_id.email,
          notification_content,
          bill
        );
      }
    });

    res.status(200).json({ message: "Notification sent successfully", bills });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getBills = async (req, res) => {
  try {
    const { status, search, fromDate, toDate } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    }

    if (toDate) {
      query.createdAt = { $lte: new Date(toDate) };
    }

    // const { page = 1, limit = 10 } = req.query;

    // const skip = (page - 1) * limit;
    let bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .populate("room_id", "_id room_number room_type")
      .populate("tenant_id", "_id name phone address");

    if (search) {
      bills = bills.filter(
        (bill) =>
          bill.tenant_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
          bill.room_id?.room_number
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    const totalIncome = bills.reduce(
      (acc, bill) =>
        acc +
        bill.room_price +
        bill.electricity +
        bill.water +
        bill.additional_services,
      0
    );

    const totalBills = await Bill.countDocuments({
      room_id: {
        $in: await Room.find({ landlord_id: req.user.id }).select("_id"),
      },
    });

    return res.status(200).json({
      data: bills,
      totalData: totalBills,
      totalIncome: totalIncome,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getRevenueStatisticsForYear = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    if (isNaN(year)) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const bills = await Bill.find({
      status: "Paid",
      updatedAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    // Mảng dạng [{month:1 , revenue: 1000000}]

    const revenuePerMonth = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const revenue = bills
        .filter((bill) => bill.updatedAt.getMonth() + 1 === month)
        .reduce(
          (acc, bill) =>
            acc +
            (bill?.room_price +
              bill?.electricity +
              bill?.water +
              bill?.additional_services),
          0
        );
      return { month, revenue };
    });

    const totalIncome = bills.reduce(
      (acc, bill) =>
        acc +
        (bill?.room_price +
          bill?.electricity +
          bill?.water +
          bill?.additional_services),
      0
    );

    res.status(200).json({ data: revenuePerMonth, totalIncome });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.generateReports = async (req, res) => {
  try {
    const boardingHouse = await BoardingHouse.findOne({
      landlord_id: req.user.id,
    });

    const totalIncome = await Payment.aggregate([
      {
        $match: {
          user_id: {
            $in: await User.find({
              role_id: await Role.findOne({ role_name: "Tenant" })._id,
            }).select("_id"),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$total_amount" } } },
    ]);

    const roomStats = await Room.aggregate([
      { $match: { landlord_id: req.user.id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalIncome: totalIncome[0]?.total || 0,
      roomStats,
      boardingHouse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra userId có hợp lệ không
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ msg: "ID người dùng không hợp lệ" });
    }

    // Tìm user cần xóa
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    // Kiểm tra xem user có phải là chủ trọ không
    const userRole = await Role.findById(userToDelete.role_id);
    if (userRole?.role_name === "Owner") {
      return res.status(403).json({
        msg: "Không thể xóa tài khoản chủ trọ",
      });
    }

    // Kiểm tra xem user có đang thuê phòng không
    const activeContract = await Contract.findOne({
      tenant_id: userId,
      status: "active",
    });

    if (activeContract) {
      return res.status(400).json({
        msg: "Không thể xóa người dùng đang có hợp đồng thuê phòng",
      });
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      msg: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      msg: "Lỗi server khi xóa người dùng",
      error: error.message,
    });
  }
};
