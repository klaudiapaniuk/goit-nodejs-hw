const app = require("./app");
const mongoose = require("mongoose");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {
	dbName: `db-contacts`,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

connection
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Database connection successful. Port ${PORT}`);
		});
	})
	.catch((err) => {
		console.log(`Server not running. Error message: ${err.message}`);
		process.exit(1);
	});
