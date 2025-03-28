const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
	{
		role_name: {
			type: String,
			required: true,
			unique: true,
			enum: ["Owner", "Tenant"],
		},
		permissions: {
			view_rooms: { type: Boolean, default: false },
			manage_rooms: { type: Boolean, default: false },
			manage_tenants: { type: Boolean, default: false },
			manage_bills: { type: Boolean, default: false },
			generate_reports: { type: Boolean, default: false },
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Role", RoleSchema);
