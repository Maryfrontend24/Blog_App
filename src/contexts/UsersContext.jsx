import React, { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant.jsx";
import { useNavigate } from "react-router-dom";
import defImage from "/src/assets/defImage.jpg";

const UsersContext = createContext();

// state User
const initialState = {
  username: "",
  email: "",
  bio: "",
  image: "",
  errorUser: null,
  userIsEdit: false,
  userStatusRequest: null,
  token: localStorage.getItem("token"),
};

console.log("Initial token:", localStorage.getItem("token"));

// Редьюсер
const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, userStatusRequest: "pending" };
    case "STOP_LOADING":
      return { ...state, userStatusRequest: "fulfilled" };
    case "SET_USER":
      return {
        ...state,
        username: action.payload.username,
        email: action.payload.email,
        bio: action.payload.bio,
        token: action.payload.token,
        image: action.payload.image || defImage,
        userIsEdit: true,
        userStatusRequest: "fulfilled",
      };
    case "ERROR":
      return {
        ...state,
        errorUser: action.payload,
        userStatusRequest: "rejected",
      };
    case "CLEAR_ERROR":
      return { ...state, errorUser: null };
    case "LOGOUT":
      return {
        ...state,
        username: "",
        email: "",
        bio: "",
        image: "",
        userIsEdit: false,
        token: null,
        userStatusRequest: "fulfilled",
      };
    default:
      return state;
  }
};

// Провайдер
export const UsersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token"); // Проверяем токен

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      axios.defaults.headers.common["Authorization"] = `Token ${token}`; // Устанавливаем токен в заголовки для axios
      dispatch({
        type: "SET_USER",
        payload: parsedUser,
      });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const registerUser = async (username, email, password) => {
    dispatch({ type: "SET_LOADING" });

    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        user: { username, email, password },
      });

      console.log("User registered successfully:", response.data);
      navigate("/signin"); // Перенаправляем на страницу входа
    } catch (error) {
      console.error("Error during registration:", error);
      dispatch({
        type: "ERROR",
        payload: error.response ? error.response.data : "Network error",
      });
    } finally {
      dispatch({ type: "STOP_LOADING" }); // Выключаем состояние загрузки
    }
  };

  const fetchLoginUser = async (email, password) => {
    dispatch({ type: "SET_LOADING" });

    try {
      const response = await axios.post(
        `${BASE_URL}/users/login`,
        {
          user: {
            email,
            password,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { user } = response.data;

      if (!user || !user.token) {
        throw new Error("Token not received or invalid");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username,
          email: user.email,
          bio: user.bio,
          image: user.image,
          token: user.token,
        }),
      );

      localStorage.setItem("token", user.token); // Сохраняем токен отдельно

      axios.defaults.headers.common["Authorization"] = `Token ${user.token}`;

      dispatch({
        type: "SET_USER",
        payload: {
          username: user.username,
          email: user.email,
          bio: user.bio,
          image: user.image,
          token: user.token,
        },
      });

      navigate("/articles");
    } catch (error) {
      const errorMessage =
        error.response && error.response.data.errors
          ? error.response.data.errors.body[0]
          : error.message || "Network error";

      dispatch({
        type: "ERROR",
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  const updateUserProfile = async (username, email, newPassword, avatarUrl) => {
    dispatch({ type: "SET_LOADING" });

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user ? user.token : null;

      const dataToUpdate = {
        user: {
          username,
          email,
          bio: "",
          image: avatarUrl || "",
        },
      };

      if (newPassword) {
        dataToUpdate.user.password = newPassword;
      }

      const response = await axios.put(`${BASE_URL}/user`, dataToUpdate, {
        headers: { Authorization: `Token ${token}` },
      });

      const { user: updatedUser } = response.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          image: updatedUser.image, // Обновленное изображение
          token,
        }),
      );

      dispatch({
        type: "SET_USER",
        payload: {
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio,
          image: updatedUser.image,
          token,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error("Error during profile update:", error);
      dispatch({
        type: "ERROR",
        payload: error.response ? error.response.statusText : "Network error",
      });
      throw error;
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  // для выхода пользователя
  const logoutUser = () => {
    console.log("Logging out...");

    // Удаляем из localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Удаляем данные пользователя
    console.log("Token and user data removed from localStorage");

    // Удаляем заголовок авторизации для axios
    delete axios.defaults.headers.common["Authorization"];
    console.log("Authorization header removed");
    dispatch({ type: "LOGOUT" });
    console.log("Dispatching LOGOUT action");

    // Перенаправляем
    navigate("/signin");
    console.log("Redirecting to /signin");
  };

  return (
    <UsersContext.Provider
      value={{
        state,
        fetchLoginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers must be used within an UsersProvider");
  }

  return context;
};
