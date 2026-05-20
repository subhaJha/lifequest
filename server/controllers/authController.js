const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { username, email, password } =
      req.body;

    // CHECK IF USER EXISTS
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    // CREATE USER
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // GENERATE JWT TOKEN
    const token = signToken({ id: user._id });

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
