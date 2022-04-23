const express = require("express");
const connectDB = require("./config/db");

const app = express();
//connexion a la bd
connectDB();
//init middleware
app.use(express.json());

//routing
app.use("/admin", require("./routes/admin"));

const PORT = process.env.PORT || 3000;

app.listen(3000, console.log(`App is live on port ${PORT}`));
