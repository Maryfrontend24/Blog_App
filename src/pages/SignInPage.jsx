import React from "react";
import { useUsers } from "../contexts/UsersContext.jsx";
import { UniversalForm } from "../components/FormsModalAuth/UniversalForm.jsx";
import { ErrorNotification } from "../components/notification/ErrorNotification.jsx";

const SignInPage = () => {
  const { fetchLoginUser, errorUser } = useUsers(); // Используем контекст

  const handleFormSubmit = async (user) => {
    try {
      console.log("Logging in user with:", user);

      await fetchLoginUser(user.email, user.password); // Вызываем функцию логина из контекста
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {errorUser && <ErrorNotification errorResp={errorUser} />}{" "}
      <UniversalForm handleFormSubmit={handleFormSubmit} formType="signIn" />
    </>
  );
};

export { SignInPage };
