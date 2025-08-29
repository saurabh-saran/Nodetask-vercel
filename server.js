const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (Atlas URI from env variables in Vercel)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, match: /^[0-9]{10}$/, maxlength: 10 }, // exactly 10 digits
  email: { type: String, match: /.+\@.+\..+/ },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
  },
  loginId: { type: String, match: /^[a-zA-Z0-9]{8}$/, maxlength: 8 }, // exactly 8 chars
  password: {
    type: String,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
  },
  creationTime: { type: Date, default: Date.now },
  lastUpdatedOn: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Save User API
app.post("/api/users", async (req, res) => {
  try {
    let user = new User(req.body);
    user.lastUpdatedOn = new Date();
    await user.save();
    res.json({ message: "User saved successfully!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Users API
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚠️ IMPORTANT: Do NOT use app.listen() in Vercel
// Instead, export the app
module.exports = app;
