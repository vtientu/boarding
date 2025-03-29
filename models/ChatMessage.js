const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
	{
		sender_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiver_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		chat_room_id: {
			type: String,
			required: true,
		},
		message_content: {
			type: String,
			required: true,
		},
		message_type: {
			type: String,
			enum: ["Text", "Image", "File"],
			default: "Text",
		},
		is_read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
