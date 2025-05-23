const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../utils/emailService");
const { isValidObjectId } = require("mongoose");
const Contract = require("../models/Contract");
const Room = require("../models/Room");
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  let foundUser = await User.findOne({ email: req.body.email }).populate(
    "role_id",
    "_id role_name"
  );
  if (foundUser) {
    const isMatch = await foundUser.comparePassword(password);
    const isActive = foundUser.status === "active";
    if (!isActive) {
      return res.status(401).json({ message: "Account is not active" });
    }

    if (isMatch) {
      const token = jwt.sign(
        { id: foundUser._id, name: foundUser.name },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      // Loại bỏ password
      const { password: _, ...userWithoutPassword } = foundUser.toObject();

      return res
        .status(200)
        .json({ user: userWithoutPassword, msg: "user logged in", token });
    } else {
      return res.status(400).json({ msg: "Bad password" });
    }
  } else {
    return res.status(400).json({ msg: "Email or password is incorrect" });
  }
};

// Đăng ký làm chủ trọ (Owner)
const registerOwner = async (req, res) => {
  try {
    // Kiểm tra email và username đã tồn tại chưa
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const usernameExists = await User.findOne({
      username: req.body.username,
    });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // Tìm role Owner
    let ownerRole = await Role.findOne({ role_name: "Owner" });

    // Nếu không tìm thấy role Owner, tạo mới
    if (!ownerRole) {
      ownerRole = await Role.create({
        role_name: "Owner",
        permissions: {
          view_rooms: true,
          manage_rooms: true,
          manage_tenants: true,
          manage_bills: true,
          generate_reports: true,
        },
      });
    }

    // Lấy dữ liệu từ request
    const {
      name,
      username,
      email,
      password,
      phone,
      address,
      age,
      gender = "Other",
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        msg: "Please provide name, username, email, and password",
      });
    }

    // Tạo người dùng mới với role Owner
    const newUser = new User({
      name,
      username,
      email,
      password,
      phone,
      address,
      gender,
      age,
      role_id: ownerRole._id,
    });

    // Lưu người dùng
    await newUser.save();

    // Tạo token
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Gửi email chào mừng
    // await sendWelcomeEmail(newUser.email, newUser.name, "Owner");

    // Trả về response
    return res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: "Owner",
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      msg: "Server error during registration",
      error: error.message,
    });
  }
};

// Đăng ký làm người thuê trọ (Tenant)
const registerTenant = async (req, res) => {
  try {
    // Kiểm tra email và username đã tồn tại chưa
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const usernameExists = await User.findOne({
      username: req.body.username,
    });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // Tìm role Tenant
    let tenantRole = await Role.findOne({ role_name: "Tenant" });

    // Nếu không tìm thấy role Tenant, tạo mới
    if (!tenantRole) {
      tenantRole = await Role.create({
        role_name: "Tenant",
        permissions: {
          view_rooms: true,
        },
      });
    }

    // Lấy dữ liệu từ request
    const {
      name,
      username,
      email,
      password,
      phone,
      address,
      age,
      gender = "Other",
      room_id,
      start_date,
      rental_period,
      deposit,
      description,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        msg: "Please provide name, username, email, password",
      });
    }

    // Tạo người dùng mới với role Tenant
    const newUser = new User({
      name,
      username,
      email,
      password,
      phone,
      address,
      age,
      gender,
      role_id: tenantRole._id,
    });

    // Lưu người dùng
    await newUser.save();
    console.log(room_id, start_date, rental_period, deposit);
    if (room_id && start_date && rental_period && deposit) {
      console.log(room_id, start_date, rental_period, deposit);
      // Tạo contract
      const end_date = new Date(start_date);
      const room = await Room.findById(room_id);
      end_date.setMonth(end_date.getMonth() + rental_period);
      const contract = await Contract.create({
        room_id,
        user_id: newUser._id,
        start_date,
        end_date,
        rental_price: room.month_rent,
        deposit,
        description,
        end_date,
        rental_period,
      });
      await Room.findByIdAndUpdate(room_id, {
        tenant_id: newUser._id,
        status: "Occupied",
      });
    } else {
      return res.status(400).json({
        msg: "Please provide room_id, user_id, start_date, rental_period, rental_price, deposit",
      });
    }

    // Tạo contract
    // const newContract = new Contract({
    //   user_id: newUser._id,
    //   start_date: new Date(),
    //   end_date: new Date(),
    // });

    // Tạo token
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Trả về response
    return res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: "Tenant",
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      msg: "Server error during registration",
      error: error.message,
    });
  }
};

