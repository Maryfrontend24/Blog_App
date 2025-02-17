import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useArticles } from "/src/contexts/ArticlesDataContext.jsx";
import { Spin } from "antd";

const FormArticle = ({ isEditing }) => {
  const { createArticle, updateArticle, fetchSingleArticle, state } =
    useArticles();
  const navigate = useNavigate();
  const { slug } = useParams(); // Если slug, то есть редактируем статью

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  // Загружаем статью для редактирования, если isEditing == true и slug есть
  useEffect(() => {
    if (slug && isEditing) {
      fetchSingleArticle(slug);
    }
  }, [slug, isEditing]);

  useEffect(() => {
    if (slug && state.singleArticle && state.singleArticle.slug === slug) {
      setTitle(state.singleArticle.title || "");
      setDescription(state.singleArticle.description || "");
      setText(state.singleArticle.body || "");
      setTags(state.singleArticle.tagList || []);
    }
  }, [state.singleArticle, slug]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You need to log in first!");
      navigate("/login");
      return;
    }

    if (!title || !description || !text) {
      alert("Please fill in all fields!");
      return;
    }

    const articleData = { title, description, body: text, tagList: tags };

    try {
      setIsSubmitting(true);

      if (slug && isEditing) {
        await updateArticle(slug, articleData, token);
      } else {
        await createArticle(articleData, token);
      }

      navigate("/articles"); // Перенаправление
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false); // Сбрасываем состояние после завершения запроса
    }
  };

  return (
    <div className="article-form-container">
      <h2>{slug ? "Edit Article" : "Create New Article"}</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Short Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        <label>Tags</label>
        <div className="tags-container">
          {tags.map((tag, index) => (
            <div key={index} className="tag">
              <span>{tag}</span>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleRemoveTag(tag)}
              >
                Delete
              </button>
            </div>
          ))}
          <div className="tag-input">
            <input
              type="text"
              placeholder="Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              type="button"
              className="add-tag-btn"
              onClick={handleAddTag}
            >
              Add Tag
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {slug ? "Update Article" : "Create Article"}
        </button>

        {isSubmitting && (
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <Spin size="small" />
          </div>
        )}
      </form>
    </div>
  );
};

export { FormArticle };
