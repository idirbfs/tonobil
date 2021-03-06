const express = require("express");
const connectDB = require("./config/db");
const { create } = require("express-handlebars");
const config = require("config");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const multer = require("multer");
const upload = multer();

const app = express();
console.log(app);

const hbs = create({});

//connexion a la bd
connectDB();

//static public folder
app.use(express.static("public"));

//session handling
const store = new mongoDBSession({
  uri: config.get("mongoURI"),
  collection: "sessions",
});
app.use(
  session({
    secret: config.get("sessionSecret"),
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//set view engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

//init middleware
app.use(express.urlencoded({ extended: false }));
app.use(upload.array());

//routing
app.get("/", (req, res) => {
  res.render("home");
});

app.use("/admin", require("./routes/admin"));
app.use("/client", require("./routes/client"));
app.use("/gerant", require("./routes/gerant"));
app.use("/agence", require("./routes/agence"));
app.use("/vehicule", require("./routes/vehicule"));

const PORT = process.env.PORT || 3000;

app.listen(3000, console.log(`App is live on port ${PORT}`));
