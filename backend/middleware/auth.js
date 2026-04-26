// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "change_this_in_production_please";

/**
 * Middleware: verify JWT from Authorization header or cookie
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token =
    authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, email, name, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token. Please log in." });
  }
}

/**
 * Helper: sign a JWT
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

module.exports = { requireAuth, signToken };
