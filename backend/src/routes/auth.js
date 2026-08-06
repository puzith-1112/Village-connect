import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../lib/db/index.js";
import { RegisterBody, LoginBody, GetMeResponse } from "../lib/api-zod/index.js";
import { signToken, requireAuth } from "../lib/auth.js";
const router = Router();
router.post("/auth/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { name, email, password, role, phone, address, city, state, pincode, skills, interests, experience } = parsed.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone: phone ?? undefined,
      address: address ?? undefined,
      city: city ?? undefined,
      state: state ?? undefined,
      pincode: pincode ?? undefined,
      skills,
      interests,
      experience: experience ?? undefined
    });
    const token = signToken({ id: newUser._id, email: newUser.email, role: newUser.role });
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        pincode: newUser.pincode,
        skills: newUser.skills,
        interests: newUser.interests,
        experience: newUser.experience,
        employmentStatus: newUser.employmentStatus,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});
router.post("/auth/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ id: user._id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        skills: user.skills,
        interests: user.interests,
        experience: user.experience,
        employmentStatus: user.employmentStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(GetMeResponse.parse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      skills: user.skills,
      interests: user.interests,
      experience: user.experience,
      employmentStatus: user.employmentStatus,
      createdAt: user.createdAt
    }));
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
