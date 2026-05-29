/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import { DEFAULT_CATEGORIES } from "../constants/categories";
import { getImageUrl } from "../utils/imageUrl";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    summary: "",
    image: "",
    content: "",
    category: "",
    tags: [],
  });
  const [categoryMode, setCategoryMode] = useState("default");

  const parsedTags = Array.isArray(form.tags)
    ? form.tags
    : form.tags
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 8);

  async function fetchPost() {
    try {
      const res = await API.get(`/posts/${id}`);

      setForm({
        title: res.data.title,
        summary: res.data.summary,
        image: res.data.image,
        content: res.data.content,
        category: res.data.category,
        tags: res.data.tags || [],
      });
      setCategoryMode(
        DEFAULT_CATEGORIES.includes(res.data.category) ? "default" : "custom"
      );
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPost();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/posts/${id}`, form);
      alert("Post Updated");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="page-wrap">
      <section className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
          Refine story
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#2b1710]">
          Edit Post
        </h1>
      </section>

      <form onSubmit={handleUpdate} className="panel rounded-2xl p-6 sm:p-8">
        <div className="grid gap-4">
          <input
            type="text"
            value={form.title}
            placeholder="Title"
            className="field w-full rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="text"
            value={form.summary}
            placeholder="Summary"
            className="field w-full rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />

          <input
            type="url"
            value={form.image}
            placeholder="Image URL"
            className="field w-full rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <div>
            <input
              type="text"
              value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
              placeholder="Tags, separated by commas"
              className="field w-full rounded-xl px-4 py-3"
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            {parsedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#ead7c1] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#704120]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {form.image && (
            <img
              src={getImageUrl(form.image)}
              alt="Post preview"
              className="h-64 w-full rounded-xl object-cover"
            />
          )}

          <textarea
            rows="10"
            value={form.content}
            placeholder="Content"
            className="field min-h-72 w-full rounded-xl px-4 py-3"
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <select
              value={categoryMode === "custom" ? "custom" : form.category || "General"}
              className="field w-full rounded-xl px-4 py-3"
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setCategoryMode("custom");
                  setForm({ ...form, category: "" });
                } else {
                  setCategoryMode("default");
                  setForm({ ...form, category: e.target.value });
                }
              }}
            >
              {DEFAULT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="custom">Create your own</option>
            </select>

            <input
              type="text"
              value={form.category}
              placeholder="Custom category"
              className="field w-full rounded-xl px-4 py-3"
              onChange={(e) => {
                setCategoryMode("custom");
                setForm({ ...form, category: e.target.value });
              }}
            />
          </div>

          <button className="brown-button rounded-xl px-6 py-3 font-bold">
            Update Post
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditPost;
