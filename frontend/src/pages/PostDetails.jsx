/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, Eye, Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";

function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comment, setComment] = useState("");

  async function fetchPost() {
    try {
      const res = await API.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchRelatedPosts() {
    try {
      const res = await API.get(`/posts/${id}/related`);
      setRelatedPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPost();
    fetchRelatedPosts();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      await API.post(`/posts/${id}/comment`, {
        text: comment.trim(),
      });

      setComment("");
      fetchPost();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await API.delete(`/posts/${id}/comment/${commentId}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async () => {
    try {
      await API.put(`/posts/${id}/like`);
      fetchPost();
    } catch (err) {
      console.log(err);
    }
  };

  const handleBookmark = async () => {
    try {
      await API.put(`/users/bookmark/${post._id}`);
      alert("Bookmarked");
    } catch (err) {
      console.log(err);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.summary || "Read this post on StoryBrew",
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        alert("Post link copied");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this post?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/posts/${id}`);
      alert("Post Deleted");
      window.location.href = "/";
    } catch (err) {
      console.log(err);
    }
  };

  if (!post) {
    return <main className="page-wrap">Loading...</main>;
  }

  return (
    <main className="page-wrap">
      <article className="panel rounded-2xl p-6 sm:p-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
          {post.category || "Story"}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#2b1710] sm:text-5xl">
          {post.title}
        </h1>

        {post.image && (
          <img
            src={getImageUrl(post.image)}
            alt={post.title}
            className="mt-6 h-80 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[#7c5a44]">
          <Link
            to={`/profile/${post.author?._id}`}
            className="font-bold text-[#7a4826] hover:text-[#3f2112]"
          >
            By {post.author?.name}
          </Link>

          <button
            onClick={handleLike}
            className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            <Heart size={17} />
            {post.likes?.length || 0}
          </button>

          <span className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
            <MessageCircle size={17} />
            {post.comments?.length || 0}
          </span>

          <span className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
            <Eye size={17} />
            {post.views || 0}
          </span>

          <button
            onClick={handleBookmark}
            className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            <Bookmark size={17} />
            Save
          </button>

          <button
            onClick={handleShare}
            className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            <Share2 size={17} />
            Share
          </button>
        </div>

        {post.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="soft-button rounded-full px-3 py-1 text-xs font-black"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {user?._id === (post.author?._id || post.author) && (
          <div className="mt-6 flex gap-3">
            <Link
              to={`/edit/${post._id}`}
              className="soft-button rounded-xl px-4 py-2 font-semibold"
            >
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="rounded-xl bg-[#9f2f21] px-4 py-2 font-semibold text-white hover:bg-[#7f2218]"
            >
              Delete
            </button>
          </div>
        )}

        <div
          className="prose prose-stone mt-8 max-w-none text-[#3f2112]"
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />
      </article>

      <section className="panel mt-8 rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 text-2xl font-black tracking-tight text-[#2b1710]">
          Comments ({post.comments?.length || 0})
        </h2>

        <form onSubmit={handleComment} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="field flex-1 rounded-xl px-4 py-3"
          />

          <button className="brown-button rounded-xl px-6 py-3 font-bold">
            Post
          </button>
        </form>

        <div className="space-y-4">
          {post.comments?.map((comment, index) => (
            <div
              key={comment._id || index}
              className="rounded-xl border border-[#7a4826]/10 bg-[#fff8ef] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[#5a3018]">
                  {comment.user?.name || "User"}
                </p>

                {(user?._id === comment.user?._id ||
                  user?._id === (post.author?._id || post.author)) &&
                  comment._id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="soft-button inline-flex h-9 w-9 items-center justify-center rounded-full"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
              </div>

              <p className="muted-text mt-1">{comment.text}</p>
            </div>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="panel mt-8 rounded-2xl p-6 sm:p-8">
          <h2 className="mb-5 text-2xl font-black tracking-tight text-[#2b1710]">
            Keep reading
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost._id}
                to={`/posts/${relatedPost._id}`}
                className="rounded-xl border border-[#7a4826]/10 bg-[#fff8ef] p-4"
              >
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#9c5f33]">
                  {relatedPost.category || "Story"}
                </p>
                <h3 className="font-black text-[#2b1710]">
                  {relatedPost.title}
                </h3>
                <p className="muted-text mt-2 text-sm">
                  By {relatedPost.author?.name || "Unknown"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default PostDetails;
