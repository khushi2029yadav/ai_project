const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sendAuthenticatedUser(res, user, status = 200) {
  return res.status(status).json({
    message: status === 201 ? "Account created successfully" : "Login successful",
    token: createToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

const googleClientId = process.env.GOOGLE_CLIENT_ID ||
  "496144110879-h0ss8jv658mi0lmrolls4despalo3hf5.apps.googleusercontent.com";
const client = new OAuth2Client(googleClientId);

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      !passwordPattern.test(password) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Enter your name and a valid email. Passwords must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return sendAuthenticatedUser(res, user, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({ message: "Enter a valid email and password" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+passwordHash"
    );
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    return sendAuthenticatedUser(res, user);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Could not log in" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }


    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified || !payload.sub) {
      return res.status(401).json({ message: "Google account email is not verified" });
    }

    const { sub: googleId, name, email, picture } = payload;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        profilePicture: picture,
      });
    } else if (user.googleId && user.googleId !== googleId) {
      return res.status(409).json({
        message: "This email is linked to a different Google account",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = picture;
      await user.save();
    }

    return sendAuthenticatedUser(res, user);
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ message: "Google authentication failed" });
  }
});

module.exports = router;