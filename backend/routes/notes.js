// backend/routes/notes.js
const router = require("express").Router();
const db = require("../database/db");
const { requireAuth } = require("../middleware/auth");

// All note routes require authentication
router.use(requireAuth);

// ── GET /api/notes ──────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const notes = db
    .prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC")
    .all(req.user.id);
  return res.json({ notes });
});

// ── GET /api/notes/:id ──────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const note = db
    .prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found." });
  return res.json({ note });
});

// ── POST /api/notes ─────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const { title, content } = req.body;
  if (!title || title.trim().length === 0)
    return res.status(400).json({ error: "Title is required." });

  const result = db
    .prepare("INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)")
    .run(req.user.id, title.trim(), content || "");

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json({ message: "Note created!", note });
});

// ── PUT /api/notes/:id ──────────────────────────────────────────────────────
router.put("/:id", (req, res) => {
  const { title, content } = req.body;
  const note = db
    .prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found." });

  db.prepare(
    "UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title || note.title, content !== undefined ? content : note.content, req.params.id);

  const updated = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id);
  return res.json({ message: "Note updated!", note: updated });
});

// ── DELETE /api/notes/:id ───────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const note = db
    .prepare("SELECT * FROM notes WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found." });

  db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
  return res.json({ message: "Note deleted." });
});

// ── GET /api/notes/stats ────────────────────────────────────────────────────
router.get("/user/stats", (req, res) => {
  const stats = db
    .prepare(`
      SELECT
        COUNT(*) as total_notes,
        MAX(updated_at) as last_activity
      FROM notes
      WHERE user_id = ?
    `)
    .get(req.user.id);

  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();

  return res.json({
    stats: {
      totalNotes: stats.total_notes,
      lastActivity: stats.last_activity,
      totalUsers: totalUsers.count,
    },
  });
});

module.exports = router;
