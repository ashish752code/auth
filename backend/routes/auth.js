// backend/routes/auth.js
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { signToken, requireAuth } = require("../middleware/auth");

// ── POST /api/auth/signup ───────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." });

    if (name.trim().length < 2)
      return res.status(400).json({ error: "Name must be at least 2 characters." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email address." });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: "Email already registered. Please log in." });

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Insert user
    const result = db
      .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
      .run(name.trim(), email.toLowerCase(), hash);

    const user = db
      .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
      .get(result.lastInsertRowid);

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase());

    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    return res.json({
      message: "Logged in successfully!",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: "User not found." });

  return res.json({ user });
});

// ── PUT /api/auth/profile ───────────────────────────────────────────────────
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    let newHash = user.password;

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: "Current password is required to change password." });

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(401).json({ error: "Current password is incorrect." });

      if (newPassword.length < 6)
        return res.status(400).json({ error: "New password must be at least 6 characters." });

      newHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedName = name ? name.trim() : user.name;

    db.prepare(
      "UPDATE users SET name = ?, password = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(updatedName, newHash, req.user.id);

    const updatedUser = db
      .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
      .get(req.user.id);

    return res.json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
