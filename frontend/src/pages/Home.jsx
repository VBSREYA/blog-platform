/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Quote,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import API from "../api/axios";
import { DEFAULT_CATEGORIES } from "../constants/categories";
import { getImageUrl } from "../utils/imageUrl";

const DAILY_QUOTES = [
  {
    text: "A good story does not just tell you where to look. It teaches you how to notice.",
    author: "StoryBrew",
  },
  {
    text: "Write the post you needed yesterday, and someone else may need it today.",
    author: "StoryBrew",
  },
  {
    text: "Small drafts become clear ideas when you give them a place to breathe.",
    author: "StoryBrew",
  },
  {
    text: "The best communities are built one honest paragraph at a time.",
    author: "StoryBrew",
  },
  {
    text: "Save the idea before it becomes a whisper again.",
    author: "StoryBrew",
  },
  {
    text: "A thoughtful comment can be the second chapter of a story.",
    author: "StoryBrew",
  },
  {
    text: "Every post is a small invitation: come see the world from here.",
    author: "StoryBrew",
  },
];

const getDailyQuote = () => {
  const today = new Date();
  const dayKey = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dayNumber = Math.floor(dayKey / 86400000);
  return DAILY_QUOTES[dayNumber % DAILY_QUOTES.length];
};

function Home() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showDailyQuote, setShowDailyQuote] = useState(true);
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  async function fetchPosts() {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const tag = searchParams.get("tag");

    if (tag) {
      setActiveTag(tag);
    }
  }, [searchParams]);

  const handleLike = async (id, e) => {
    e.preventDefault();

    try {
      await API.put(`/posts/${id}/like`);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleBookmark = async (id, e) => {
    e.preventDefault();

    try {
      await API.put(`/users/bookmark/${id}`);
      alert("Saved");
    } catch (err) {
      console.log(err);
    }
  };

  const handleShare = async (post, e) => {
    e.preventDefault();

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

  const categories = useMemo(() => {
    const postCategories = posts.map((post) => post.category).filter(Boolean);
    return ["All", ...new Set([...DEFAULT_CATEGORIES, ...postCategories])];
  }, [posts]);

  const tags = useMemo(() => {
    const postTags = posts.flatMap((post) => post.tags || []).filter(Boolean);
    return ["All", ...new Set(postTags)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return posts
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(normalizedSearch) ||
          post.category?.toLowerCase().includes(normalizedSearch) ||
          post.summary?.toLowerCase().includes(normalizedSearch) ||
          post.content?.toLowerCase().includes(normalizedSearch) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearch));

        const matchesCategory =
          activeCategory === "All" || post.category === activeCategory;

        const matchesTag = activeTag === "All" || post.tags?.includes(activeTag);

        return matchesSearch && matchesCategory && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        }

        if (sortBy === "discussed") {
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        }

        if (sortBy === "viewed") {
          return (b.views || 0) - (a.views || 0);
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [posts, search, activeCategory, activeTag, sortBy]);

  const featuredPost = filteredPosts[0];

  const getReadingTime = (content = "") => {
    const plainText = content.replace(/<[^>]*>/g, " ").trim();
    const words = plainText ? plainText.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleSurpriseCategory = () => {
    const availableCategories = categories.filter((category) => category !== "All");

    if (availableCategories.length === 0) {
      setActiveCategory("All");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCategories.length);
    setActiveCategory(availableCategories[randomIndex]);
    setSortBy("newest");
  };

  return (
    <main className="page-wrap">
      {showDailyQuote && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2b1710]/45 px-4 backdrop-blur-sm">
          <section className="panel relative w-full max-w-lg rounded-[2rem] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowDailyQuote(false)}
              className="soft-button absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Close daily quote"
            >
              <X size={18} />
            </button>

            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ead7c1] text-[#7a4826]">
              <Quote size={24} />
            </div>
            <p className="pr-8 text-sm font-black uppercase tracking-[0.18em] text-[#9c5f33]">
              Quote of the day
            </p>
            <blockquote className="mt-4 text-2xl font-black leading-tight text-[#2b1710] sm:text-3xl">
              "{dailyQuote.text}"
            </blockquote>
            <p className="muted-text mt-4 font-bold">- {dailyQuote.author}</p>
            <button
              type="button"
              onClick={() => setShowDailyQuote(false)}
              className="brown-button mt-6 inline-flex rounded-full px-5 py-3 font-black"
            >
              Start reading
            </button>
          </section>
        </div>
      )}

      <section className="panel mb-5 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ead7c1] text-[#7a4826]">
            <Sparkles size={22} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9c5f33]">
              Daily writing spark
            </p>
            <p className="mt-1 font-bold leading-relaxed text-[#2b1710]">
              "{dailyQuote.text}"
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowDailyQuote(true)}
          className="soft-button shrink-0 rounded-full px-4 py-2 text-sm font-black"
        >
          View quote
        </button>
      </section>

      <section className="panel mb-8 overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
              Fresh stories
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[#2b1710] sm:text-6xl">
              Discover posts worth saving.
            </h1>
            <p className="muted-text mt-4 max-w-2xl text-lg leading-relaxed">
              Search, filter by category, read conversations, and share your favorite writing from the community.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[#7a4826]/10 bg-[#fff8ef] p-5 shadow-inner shadow-[#522b18]/5">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ead7c1] text-[#7a4826]">
                <Search size={21} />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#9c5f33]">
                  Find your next read
                </p>
                <p className="muted-text text-sm">
                  Pick a reading mood and let the feed shift with you.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setActiveTag("All");
                  setSortBy("newest");
                }}
                className="soft-button flex items-center justify-between rounded-2xl px-4 py-3 text-left font-black"
              >
                Fresh ideas
                <Sparkles size={18} />
              </button>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className="soft-button flex items-center justify-between rounded-2xl px-4 py-3 text-left font-black"
              >
                Reader favorites
                <Heart size={18} />
              </button>
              <button
                type="button"
                onClick={() => setSortBy("discussed")}
                className="soft-button flex items-center justify-between rounded-2xl px-4 py-3 text-left font-black"
              >
                Conversation starters
                <MessageCircle size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSurpriseCategory}
              className="brown-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-black"
            >
              Surprise me
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="field flex items-center gap-3 rounded-2xl px-5 py-1 shadow-sm">
          <Search size={20} className="text-[#9c5f33]" />
          <input
            type="text"
            placeholder="Search posts, categories, or summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
          />
        </div>

        <div className="field flex items-center gap-3 rounded-2xl px-4 py-1">
          <SlidersHorizontal size={19} className="text-[#9c5f33]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent py-3 font-bold outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="popular">Most liked</option>
            <option value="discussed">Most discussed</option>
            <option value="viewed">Most viewed</option>
          </select>
        </div>
      </section>

      <section className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
              activeCategory === category ? "brown-button" : "soft-button"
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {tags.length > 1 && (
        <section className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ead7c1] px-3 py-2 text-sm font-black text-[#704120]">
            <Tag size={16} />
            Tags
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
                activeTag === tag ? "brown-button" : "soft-button"
              }`}
            >
              {tag === "All" ? "All tags" : `#${tag}`}
            </button>
          ))}
        </section>
      )}

      {featuredPost && (
        <Link
          to={`/posts/${featuredPost._id}`}
          className="panel group mb-6 block rounded-[2rem] p-6 sm:p-8"
        >
          <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#9c5f33]">
            Featured from your feed
          </p>
          <h2 className="text-3xl font-black tracking-tight text-[#2b1710] group-hover:text-[#7a4826]">
            {featuredPost.title}
          </h2>
          <p className="muted-text mt-3 max-w-3xl">
            {featuredPost.summary || "Open this post to read the full story."}
          </p>
        </Link>
      )}

      {filteredPosts.length === 0 ? (
        <section className="panel rounded-[2rem] p-10 text-center">
          <p className="text-3xl font-black text-[#2b1710]">No posts found</p>
          <p className="muted-text mx-auto mt-3 max-w-md">
            Try a different search or category, or create the first post in this space.
          </p>
          <Link
            to="/create"
            className="brown-button mt-6 inline-flex rounded-full px-5 py-3 font-black"
          >
            Create Post
          </Link>
        </section>
      ) : (
        <div className="grid gap-5">
          {filteredPosts.map((post) => (
            <Link
              to={`/posts/${post._id}`}
              key={post._id}
              className="panel group block overflow-hidden rounded-2xl p-5"
            >
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="mb-5 h-64 w-full rounded-xl object-cover"
                />
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-[#ead7c1] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#704120]">
                  {post.category || "General"}
                </span>
                <span className="text-sm font-bold text-[#9c5f33]">
                  {getReadingTime(post.content)} min read
                </span>
              </div>

              {post.tags?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTag(tag);
                      }}
                      className="soft-button rounded-full px-3 py-1 text-xs font-black"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-black tracking-tight text-[#2b1710] group-hover:text-[#7a4826]">
                {post.title}
              </h2>

              <p className="muted-text mt-2 leading-relaxed">
                {post.summary || "Open this post to read the full story."}
              </p>

              <div className="mt-5 flex flex-col gap-4 border-t border-[#7a4826]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/profile/${post.author?._id}`;
                  }}
                  className="cursor-pointer font-semibold text-[#7a4826] hover:text-[#3f2112]"
                >
                  By {post.author?.name || "Unknown"}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={(e) => handleLike(post._id, e)}
                    className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    title="Like post"
                  >
                    <Heart size={17} />
                    {post.likes?.length || 0}
                  </button>

                  <span
                    className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    title="Comments"
                  >
                    <MessageCircle size={17} />
                    {post.comments?.length || 0}
                  </span>

                  <span
                    className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    title="Views"
                  >
                    <Eye size={17} />
                    {post.views || 0}
                  </span>

                  <button
                    onClick={(e) => handleBookmark(post._id, e)}
                    className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    title="Save post"
                  >
                    <Bookmark size={17} />
                    Save
                  </button>

                  <button
                    onClick={(e) => handleShare(post, e)}
                    className="soft-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                    title="Share post"
                  >
                    <Share2 size={17} />
                    Share
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default Home;
