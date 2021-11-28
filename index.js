const express = require("express");
const path = require("path");
const app = express();
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
var PORT = process.env.port || 3000;
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");
const url = "mongodb://localhost:27017";
const dbName = "rabbit";
const urlEncode = bodyParser.urlencoded({ extended: true });

app.set("views", path.join(__dirname));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  var user = {
    firstName: "",
    lastName: "",
    email: "",
    introduction: "",
    phone: "",
    experience: "",
    achievements: "",
  };

  res.render("form", {
    user: user,
  });
});

app.post(
  "/user",
  urlEncode,
  body("phone").isLength({
    min: 10,
  }),
  body('email').isEmail(),
  body("firstName").isLength({
    min: 1,
  }),
  body("lastName").isLength({
    min: 1,
  }),
  body("introduction").isLength({
    min: 1,
  }),
  body("introduction").isLength({
    min: 1,
  }),
  body("achievements").isLength({
    min: 1,
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    } else {
      const url = "mongodb://localhost:27017";
      const client = new MongoClient(url);
      await client.connect();
      console.log("Connected successfully to server");
      const db = client.db(dbName);
      const collection = db.collection("users");
      const result = await collection.insertOne(req.body);
      client.close();
      res.send(result);
    }
  }
);

app.get("/list", urlEncode, async (req, res) => {
  let result = []; 
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("users");
  result = await collection.find({}).toArray();
  result.map((each) => ({ ...each, _id: each._id.toString() }));
  if (result.length > 0) {
    res.render("listForm", {
      result: result,
    });
  }
});

app.get("/details", urlEncode, async (req, res) => {
  console.log(req.query.id);
  let result = [];
  const client = new MongoClient(url);  
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("users");
  const objId = ObjectId(req.query.id);
  result = await collection.find({ _id: objId }).toArray();
  if (result.length > 0) {
    res.render("detailsForm", {
      result: result,
    });
  }
});

app.listen(PORT, function (error) {
  if (error) throw error;
  console.log("Server created Successfully on PORT", PORT);
});
