import React from "react";
import { useNavigate } from "react-router-dom";
import { UniversalForm } from "/src/components/FormsModalAuth/UniversalForm.jsx";
import { useUsers } from "../contexts/UsersContext.jsx";
import { ErrorNotification } from "../components/notification/ErrorNotification.jsx";
import { Spin } from "antd";

const SignUpPage = () => {
  const { registerUser, errorUser, state } = useUsers();
  const navigate = useNavigate();

  const handleFormSubmit = async (username, email, password) => {
    try {
      console.log("Registering user with:", { username, email, password });

      // Вызываем функцию регистрации
      const newUser = await registerUser(username, email, password);

      if (newUser) {
        // Перенаправляем пользователя на страницу входа после регистрации
        navigate("/signin");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="sign-up-page">
      {errorUser && <ErrorNotification errorResp={errorUser} />}

      <UniversalForm
        formType="createAccount"
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
};

export { SignUpPage };
