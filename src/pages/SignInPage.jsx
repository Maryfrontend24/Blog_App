import React, { useState } from "react";
import { useUsers } from "../contexts/UsersContext.jsx";
// eslint-disable-next-line no-unused-vars
import { UniversalForm } from "../components/FormsModalAuth/UniversalForm.jsx";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"; // Импортируем useNavigate

const SignInPage = () => {
  const { fetchLoginUser, errorUser } = useUsers();
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { setError } = useForm();

  const handleFormSubmit = async (user) => {
    try {
      console.log("Logging in user with:", user);
      await fetchLoginUser(user.email, user.password);
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 500) {
        navigate("/");
      } else {
        setIsError(true);
      }
    }
  };
  return (
    <div>
      {isError || errorUser ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Ошибка входа</h1>
          <p>{errorUser || "Произошла ошибка при входе."}</p>
        </div>
      ) : (
        <UniversalForm
          formType="signIn"
          handleFormSubmit={handleFormSubmit}
          setError={setError}
        />
      )}
    </div>
  );
};

export { SignInPage };
