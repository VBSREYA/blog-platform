/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, Eye, Heart, MessageCircle } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { id } = useParams();
  const { user: loggedInUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    photoUrl: "",
  });

  const [settings, setSettings] = useState({
    theme: "light",
    isPrivate: false,
  });

  const isOwnProfile = !id || id === loggedInUser?._id;
  const profileUserId = id || loggedInUser?._id;

  async function fetchProfile() {
    try {
      const res = await API.get(isOwnProfile ? "/profile/me" : `/profile/${id}`);

      setUser(res.data);
      setForm({
        name: res.data.name || "",
        bio: res.data.bio || "",
        photoUrl: res.data.photoUrl || "",
      });
      setSettings({
        theme: res.data.theme || "light",
        isPrivate: Boolean(res.data.isPrivate),
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchPosts() {
    try {
      const res = await API.get(isOwnProfile ? "/profile/posts" : `/profile/${id}/posts`);
      setPosts(res.data);
      setIsPrivateProfile(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setIsPrivateProfile(true);
        setPosts([]);
      }
      console.log(err);
    }
  }

  async function fetchCommentedPosts() {
    try {
      const res = await API.get(
        isOwnProfile ? "/profile/commented-posts" : `/profile/${id}/commented-posts`
      );
      setCommentedPosts(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setCommentedPosts([]);
      }
      console.log(err);
    }
  }

  async function fetchSavedPosts() {
    if (!isOwnProfile) return;

    try {
      const res = await API.get("/profile/bookmarks");
      setSavedPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    fetchCommentedPosts();
    fetchSavedPosts();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put("/profile/update", form);
      setUser(res.data);
      updateUser?.(res.data);
      setEditing(false);
      alert("Profile updated");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSettingsUpdate = async (nextSettings) => {
    try {
      setSettings(nextSettings);
      const res = await API.put("/profile/settings", nextSettings);

      setUser(res.data);
      setSettings({
        theme: res.data.theme || "light",
        isPrivate: Boolean(res.data.isPrivate),
      });
      updateUser?.(res.data);
    } catch (err) {
      console.log(err);
      alert("Settings update failed");
    }
  };

  const getPlainText = (html = "") => {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.textContent || element.innerText || "";
  };

  const getUserComments = (post) =>
    post.comments?.filter((comment) => {
      const commentUserId = comment.user?._id || comment.user;
      return commentUserId === profileUserId;
    }) || [];

  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
  const totalComments = posts.reduce(
    (sum, post) => sum + (post.comments?.length || 0),
    0
  );

  if (!user) {
    return <main className="page-wrap">Loading...</main>;
  }

  return (
    <main className="page-wrap">
      <section className="panel mb-8 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src={user.photoUrl || "https://via.placeholder.com/120"}
            alt={user.name}
            className="h-32 w-32 rounded-full border-4 border-[#ead7c1] object-cover shadow-lg"
          />

          <div className="flex-1">
            {!editing ? (
              <>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
                  Profile
                </p>
                <h1 className="text-4xl font-black tracking-tight text-[#2b1710]">
                  {user.name}
                </h1>

                <p className="muted-text mt-3 max-w-2xl">
                  {user.bio || "No bio yet"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#ead7c1] px-3 py-1 text-sm font-bold text-[#5a3018]">
                    {user.isPrivate ? "Private account" : "Public account"}
                  </span>
                  <span className="rounded-full bg-[#f4e4d1] px-3 py-1 text-sm font-bold text-[#5a3018]">
                    {user.theme === "dark" ? "Dark mode" : "Light mode"}
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setEditing(true)}
                    className="brown-button mt-6 rounded-xl px-5 py-3 font-bold"
                  >
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleUpdate} className="grid gap-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field w-full rounded-xl px-4 py-3"
                />

                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="field w-full rounded-xl px-4 py-3"
                />

                <input
                  type="text"
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className="field w-full rounded-xl px-4 py-3"
                />

                <button className="brown-button rounded-xl px-5 py-3 font-bold">
                  Save
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {isOwnProfile && (
        <>
        <section className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="panel rounded-2xl p-5">
            <Eye className="mb-3 text-[#9c5f33]" size={22} />
            <p className="text-3xl font-black text-[#2b1710]">{totalViews}</p>
            <p className="muted-text text-sm font-bold">Post views</p>
          </div>
          <div className="panel rounded-2xl p-5">
            <Heart className="mb-3 text-[#9c5f33]" size={22} />
            <p className="text-3xl font-black text-[#2b1710]">{totalLikes}</p>
            <p className="muted-text text-sm font-bold">Likes earned</p>
          </div>
          <div className="panel rounded-2xl p-5">
            <MessageCircle className="mb-3 text-[#9c5f33]" size={22} />
            <p className="text-3xl font-black text-[#2b1710]">{totalComments}</p>
            <p className="muted-text text-sm font-bold">Comments received</p>
          </div>
          <div className="panel rounded-2xl p-5">
            <Bookmark className="mb-3 text-[#9c5f33]" size={22} />
            <p className="text-3xl font-black text-[#2b1710]">{savedPosts.length}</p>
            <p className="muted-text text-sm font-bold">Saved posts</p>
          </div>
        </section>

        <section className="panel mb-8 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
              Settings
            </p>
            <h2 className="text-3xl font-black tracking-tight text-[#2b1710]">
              Account preferences
            </h2>
            <p className="muted-text mt-2">
              Control how your account looks and whether others can see your activity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#7a4826]/10 bg-[#fff8ef] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-[#2b1710]">Dark mode</h3>
                  <p className="muted-text mt-1 text-sm">
                    Switch the app to a deeper coffee-toned theme.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSettingsUpdate({
                      ...settings,
                      theme: settings.theme === "dark" ? "light" : "dark",
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    settings.theme === "dark" ? "brown-button" : "soft-button"
                  }`}
                >
                  {settings.theme === "dark" ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#7a4826]/10 bg-[#fff8ef] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-[#2b1710]">Private account</h3>
                  <p className="muted-text mt-1 text-sm">
                    Hide your posts and commented posts from public profiles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSettingsUpdate({
                      ...settings,
                      isPrivate: !settings.isPrivate,
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    settings.isPrivate ? "brown-button" : "soft-button"
                  }`}
                >
                  {settings.isPrivate ? "Private" : "Public"}
                </button>
              </div>
            </div>
          </div>
        </section>
        </>
      )}

      {isPrivateProfile ? (
        <section className="panel rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-[#2b1710]">
            This account is private
          </h2>
          <p className="muted-text mt-2">
            Posts and comments are hidden by the account owner.
          </p>
        </section>
      ) : (
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="mb-4 text-2xl font-black tracking-tight text-[#2b1710]">
            {isOwnProfile ? "My Posts" : `${user.name}'s Posts`}
          </h2>

          {posts.length === 0 ? (
            <div className="panel rounded-2xl p-5 muted-text">No posts yet</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  to={`/posts/${post._id}`}
                  key={post._id}
                  className="panel block rounded-2xl p-5"
                >
                  <h3 className="text-xl font-black text-[#2b1710]">{post.title}</h3>
                  <p className="muted-text mt-2">
                    {getPlainText(post.content).slice(0, 100)}...
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-black tracking-tight text-[#2b1710]">
            Posts Commented On
          </h2>

          {commentedPosts.length === 0 ? (
            <div className="panel rounded-2xl p-5 muted-text">No commented posts yet</div>
          ) : (
            <div className="space-y-4">
              {commentedPosts.map((post) => (
                <Link
                  to={`/posts/${post._id}`}
                  key={post._id}
                  className="panel block rounded-2xl p-5"
                >
                  <h3 className="text-xl font-black text-[#2b1710]">{post.title}</h3>
                  <p className="muted-text mt-1 text-sm">
                    By {post.author?.name || "Unknown"}
                  </p>

                  <div className="mt-4 space-y-2">
                    {getUserComments(post).map((comment) => (
                      <div
                        key={comment._id}
                        className="rounded-xl border border-[#7a4826]/10 bg-[#fff8ef] p-4"
                      >
                        <p className="font-bold text-[#5a3018]">
                          {comment.user?.name || user.name}
                        </p>
                        <p className="muted-text mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      )}

      {isOwnProfile && (
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-black tracking-tight text-[#2b1710]">
            Saved Posts
          </h2>

          {savedPosts.length === 0 ? (
            <div className="panel rounded-2xl p-5 muted-text">No saved posts yet</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedPosts.map((post) => (
                <Link
                  to={`/posts/${post._id}`}
                  key={post._id}
                  className="panel block rounded-2xl p-5"
                >
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#9c5f33]">
                    {post.category || "Story"}
                  </p>
                  <h3 className="text-xl font-black text-[#2b1710]">{post.title}</h3>
                  <p className="muted-text mt-2">
                    {post.summary || `${getPlainText(post.content).slice(0, 100)}...`}
                  </p>
                  <p className="muted-text mt-3 text-sm">
                    By {post.author?.name || "Unknown"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Profile;
