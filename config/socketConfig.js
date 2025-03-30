const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const mongoose = require("mongoose");

// Lưu trữ người dùng đang kết nối
const connectedUsers = new Map();

function initializeSocket(server) {
	const io = socketIO(server, {
		cors: {
			origin: "*", // Hoặc cấu hình domain cụ thể của bạn
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	// Middleware xác thực JWT
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token;
			if (!token) {
				return next(new Error("Authentication error: Token missing"));
			}

			// Xác thực token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Tìm user
			const user = await User.findById(decoded.id).populate("role_id");
			if (!user) {
				return next(new Error("Authentication error: User not found"));
			}

			// Lưu thông tin user vào socket
			socket.user = {
				id: user._id.toString(),
				name: user.name,
				role: user.role_id.role_name,
			};

			next();
		} catch (error) {
			console.error("Socket authentication error:", error);
			next(new Error("Authentication error: Invalid token"));
		}
	});

	// Xử lý kết nối
	io.on("connection", (socket) => {
		console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

		// Lưu socket vào danh sách người dùng kết nối
		connectedUsers.set(socket.user.id, socket);

		// Thông báo trạng thái online
		io.emit("user_status", {
			user_id: socket.user.id,
			status: "online",
			timestamp: new Date(),
		});

		// Xử lý khi client yêu cầu danh sách người dùng online
		socket.on("get_online_users", (callback) => {
			try {
				// Lấy danh sách người dùng từ Map
				const onlineUsers = Array.from(connectedUsers.values()).map(socket => (socket.user)).filter(user => user.id?.toString() !== socket.user.id);

				// Gửi danh sách người dùng online về client
				callback({ status: "success", data: onlineUsers });
			} catch (error) {
				console.error("Get online users error:", error);
				callback({ status: "error", message: error.message });
			}
		});


		// Tạo hoặc tham gia phòng chat
		socket.on("join_room", async (receiverId) => {
			console.log(`Rooms after joining: ${Array.from(socket.rooms)}`);
			// Tạo chat_room_id từ ID của hai người dùng (đảm bảo ID luôn theo thứ tự để tạo phòng duy nhất)
			const participants = [socket.user.id, receiverId].sort();
			const roomId = `chat_${participants[0]}_${participants[1]}`;

			// Tham gia phòng chat
			socket.join(roomId);
			console.log(`${socket.user.name} joined room: ${roomId}`);

			// Đánh dấu tất cả tin nhắn là đã đọc khi người nhận tham gia phòng
			await ChatMessage.updateMany(
				{
					chat_room_id: roomId,
					receiver_id: (socket.user.id),
					is_read: false,
				},
				{ is_read: true },
			);

			// Thông báo cho người dùng rằng tin nhắn đã được đọc
			socket.to(roomId).emit("messages_read", { room_id: roomId });
		});

		// Xử lý gửi tin nhắn
		socket.on("send_message", async (data, callback) => {
			try {
				const { receiver_id, message_content, message_type = "Text" } = data;

				// Tạo chat_room_id
				const participants = [socket.user.id, receiver_id].sort();
				const chat_room_id = `chat_${participants[0]}_${participants[1]}`;

				// Tạo tin nhắn mới
				const newMessage = new ChatMessage({
					sender_id: socket.user.id,
					receiver_id,
					chat_room_id,
					message_content,
					message_type,
					is_read: false,
				});

				// Lưu tin nhắn vào database
				await newMessage.save();

				// Populate thông tin người gửi
				const populatedMessage = await ChatMessage.findById(newMessage._id)
					.populate("sender_id", "name username")
					.populate("receiver_id", "name username");

				// Gửi tin nhắn đến phòng chat, ngoại trừ người gửi
				socket.broadcast.to(chat_room_id).emit("receive_message", populatedMessage);

				// Kiểm tra xem người nhận có online không
				const receiverSocket = connectedUsers.get(receiver_id);

				// Gửi thông báo đến người nhận nếu họ không trong phòng chat
				if (receiverSocket && !receiverSocket.rooms.has(chat_room_id)) {
					receiverSocket.emit("new_message_notification", {
						message: populatedMessage,
						sender: {
							id: socket.user.id,
							name: socket.user.name,
						},
					});
				}

				// Phản hồi cho người gửi (không gửi lại tin nhắn)
				if (callback) callback({ status: "success", message: populatedMessage });
			} catch (error) {
				console.error("Send message error:", error);
				if (callback) callback({ status: "error", message: error.message });
			}
		});


		// Lấy lịch sử tin nhắn
		socket.on("get_messages", async (data, callback) => {
			try {
				const { receiver_id, page = 1, limit = 20 } = data;

				// Tạo chat_room_id
				const participants = [socket.user.id, receiver_id].sort();
				const chat_room_id = `chat_${participants[0]}_${participants[1]}`;

				// Lấy lịch sử tin nhắn với phân trang
				const messages = await ChatMessage.find({ chat_room_id })
					.sort({ createdAt: -1 })
					// .skip((page - 1) * limit)
					// .limit(limit)
					.populate("sender_id", "name username")
					.populate("receiver_id", "name username")
					.sort({ createdAt: -1 }); // Sắp xếp lại theo thời gian giảm dần

				// Số lượng tin nhắn không đọc
				const unreadCount = await ChatMessage.countDocuments({
					chat_room_id,
					receiver_id: (socket.user.id),
					is_read: false,
				});

				callback({
					status: "success",
					data: {
						messages,
						unread_count: unreadCount,
						current_page: page,
						has_more: messages.length === limit,
					},
				});
			} catch (error) {
				console.error("Get messages error:", error);
				callback({ status: "error", message: error.message });
			}
		});

		// Lấy danh sách cuộc trò chuyện
		socket.on("get_conversations", async (callback) => {
			console.log(socket.user.id);

			try {
				// Lấy danh sách cuộc trò chuyện có tin nhắn mới nhất
				const conversations = await ChatMessage.aggregate([
					{
						$match: {
							$or: [
								{ sender_id: new mongoose.Types.ObjectId(socket.user.id) },
								{ receiver_id: new mongoose.Types.ObjectId(socket.user.id) }
							],
						},
					},
					{ $sort: { createdAt: -1 } },
					{
						$group: {
							_id: "$chat_room_id",
							last_message: { $first: "$$ROOT" },
							unread_count: {
								$sum: {
									$cond: [
										{ $and: [{ $eq: ["$receiver_id", new mongoose.Types.ObjectId(socket.user.id)] }, { $eq: ["$is_read", false] }] },
										1,
										0
									],
								},
							},
						},
					},
					{ $sort: { "last_message.createdAt": -1 } },
				]);

				if (!conversations.length) {
					return callback({ status: "success", data: [] });
				}

				// Lấy danh sách ID của người dùng trong cuộc trò chuyện
				const otherUserIds = conversations.map(conv =>
					conv.last_message?.sender_id.toString() === socket.user.id
						? conv.last_message?.receiver_id
						: conv.last_message?.sender_id
				).filter(Boolean); // Loại bỏ giá trị null hoặc undefined

				// Truy vấn tất cả người dùng một lần thay vì gọi findById() nhiều lần
				const users = await User.find({ _id: { $in: otherUserIds } })
					.select("_id name username role_id")
					.populate("role_id", "role_name");

				const userMap = new Map(users.map(user => [user._id.toString(), user]));

				// Xử lý dữ liệu phản hồi
				const populatedConversations = conversations.map(conv => {
					if (!conv.last_message) return null; // Kiểm tra nếu không có tin nhắn nào

					const senderId = conv.last_message.sender_id.toString();
					const receiverId = conv.last_message.receiver_id.toString();

					// Xác định người dùng khác trong cuộc trò chuyện
					const otherUserId = senderId === socket.user.id ? receiverId : senderId;
					const otherUser = userMap.get(otherUserId);

					if (!otherUser) return null;

					return {
						room_id: conv._id,
						last_message: {
							_id: conv.last_message._id,
							content: conv.last_message.message_content,
							type: conv.last_message.message_type,
							sender_id: conv.last_message.sender_id,
							time: conv.last_message.createdAt,
						},
						unread_count: conv.unread_count,
						contact: {
							_id: otherUser._id,
							name: otherUser.name,
							username: otherUser.username,
							role: otherUser.role_id.role_name,
							online: connectedUsers.has(otherUserId),
						},
					};
				}).filter(Boolean); // Loại bỏ giá trị null

				callback({
					status: "success",
					data: populatedConversations,
				});
			} catch (error) {
				console.error("Get conversations error:", error);
				callback({ status: "error", message: error.message });
			}

		});

		// Đánh dấu tin nhắn đã đọc
		socket.on("mark_as_read", async (data) => {
			try {
				const { room_id } = data;

				// Cập nhật tất cả tin nhắn là đã đọc
				await ChatMessage.updateMany(
					{
						chat_room_id: room_id,
						receiver_id: mongoose.Types.ObjectId(socket.user.id),
						is_read: false,
					},
					{ is_read: true },
				);

				// Thông báo cho người gửi rằng tin nhắn đã được đọc
				socket.to(room_id).emit("messages_read", { room_id });
			} catch (error) {
				console.error("Mark as read error:", error);
			}
		});

		// Xử lý ngắt kết nối
		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.user.name}`);

			// Xóa khỏi danh sách kết nối
			connectedUsers.delete(socket.user.id);

			// Thông báo trạng thái offline
			io.emit("user_status", {
				user_id: socket.user.id,
				status: "offline",
				timestamp: new Date(),
			});
		});
	});

	return io;
}

module.exports = { initializeSocket };
