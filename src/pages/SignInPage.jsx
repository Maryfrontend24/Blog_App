// import React from "react";
// import { useUsers } from "../contexts/UsersContext.jsx";
// import { UniversalForm } from "../components/FormsModalAuth/UniversalForm.jsx";
// import { ErrorNotification } from "../components/notification/ErrorNotification.jsx";
//
// const SignInPage = () => {
//   const { fetchLoginUser, errorUser } = useUsers(); // Используем контекст
//
//   const handleFormSubmit = async (user) => {
//     try {
//       console.log("Logging in user with:", user);
//
//       await fetchLoginUser(user.email, user.password); // Вызываем функцию логина из контекста
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };
//
//   return (
//     <>
//       {errorUser && <ErrorNotification errorResp={errorUser} />}{" "}
//       <UniversalForm handleFormSubmit={handleFormSubmit} formType="signIn" />
//     </>
//   );
// };
//
// export { SignInPage };

import React, { useState } from "react";
import { useUsers } from "../contexts/UsersContext.jsx";
import { UniversalForm } from "../components/FormsModalAuth/UniversalForm.jsx";
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate
import { ErrorNotification } from "../components/notification/ErrorNotification.jsx";

const SignInPage = () => {
  const { fetchLoginUser, errorUser } = useUsers(); // Используем контекст
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate(); // Инициализация navigate для редиректа

  const handleFormSubmit = async (user) => {
    try {
      console.log("Logging in user with:", user);
      await fetchLoginUser(user.email, user.password); // Вызываем функцию логина из контекста
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 500) {
        // Если ошибка 500, редиректим на главную страницу
        navigate("/"); // Переходим на главную страницу
      } else {
        // В остальных случаях показываем ошибку
        setIsError(true);
      }
    }
  };

  return (
    <div>
      {isError || errorUser ? (
        // Если произошла ошибка, показываем компонент ошибки
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Ошибка входа</h1>
          <p>{errorUser || "Произошла ошибка при входе."}</p>
        </div>
      ) : (
        // Если ошибки нет, показываем форму
        <UniversalForm handleFormSubmit={handleFormSubmit} formType="signIn" />
      )}
    </div>
  );
};

export { SignInPage };
