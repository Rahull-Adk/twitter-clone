import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils/generateToken.js";
const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be atleast 6 character" });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email is already taken" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      const createdUser = await User.findById(newUser._id).select("-password");
      res
        .status(201)
        .json({ user: createdUser, message: "User created successfully" });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log(`Error in signup controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const passwordCheck = await bcrypt.compare(password, user?.password || "");

    if (!passwordCheck) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    generateToken(user._id, res);
    const loggedInUser = await User.findById(user._id).select("-password");
    res
      .status(200)
      .json({ user: loggedInUser, message: "User logged in successfully" });
  } catch (error) {
    console.log(`Error in login controller: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(`Error in logout controller: ${error.messge}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ user, message: "User fetched successfully" });
  } catch (error) {
    console.log(`Error in getUser controller: ${error.messge}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { signup, login, logout, getUser };
