const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Role = require("../models/Role");
const User = require("../models/User");
const BoardingHouse = require("../models/BoardingHouse");
const Room = require("../models/Room");
const Contract = require("../models/Contract");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");

const seedDatabase = async () => {
  try {
    // Kết nối database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://admin:abcd1234@boardinghousedb.sumkzje.mongodb.net/?retryWrites=true&w=majority&appName=BoardingHouseDB"
    );

    // Xóa dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    await BoardingHouse.deleteMany({});
    await Room.deleteMany({});
    await Contract.deleteMany({});
    await Bill.deleteMany({});
    await Payment.deleteMany({});

    // Tạo Roles
    const roles = await Role.create([
      {
        role_name: "Owner",
        permissions: {
          view_rooms: true,
          manage_rooms: true,
          manage_tenants: true,
          manage_bills: true,
          generate_reports: true,
        },
      },
      {
        role_name: "Tenant",
        permissions: {
          view_rooms: true,
        },
      },
    ]);

    // Tạo Owner
    const owner = await User.create({
      username: "chutro",
      email: "chutro@gmail.com",
      password: "123456",
      name: "DANG GIA NGUYEN",
      phone: "0585826179",
      address: "Hà Nội",
      role_id: roles[0]._id,
      age: 35,
      gender: "Male",
      status: "active",
    });

    // Tạo Boarding House
    const boardingHouse = await BoardingHouse.create({
      total_income: 0,
      empty_rooms: 5,
      occupied_rooms: 0,
      status: "Active",
      location: "Quận 1, TP.HCM",
    });

    // Tạo Rooms
    const rooms = await Room.create([
      {
        room_number: "P101",
        room_type: "Standard",
        status: "Available",
        capacity: 2,
        month_rent: 3000000,
        description: "Phòng tiêu chuẩn, view đẹp",
        address: "Quận 1, TP.HCM",
        landlord_id: owner._id,
        tenant_id: null,
        boarding_house_id: boardingHouse._id,
      },
      {
        room_number: "P102",
        room_type: "Deluxe",
        status: "Available",
        capacity: 3,
        month_rent: 4500000,
        description: "Phòng cao cấp, thoáng mát",
        address: "Quận 1, TP.HCM",
        landlord_id: owner._id,
        tenant_id: null,
        boarding_house_id: boardingHouse._id,
      },
    ]);

    // Tạo Tenant
    const tenant = await User.create({
      username: "nguoithue",
      email: "nguoithue@gmail.com",
      password: "123456",
      name: "DANG GIA NGUYEN",
      phone: "0585826179",
      address: "Hà Nội",
      role_id: roles[1]._id,
      age: 28,
      gender: "Male",
      status: "active",
    });

    // Tạo Contract
    const contract = await Contract.create({
      user_id: tenant._id,
      room_id: rooms[0]._id,
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      rental_price: rooms[0].month_rent,
      status: "Active",
      description: "Hợp đồng thuê phòng P101",
      rental_period: 12,
    });

    await Room.findByIdAndUpdate(rooms[0]._id, {
      tenant_id: tenant._id,
      status: "Occupied",
    });

    // Tạo Bill
    const bill = await Bill.create({
      room_id: rooms[0]._id,
      tenant_id: tenant._id,
      room_price: rooms[0].month_rent,
      electricity: 500000,
      water: 200000,
      additional_services: 100000,
      payment_deadline: new Date(new Date().setDate(new Date().getDate() + 10)),
      details: {
        electricity_index_start: 100,
        electricity_index_end: 150,
        water_index_start: 50,
        water_index_end: 70,
      },
      status: "Paid",
    });

    // Tạo Payment
    await Payment.create({
      bill_id: bill._id,
      user_id: tenant._id,
      contract_id: contract._id,
      payment_date: new Date(),
      payment_method: "Bank Transfer",
      total_amount:
        bill.room_price +
        bill.electricity +
        bill.water +
        bill.additional_services,
      payment_status: "Completed",
      transaction_code: "TR" + Math.random().toString(36).substr(2, 9),
    });

    console.log("Seeding completed successfully!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.connection.close();
  }
};

module.exports = { seedDatabase };
