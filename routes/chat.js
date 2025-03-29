const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

// Middleware xác thực cho tất cả các routes
router.use(authMiddleware);

// Lấy tất cả cuộc trò chuyện của người dùng hiện tại
router.get("/conversations", async (req, res) => {
	try {
		const userId = req.user.id;

		// Sử dụng aggregation để lấy các cuộc trò chuyện
		const conversations = await ChatMessage.aggregate([
			{
				$match: {
					$or: [
						{ sender_id: mongoose.Types.ObjectId(userId) },
						{ receiver_id: mongoose.Types.ObjectId(userId) },
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
								{
									$and: [
										{ $eq: ["$receiver_id", mongoose.Types.ObjectId(userId)] },
										{ $eq: ["$is_read", false] },
									],
								},
								1,
								0,
							],
						},
					},
				},
			},
			{ $sort: { "last_message.createdAt": -1 } },
		]);

		// Lấy thông tin người dùng cho mỗi cuộc trò chuyện
		const results = await Promise.all(
			conversations.map(async (conv) => {
				// Xác định ID của người dùng khác trong cuộc trò chuyện
				const otherUserId =
					conv.last_message.sender_id.toString() === userId
						? conv.last_message.receiver_id
						: conv.last_message.sender_id;

				// Lấy thông tin người dùng
				const otherUser = await User.findById(otherUserId)
					.select("_id name username role_id")
					.populate("role_id", "role_name");

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
					},
				};
			}),
		);

		res.status(200).json({ conversations: results });
	} catch (error) {
		console.error("Get conversations error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// Lấy tin nhắn của một cuộc trò chuyện cụ thể
router.get("/messages/:receiverId", async (req, res) => {
	try {
		const userId = req.user.id;
		const { receiverId } = req.params;
		const { page = 1, limit = 20 } = req.query;

		// Tạo chat_room_id
		const participants = [userId, receiverId].sort();
		const chat_room_id = `chat_${participants[0]}_${participants[1]}`;

		// Lấy tin nhắn với phân trang
		const messages = await ChatMessage.find({ chat_room_id })
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(parseInt(limit))
			.populate("sender_id", "name username")
			.populate("receiver_id", "name username")
			.sort({ createdAt: 1 });

		// Đếm tổng số tin nhắn
		const total = await ChatMessage.countDocuments({ chat_room_id });

		res.status(200).json({
			messages,
			pagination: {
				current_page: parseInt(page),
				total_pages: Math.ceil(total / limit),
				total_messages: total,
			},
		});
	} catch (error) {
		console.error("Get messages error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// Đánh dấu tin nhắn đã đọc
router.put("/read/:roomId", async (req, res) => {
	try {
		const userId = req.user.id;
		const { roomId } = req.params;

		const result = await ChatMessage.updateMany(
			{
				chat_room_id: roomId,
				receiver_id: mongoose.Types.ObjectId(userId),
				is_read: false,
			},
			{ is_read: true },
		);

		res.status(200).json({
			message: "Messages marked as read",
			updated_count: result.nModified,
		});
	} catch (error) {
		console.error("Mark as read error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
