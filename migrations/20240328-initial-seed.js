const { seedDatabase } = require("../seeders/initialSeeder");

module.exports = {
	async up(db, client) {
		try {
			// Xóa dữ liệu cũ
			await db.collection("roles").deleteMany({});
			await db.collection("users").deleteMany({});
			await db.collection("boardinghouses").deleteMany({});
			await db.collection("rooms").deleteMany({});
			await db.collection("contracts").deleteMany({});
			await db.collection("bills").deleteMany({});
			await db.collection("payments").deleteMany({});

			// Thực hiện seed dữ liệu
			const roles = await db.collection("roles").insertMany([
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
				{
					role_name: "Guest",
					permissions: {
						view_rooms: true,
					},
				},
			]);

			// Thêm dữ liệu mẫu khác tương tự
			console.log("Migration up completed");
		} catch (error) {
			console.error("Migration up failed", error);
		}
	},

	async down(db, client) {
		try {
			// Xóa dữ liệu khi rollback
			await db.collection("roles").deleteMany({});
			await db.collection("users").deleteMany({});
			await db.collection("boardinghouses").deleteMany({});
			await db.collection("rooms").deleteMany({});
			await db.collection("contracts").deleteMany({});
			await db.collection("bills").deleteMany({});
			await db.collection("payments").deleteMany({});
			console.log("Migration down completed");
		} catch (error) {
			console.error("Migration down failed", error);
		}
	},
};
