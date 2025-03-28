const config = {
	mongodb: {
		url: process.env.MONGODB_URI || "mongodb://localhost:27017",
		databaseName: "Boarding_Houses",
		options: {
			useNewUrlParser: false,
			useUnifiedTopology: false,
		},
	},
	migrationsDir: "migrations",
	changelogCollectionName: "changelog",
	migrationFileExtension: ".js",
};

module.exports = config;
