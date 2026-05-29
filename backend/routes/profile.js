const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");

// GET PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE PROFILE
router.put("/update", auth, async (req, res) => {
  try {
    const { name, bio, photoUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, photoUrl },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// UPDATE PROFILE SETTINGS
router.put("/settings", auth, async (req, res) => {
  try {
    const { theme, isPrivate } = req.body;

    const updates = {};

    if (["light", "dark"].includes(theme)) {
      updates.theme = theme;
    }

    if (typeof isPrivate === "boolean") {
      updates.isPrivate = isPrivate;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Settings update failed" });
  }
});

// GET LOGGED-IN USER POSTS
router.get("/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "name photoUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET POSTS THE LOGGED-IN USER COMMENTED ON
router.get("/commented-posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ "comments.user": req.user.id })
      .populate("author", "name photoUrl")
      .populate("comments.user", "name photoUrl")
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch commented posts" });
  }
});

// GET LOGGED-IN USER BOOKMARKS
router.get("/bookmarks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("bookmarks")
      .populate({
        path: "bookmarks",
        populate: {
          path: "author",
          select: "name photoUrl",
        },
      });

    res.json(user?.bookmarks || []);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// GET PUBLIC USER POSTS
router.get("/:id/posts", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("isPrivate");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isPrivate) {
      return res.status(403).json({ error: "This account is private" });
    }

    const posts = await Post.find({ author: req.params.id })
      .populate("author", "name photoUrl")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET PUBLIC POSTS A USER COMMENTED ON
router.get("/:id/commented-posts", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("isPrivate");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isPrivate) {
      return res.status(403).json({ error: "This account is private" });
    }

    const posts = await Post.find({ "comments.user": req.params.id })
      .populate("author", "name photoUrl")
      .populate("comments.user", "name photoUrl")
      .sort({ updatedAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch commented posts" });
  }
});

// GET PUBLIC PROFILE
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
