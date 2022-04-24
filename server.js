const express = require("express");
const connectDB = require("./config/db");
const { create } = require("express-handlebars");
const config = require("config");
const cookieParser = require("cookie-parser");

const app = express();

const hbs = create({});

//connexion a la bd
connectDB();

//set view engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

//init middleware
app.use(express.urlencoded({ extended: false }));

//session handling
app.use(cookieParser());

//routing
app.get("/", (req, res) => {
  res.render("home", {
    title: "cc moi c'est idir",
    paragraphe:
      "cc alors je suis idir belfares j'ai 22 ans et je suis un fdp ok ? mrc by",
  });
});

app.use("/admin", require("./routes/admin"));
app.use("/client", require("./routes/client"));
app.use("/gerant", require("./routes/gerant"));

const PORT = process.env.PORT || 3000;

app.listen(3000, console.log(`App is live on port ${PORT}`));
