import React, { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant.jsx";
import { useNavigate } from "react-router-dom";
import defImage from "/src/assets/defImage.jpg";

const UsersContext = createContext();

// state user
const initialState = {
  username: "",
  email: "",
  bio: "",
  image: "",
  errorUser: null,
  userIsEdit: false,
  userStatusRequest: null,
  token: localStorage.getItem("token"),
  serverErrors: null,
  lastFailedAttempt: { email: null, password: null },
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
        serverErrors: null,
      };
    case "ERROR":
      return {
        ...state,
        errorUser: action.payload,
        userStatusRequest: "rejected",
        serverError: action.payload === "500" ? "500" : null,
      };
    case "SET_LAST_FAILED_ATTEMPT":
      return {
        ...state,
        lastFailedAttempt: action.payload, // Обновляем данные о последней неудачной попытке
        errorUser: action.payload.email
          ? state.errorUser || "Incorrect email or password. Try again." // Не сбрасываем ошибку
          : state.errorUser,
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
        serverErrors: null,
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
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;

      // Загружаем пользователя из LocalStr
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: user });
      }
    }
  }, []);

  const registerUser = async (username, email, password) => {
    dispatch({ type: "SET_LOADING" });

    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        user: { username, email, password },
      });

      console.log("User registered successfully:", response.data);
      navigate("/signin");
    } catch (error) {
      console.error("Error during registration:", error);

      const errorMessage =
        error.response && error.response.data.errors
          ? error.response.data.errors.body[0]
          : error.response
            ? `Error ${error.response.status}: ${error.response.statusText}`
            : error.message || "Network error";

      if (error.response && error.response.status === 500) {
        dispatch({
          type: "ERROR",
          payload: "500",
        });
      } else {
        dispatch({
          type: "ERROR",
          payload: errorMessage,
        });
      }
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

  const fetchLoginUser = async (email, password) => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      axios.defaults.headers.common["Authorization"] = `Token ${storedToken}`;
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: user });
      }
      navigate("/articles");
      return;
    }

    if (
      state.lastFailedAttempt.email === email &&
      state.lastFailedAttempt.password === password
    ) {
      dispatch({
        type: "ERROR",
        payload: "Incorrect email or password. Try again.",
      });
      return; // не отправляем запроc!
    }

    if (
      state.lastFailedAttempt.email !== email ||
      state.lastFailedAttempt.password !== password
    ) {
      dispatch({
        type: "SET_LAST_FAILED_ATTEMPT",
        payload: { email: null, password: null },
      });
    }

    dispatch({ type: "SET_LOADING" });

    const timeout = setTimeout(() => {
      dispatch({
        type: "ERROR",
        payload: "Request timeout. Please try again.",
      });
      dispatch({ type: "STOP_LOADING" });
    }, 10000);

    try {
      const response = await axios.post(
        `${BASE_URL}/users/login`,
        { user: { email, password } },
        { headers: { "Content-Type": "application/json" } },
      );

      const { user } = response.data;

      if (!user?.token) {
        throw new Error("Token not received or invalid");
      }

      clearTimeout(timeout);

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
      localStorage.setItem("token", user.token);

      axios.defaults.headers.common["Authorization"] = `Token ${user.token}`;

      dispatch({ type: "SET_USER", payload: user });

      // После успешного входа сбрасываем данные о  попытке
      dispatch({
        type: "SET_LAST_FAILED_ATTEMPT",
        payload: { email: null, password: null },
      });

      navigate("/articles");
    } catch (error) {
      clearTimeout(timeout);

      const errorMessage =
        error.response && error.response.data.errors
          ? error.response.data.errors.body[0]
          : error.response
            ? `Error ${error.response.status}: ${error.response.statusText}`
            : error.message || "Network error";

      if (error.response?.status === 500) {
        dispatch({
          type: "ERROR",
          payload: "Internal Server Error. Please try again later.",
        });
        alert("Произошла ошибка на сервере. Перенаправляем на главную.");
        setTimeout(() => navigate("/"), 3000);
      } else {
        dispatch({ type: "ERROR", payload: errorMessage });

        // Сохраняем данные неудачного входа
        dispatch({
          type: "SET_LAST_FAILED_ATTEMPT",
          payload: { email, password },
        });
      }
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
          image: updatedUser.image,
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

  // выход
  const logoutUser = () => {
    // Очищаем токен и данные из localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    delete axios.defaults.headers.common["Authorization"];

    dispatch({ type: "LOGOUT" });

    navigate("/signin");
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
