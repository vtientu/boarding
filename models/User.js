const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide name"],
			minlength: 3,
			maxlength: 50,
		},

		email: {
			type: String,
			required: [true, "Please provide email"],
			minlength: 3,
			maxlength: 50,
			match: [
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				"Please provide a valid email",
			],
			unique: true,
		},
		password: {
			type: String,
			required: [true, "Please provide password"],
			minlength: 3,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		role_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role",
		},
		phone: {
			type: String,
		},
		address: {
			type: String,
		},
		age: {
			type: Number,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
		},
		resetPasswordCode: {
			type: String,
		},
		resetPasswordExpires: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password);
	return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
