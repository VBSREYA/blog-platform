const Post = require("../models/Post");

const normalizeTags = (tags = []) => {
  const tagList = Array.isArray(tags) ? tags : String(tags).split(",");

  return [
    ...new Set(
      tagList
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 8)
    ),
  ];
};

const getReadingTime = (content = "") => {
  const plainText = content.replace(/<[^>]*>/g, " ").trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;

  return Math.max(1, Math.ceil(words / 200));
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name photoUrl bio")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch posts",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name photoUrl bio")
      .populate("comments.user", "name photoUrl");

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch post",
    });
  }
};

const getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      $or: [
        { category: post.category },
        { tags: { $in: post.tags || [] } },
        { author: post.author },
      ],
    })
      .populate("author", "name photoUrl")
      .sort({ views: -1, createdAt: -1 })
      .limit(3);

    res.json(relatedPosts);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to fetch related posts",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, summary, image, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const post = new Post({
      title: title.trim(),
      content,
      summary,
      image,
      category: category || "General",
      tags: normalizeTags(tags),
      readingTime: getReadingTime(content),
      author: req.user.id,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name photoUrl bio"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to create post",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    const { title, content, summary, image, category, tags } = req.body;

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    post.summary = summary ?? post.summary;
    post.image = image ?? post.image;
    post.category = category ?? post.category;
    post.tags = tags === undefined ? post.tags : normalizeTags(tags);
    post.readingTime = content ? getReadingTime(content) : post.readingTime;

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("author", "name photoUrl bio")
      .populate("comments.user", "name photoUrl");

    res.json(updatedPost);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to update post",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to delete post",
    });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const userId = req.user.id;

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to update like",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (!req.body.text?.trim()) {
      return res.status(400).json({
        error: "Comment text is required",
      });
    }

    post.comments.push({
      text: req.body.text.trim(),
      user: req.user.id,
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("author", "name photoUrl bio")
      .populate("comments.user", "name photoUrl");

    res.json(updatedPost);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to add comment",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const isCommentOwner = comment.user.toString() === req.user.id;
    const isPostOwner = post.author.toString() === req.user.id;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("author", "name photoUrl bio")
      .populate("comments.user", "name photoUrl");

    res.json(updatedPost);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to delete comment",
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  getRelatedPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
};
