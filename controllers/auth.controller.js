const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const { name, email, password, password_confirmation } = req.body;
  if (!name || !email || !password || !password_confirmation) {
    return res.status(400).send({ message: "u should fill all the 4 fields" });
  }
  if (password !== password_confirmation) {
    return res
      .status(400)
      .send({ message: "password and password confirmation dont match" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .send({ message: "password must have 8+ characters" });
  }
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(422).json({ message: "email already exist" });
  }
  const hashedpassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedpassword,
    role: "client",
  });
  const createdUser = await User.findById(user._id).select("-password");
  res.status(201).json(createdUser);
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "missing fields" });
  }
  const matchUser = await User.findOne({ email: email });

  if (!matchUser) {
    return res.status(401).send({ message: "invalid Credentials " });
  }
  const isMatchedPassword = await bcrypt.compare(password, matchUser.password);

  if (!isMatchedPassword) {
    return res.status(401).send({ message: "invalid Credentials " });
  }
  const payload = { id: matchUser._id, role: matchUser.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(200).json({
    token: token,
    id: matchUser._id,
    name: matchUser.name,
    email: matchUser.email,
    role: matchUser.role,
  });
}

async function getMe(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
}

module.exports = { register, login, getMe };