const updateUserManager = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, age, gender } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!name || !phone || !address) {
    return res.status(400).json({
      msg: "Please provide name, phone, address, age, gender",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.phone = phone;
    user.address = address;
    user.age = age;
    user.gender = gender;

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error in updateUser:", error);
  }
};

// Đổi mật khẩu (yêu cầu đăng nhập)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware

    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        msg: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });
    }

    // Xác minh mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Mật khẩu hiện tại không đúng" });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save(); // Middleware pre-save sẽ hash mật khẩu

    return res.status(200).json({ msg: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      msg: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};

// Quên mật khẩu - Yêu cầu reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Vui lòng cung cấp email" });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });

    if (user.status === "inactive") {
      return res.status(401).json({ message: "Account is not active" });
    }

    if (!user) {
      // Trả về 200 thay vì 404 vì lý do bảo mật (không tiết lộ email tồn tại hay không)
      return res.status(400).json({
        msg: "Email chưa được đăng ký",
      });
    }

    // Tạo code reset password
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Lưu token đã hash vào DB (không lưu token gốc vì lý do bảo mật)
    user.resetPasswordCode = resetCode;

    // Token hết hạn sau 10 phút
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Tạo URL reset

    // 	// Nội dung email
    // 	const message = `
    //   Bạn đã yêu cầu đặt lại mật khẩu.
    //   Vui lòng truy cập đường dẫn sau để đặt lại mật khẩu của bạn: ${resetURL}
    //   Đường dẫn này sẽ hết hạn sau 10 phút.
    //   Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
    // `;

    // // Sử dụng service để gửi email
    await sendPasswordResetEmail(user.email, user.name, resetCode);

    res.status(200).json({
      msg: "Email đặt lại mật khẩu đã được gửi",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      msg: "Lỗi server khi xử lý yêu cầu quên mật khẩu",
      error: error.message,
    });
  }
};

// Đặt lại mật khẩu sau khi nhận được token
const resetPassword = async (req, res) => {
  try {
    // Lấy token từ params và mật khẩu mới từ body
    const { code, password } = req.body;

    if (!code || !password) {
      return res.status(400).json({
        msg: "Vui lòng cung cấp mã xác thực và mật khẩu mới",
      });
    }

    // Tìm người dùng có token còn hạn
    const user = await User.findOne({
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    }).populate("role_id", "_id role_name");

    if (!user) {
      return res.status(400).json({
        msg: "Mã xác thực không hợp lệ hoặc đã hết hạn",
      });
    }

    // Kiểm tra độ dài mật khẩu mới
    if (password.length < 6) {
      return res.status(400).json({
        msg: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Cập nhật mật khẩu mới
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // Middleware pre-save sẽ hash mật khẩu

    // Tạo JWT mới để người dùng có thể đăng nhập ngay
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Chuyển đối tượng Mongoose thành plain JavaScript object
    const userObj = user.toObject();
    // Loại bỏ password
    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      msg: "Đặt lại mật khẩu thành công",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      msg: "Lỗi server khi đặt lại mật khẩu",
      error: error.message,
    });
  }
};

const getUserList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      status,
      gender,
      age,
      phone,
      address,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * limit;

    // Xây dựng query
    const query = {};

    // Lọc theo role
    if (role) {
      const roleDoc = await Role.findOne({ role_name: role });

      if (roleDoc) {
        query.role_id = roleDoc._id;
      }
    }

    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }

    // Lọc theo giới tính
    if (gender) {
      query.gender = gender;
    }

    // Lọc theo tuổi
    if (age) {
      query.age = parseInt(age);
    }

    // Lọc theo số điện thoại
    if (phone) {
      query.phone = { $regex: phone, $options: "i" };
    }

    // Lọc theo địa chỉ
    if (address) {
      query.address = { $regex: address, $options: "i" };
    }

    // Tìm kiếm theo nhiều trường
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Xây dựng options cho sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Thực hiện query với populate và sort
    const users = await User.find(query)
      .select("-password")
      .populate("role_id", "role_name permissions")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số kết quả
    const total = await User.countDocuments(query);

    // Tính toán phân trang
    const pagination = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    };

    // Trả về kết quả
    res.status(200).json({
      users,
      pagination,
      filters: {
        role,
        status,
        gender,
        age,
        phone,
        address,
        search,
      },
      sort: {
        by: sortBy,
        order: sortOrder,
      },
    });
  } catch (error) {
    console.error("Error in getUserList:", error);
    res.status(500).json({
      msg: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const getTenantCombo = async (req, res) => {
  try {
    const tenantRole = await Role.findOne({ role_name: "Tenant" });
    if (!tenantRole) {
      return res.status(404).json({ msg: "Không tìm thấy role Tenant" });
    }

    const userRentedContracts = await Contract.find(
      { status: "Active" },
      "user_id"
    );
    const userRentedIds = userRentedContracts.map((contract) =>
      contract.user_id.toString()
    );

    const availableTenants = await User.find({
      role_id: tenantRole._id,
      status: "active",
      _id: { $nin: userRentedIds },
    });

    res.status(200).json({ users: availableTenants });
  } catch (error) {
    console.error("Error in getUserCombo:", error);
    res.status(500).json({
      msg: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // const userRole = await Role.findById(user.role_id);
  // if (!userRole || userRole.role_name !== "Owner") {
  // 	return res.status(403).json({
  // 		msg: "Permission denied. Only owners can access this resource",
  // 	});
  // }

  res.status(200).json({ message: "User fetched successfully", user });
};

const activeUser = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = "active";
  await user.save();

  res.status(200).json({ message: "User status updated successfully" });
};

const inactiveUser = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = "inactive";
  await user.save();

  res.status(200).json({ message: "User status updated successfully" });
};

const updateUser = async (req, res) => {
  const userId = req.user.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const { name, phone, address, age, gender } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;
  user.phone = phone;
  user.address = address;
  user.age = age;
  user.gender = gender;

  await user.save();

  res.status(200).json({ message: "User updated successfully" });
};

module.exports = {
  login,
  registerOwner,
  registerTenant,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserById,
  getUserList,
  activeUser,
  inactiveUser,
  getTenantCombo,
  updateUser,
  updateUserManager,
};
