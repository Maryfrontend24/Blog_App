import React from "react";
import { useNavigate } from "react-router-dom";
import { UniversalForm } from "/src/components/FormsModalAuth/UniversalForm.jsx";
import { useUsers } from "../contexts/UsersContext.jsx";
import { ErrorNotification } from "../components/notification/ErrorNotification.jsx";
import { Spin } from "antd";
import { useForm } from "react-hook-form";

const SignUpPage = () => {
  const { registerUser, errorUser } = useUsers();
  const navigate = useNavigate();
  const { setError } = useForm();

  const handleFormSubmit = async (username, email, password) => {
    try {
      console.log("Registering user with:", { username, email, password });
      const newUser = await registerUser(username, email, password, setError);

      if (newUser) {
        // Перенаправляем
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
        setError={setError}
      />
    </div>
  );
};
export { SignUpPage };
