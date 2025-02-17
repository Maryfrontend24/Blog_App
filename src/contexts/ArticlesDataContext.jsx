import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";
import { BASE_URL } from "../utils/constant.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ArticlesContext = createContext();

// state Article
const initialState = {
  articles: [],
  singleArticle: null,
  articlesCount: null,
  articleRequestStatus: "",
  errorArticleServer: null,
  articleIsCreated: false,
  loadingArticles: false,
  loadingArticle: false,
  likeCount: 0,
  favorited: false,
};
// Редьюсер
const articleReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING_ARTICLES":
      return { ...state, loadingArticles: action.payload };
    case "SET_LOADING_ARTICLE":
      return { ...state, loadingArticle: action.payload };
    case "SET_ARTICLES":
      return { ...state, articles: action.payload, articleRequestStatus: "" };
    case "SET_SINGLE_ARTICLE":
      return {
        ...state,
        singleArticle: action.payload,
        articleRequestStatus: "",
      };
    case "SET_ARTICLES_COUNT":
      return { ...state, articlesCount: action.payload };
    case "UPDATE_FAVORITED_ARTICLE":
      return {
        ...state,
        articles: state.articles.map((article) =>
          article.slug === action.payload.slug ? action.payload : article,
        ),
      };
    case "PENDING":
      return {
        ...state,
        articleRequestStatus: "pending",
        errorArticleServer: null,
      };
    case "ERROR":
      return {
        ...state,
        errorArticleServer: action.payload,
        articleRequestStatus: "",
      };
    case "CREATE_SUCCESS":
      return {
        ...state,
        articleIsCreated: true,
        articles: [action.payload, ...state.articles],
      };
    case "CLEAR_ERROR":
      return { ...state, errorArticleServer: null };
    case "LIKE_ARTICLE":
      return {
        ...state,
        articles: state.articles.map((article) =>
          article.slug === action.payload.slug
            ? {
                ...article,
                favorited: !article.favorited,
                favoritesCount: article.favorited
                  ? article.favoritesCount - 1
                  : article.favoritesCount + 1,
              }
            : article,
        ),
      };
    case "DELETE_ARTICLE":
      return {
        ...state,
        articles: state.articles.filter(
          (article) => article.slug !== action.payload,
        ),
        articleRequestStatus: "",
      };
    default:
      return state;
  }
};

export const ArticlesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(articleReducer, initialState);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // const getArticleList = async () => {
  //   dispatch({ type: "SET_LOADING_ARTICLES", payload: true });
  //   const url = `${BASE_URL}/articles`;
  //   const offset = (currentPage - 1) * limit;
  //
  //   try {
  //     const res = await axios.get(url, {
  //       params: {
  //         limit: limit,
  //         offset: offset,
  //       },
  //     });
  //
  //     if (res.data.articles) {
  //       dispatch({ type: "SET_ARTICLES", payload: res.data.articles });
  //       dispatch({
  //         type: "SET_ARTICLES_COUNT",
  //         payload: res.data.articlesCount,
  //       });
  //     } else {
  //       console.error("Articles not found :(");
  //     }
  //   } catch (error) {
  //     dispatch({
  //       type: "ERROR",
  //       payload: error.message || "Произошла ошибка при получении статей",
  //     });
  //   } finally {
  //     dispatch({ type: "SET_LOADING_ARTICLES", payload: false });
  //   }
  // };
  //
  // useEffect(() => {
  //   getArticleList();
  // }, [currentPage]);

  const getArticleList = async () => {
    dispatch({ type: "SET_LOADING_ARTICLES", payload: true });
    const url = `${BASE_URL}/articles`;
    const offset = (currentPage - 1) * limit;

    try {
      const res = await axios.get(url, {
        params: {
          limit: limit,
          offset: offset,
        },
      });

      if (res.data.articles) {
        dispatch({ type: "SET_ARTICLES", payload: res.data.articles });
        dispatch({
          type: "SET_ARTICLES_COUNT",
          payload: res.data.articlesCount,
        });
      } else {
        console.error("Articles not found :(");
      }
    } catch (error) {
      // Обработка ошибки, например, ошибка 500
      const errorMessage =
        error.response && error.response.status === 500
          ? "Internal Server Error. Please try again later."
          : error.message || "Произошла ошибка при получении статей";

      dispatch({
        type: "ERROR",
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: "SET_LOADING_ARTICLES", payload: false });
    }
  };

  useEffect(() => {
    getArticleList();
  }, [currentPage]);

  const fetchSingleArticle = async (slug) => {
    dispatch({ type: "SET_LOADING_ARTICLE", payload: true });
    try {
      const response = await axios.get(`${BASE_URL}/articles/${slug}`);
      dispatch({ type: "SET_SINGLE_ARTICLE", payload: response.data.article });
    } catch (error) {
      const errorMessage =
        error.response && error.response.status === 500
          ? "Internal Server Error. Please try again later."
          : error.response
            ? error.response.statusText
            : "Network error";
      dispatch({ type: "ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING_ARTICLE", payload: false });
    }
  };

  const createArticle = async (articleData, token) => {
    dispatch({ type: "SET_LOADING_ARTICLE", payload: true });

    try {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.post(
        `${BASE_URL}/articles`,
        { article: articleData },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      dispatch({ type: "CREATE_SUCCESS", payload: response.data.article });

      return response.data.article;
    } catch (error) {
      dispatch({
        type: "ERROR",
        payload: error.response?.data || "Network error",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING_ARTICLE", payload: false });
    }
  };

  const updateArticle = async (slug, articleData, token) => {
    dispatch({ type: "PENDING" });

    try {
      const response = await axios.put(
        `${BASE_URL}/articles/${slug}`,
        { article: articleData },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      dispatch({ type: "SET_SINGLE_ARTICLE", payload: response.data.article });
    } catch (error) {
      const errorMessage = error.response
        ? error.response.statusText
        : "Network error";
      dispatch({ type: "ERROR", payload: errorMessage });
      console.error("Error updating article:", error);
    }
  };

  const deleteArticle = async (slug, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/articles/${slug}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Если код ответа 200 или 204,то удаление прошло успешно
      if (response.status === 200 || response.status === 204) {
        dispatch({ type: "DELETE_ARTICLE", payload: slug });

        // Переадресовываем
        navigate("/articles");
      } else {
        dispatch({
          type: "ERROR",
          payload: "Failed to delete article: " + response.statusText,
        });
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      dispatch({
        type: "ERROR",
        payload: error.response ? error.response.statusText : "Network error",
      });
    }
  };

  // Like
  const favoriteArticle = async (slug, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/articles/${slug}/favorite`, // Используем BASE_URL
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Обновляем статью в состоянии
      dispatch({
        type: "UPDATE_FAVORITED_ARTICLE",
        payload: response.data.article,
      });
    } catch (error) {
      console.error("Error favoriting article:", error);
      throw error;
    }
  };

  return (
    <ArticlesContext.Provider
      value={{
        state,
        error,
        dispatch,
        setError,
        currentPage,
        setCurrentPage,
        fetchSingleArticle,
        getArticleList,
        createArticle,
        updateArticle,
        deleteArticle,
        favoriteArticle,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticlesContext);

  if (!context) {
    throw new Error("useArticles must be used within an ArticlesProvider");
  }
  return context;
};
