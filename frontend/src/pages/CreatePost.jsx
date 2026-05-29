import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { DEFAULT_CATEGORIES } from "../constants/categories";

function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("General");
  const [categoryMode, setCategoryMode] = useState("default");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/posts", {
        title,
        summary,
        image,
        category,
        tags: parsedTags,
        content,
      });

      alert("Post created!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Failed to create post");
    }
  };

  return (
    <main className="page-wrap">
      <section className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
          New story
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#2b1710]">
          Create Post
        </h1>
      </section>

      <form onSubmit={handleSubmit} className="panel rounded-2xl p-6 sm:p-8">
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field w-full rounded-xl px-4 py-3"
            required
          />

          <input
            type="text"
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="field w-full rounded-xl px-4 py-3"
          />

          <input
            type="url"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="field w-full rounded-xl px-4 py-3"
          />

          <div>
            <input
              type="text"
              placeholder="Tags, separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="field w-full rounded-xl px-4 py-3"
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

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <select
              value={categoryMode === "custom" ? "custom" : category}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setCategoryMode("custom");
                  setCategory("");
                } else {
                  setCategoryMode("default");
                  setCategory(e.target.value);
                }
              }}
              className="field w-full rounded-xl px-4 py-3"
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
              placeholder="Custom category"
              value={category}
              onChange={(e) => {
                setCategoryMode("custom");
                setCategory(e.target.value);
              }}
              className="field w-full rounded-xl px-4 py-3"
            />
          </div>

          <textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="12"
            className="field min-h-72 w-full rounded-xl px-4 py-3"
            required
          />

          <button type="submit" className="brown-button rounded-xl px-6 py-3 font-bold">
            Publish
          </button>
        </div>
      </form>
    </main>
  );
}

export default CreatePost;
