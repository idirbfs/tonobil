const express = require("express");
const { create } = require("express-handlebars");

const app = express();

const hbs = create({
  /* config */
});

//view engine
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

//routing
app.get("/", (req, res) => {
  res.render("home", {
    title: "cc moi c'est idir",
    paragraphe:
      "cc alors je suis idir belfares j'ai 22 ans et je suis un fdp ok ? mrc by",
  });
});

app.post("/inscription", (req, res) => {
  res.render("home", { title: "cc moi c'est idir" });
});

app.listen(3000, console.log("cc je suis aalll"));
