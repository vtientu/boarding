const Role = require("../models/Role");

const seedRoles = async () => {
	try {
		const existingRoles = await Role.find();
		if (existingRoles.length === 0) {
			await Role.create([
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
			console.log("Roles seeded successfully");
		}
	} catch (error) {
		console.error("Error seeding roles:", error);
	}
};

module.exports = seedRoles;
