const express = require("express");

const router = express.Router();

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

router.put(
  "/bookmark/:postId",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      const alreadyBookmarked =
        user.bookmarks.some(
          (id) =>
            id.toString() ===
            req.params.postId
        );

      if (alreadyBookmarked) {
        user.bookmarks =
          user.bookmarks.filter(
            (id) =>
              id.toString() !==
              req.params.postId
          );
      } else {
        user.bookmarks.push(
          req.params.postId
        );
      }

      await user.save();

      const updatedUser =
        await User.findById(
          req.user.id
        ).populate("bookmarks");

      res.json(updatedUser);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        error: "Bookmark failed",
      });
    }
  }
);

module.exports = router;
