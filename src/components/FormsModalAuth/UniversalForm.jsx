import { useUsers } from "/src/contexts/UsersContext.jsx";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, Link } from "react-router-dom";
import * as yup from "yup";
import { Spin } from "antd";

const validationSchemas = {
  signIn: yup.object().shape({
    email: yup
      .string()
      .required("Email address is required")
      .matches(
        /(^[a-z][a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/,
        "Invalid email address",
      ),
    password: yup.string().required("Password is required"),
  }),

  createAccount: yup.object().shape({
    username: yup
      .string()
      .min(3, "Username must be 3-20 characters")
      .max(20, "Username must be 3-20 characters")
      .required("Username is required"),
    email: yup
      .string()
      .required("Email address is required")
      .matches(
        /(^[a-z][a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/,
        "Email must start with a lowercase",
      ),
    password: yup
      .string()
      .min(6, "Password must be 6-40 characters")
      .max(40, "Password must be 6-40 characters")
      .required("Password is required"),
    repeatPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Repeat your password"),
    agree: yup.boolean().oneOf([true], "You must agree to proceed"),
  }),
  editProfile: yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup
      .string()
      .required("Email is required")
      .matches(
        /(^[a-z][a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/,
        "Email must start with a lowercase letter o corrected",
      ),
    newPassword: yup
      .string()
      .test(
        "isValidLength",
        "Password must contain 6-40 characters",
        (value) => {
          if (!value) return true;
          return value.length >= 6 && value.length <= 40;
        },
      ),
    avatarUrl: yup
      .string()
      .url("Invalid URL")
      .matches(/^https?:\/\//, "URL must start with http:// or https://")
      .nullable()
      .notRequired(),
  }),
};

const UniversalForm = ({ formType }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchemas[formType]),
  });

  useEffect(() => {
    console.log("Updated errors в useEffect:", errors);
  }, [errors]);

  const { registerUser, fetchLoginUser, updateUserProfile, state } = useUsers();
  const { userStatusRequest } = state;
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [signUpError, setSignUpError] = useState(null);

  const lastFailedLogin = useRef({ email: "", password: "" });
  const lastFailedSignUp = useRef({ email: "", username: "" });

  useEffect(() => {
    setLoginError(null);
    setSignUpError(null);
  }, [watch("email"), watch("password"), watch("username")]); // Очищаем ошибки при вводе новых данных

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    if (formType === "signIn") {
      if (
        data.email === lastFailedLogin.current.email &&
        data.password === lastFailedLogin.current.password
      ) {
        setLoginError("Incorrect data. Try again, please");
        return;
      }
    }

    if (formType === "createAccount") {
      if (
        data.email === lastFailedSignUp.current.email &&
        data.username === lastFailedSignUp.current.username
      ) {
        setSignUpError("These login or email is already taken! Try again");
        return;
      }
    }

    setIsSubmitting(true);
    setLoginError(null);
    setSignUpError(null);

    try {
      let user;
      if (formType === "signIn") {
        const token = localStorage.getItem("token");
        if (token) {
          navigate("/");
          return;
        }
        user = await fetchLoginUser(data.email, data.password);
        if (user) {
          navigate("/");
        }
      }

      if (formType === "createAccount") {
        user = await registerUser(
          data.username,
          data.email,
          data.password,
          setError,
        );
        if (user) {
          navigate("/signin");
        }
      }

      if (formType === "editProfile") {
        user = await updateUserProfile(
          data.username,
          data.email,
          data.newPassword,
          data.avatarUrl,
        );
        if (user) {
          navigate("/articles");
        }
      }
    } catch (error) {
      if (formType === "signIn") {
        lastFailedLogin.current = {
          email: data.email,
          password: data.password,
        };
      }

      if (formType === "createAccount") {
        lastFailedSignUp.current = {
          email: data.email,
          username: data.username,
        };
      }

      if (error?.response?.data?.errors) {
        const errorsFromServer = error.response.data.errors;
        console.log("Received errors from server:", errorsFromServer);

        if (errorsFromServer.username) {
          setError("username", {
            type: "server",
            message: "Username is already taken",
          });
        }

        if (errorsFromServer.email) {
          setError("email", {
            type: "server",
            message: errorsFromServer.email,
          });
        }

        if (errorsFromServer.password) {
          setError("password", {
            type: "server",
            message: errorsFromServer.password,
          });
        }

        if (errorsFromServer.general) {
          setError("password", {
            type: "server",
            message: errorsFromServer.general,
          });
        }
      } else {
        if (formType === "signIn") {
          setLoginError("Incorrect data. Try again, please");
        }
        if (formType === "createAccount") {
          setSignUpError("These login or email is already taken! Try again");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("errors в UniversalForm", errors);

  return (
    <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
      <h2>
        {formType === "signIn"
          ? "Sign In"
          : formType === "createAccount"
            ? "Create new account"
            : "Edit Profile"}
      </h2>

      {formType === "signIn" && (
        <>
          <div className="form-group">
            <label>Email address:</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
            {loginError && <p className="error">{loginError}</p>}
          </div>
        </>
      )}

      {formType === "createAccount" && (
        <>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              {...register("username")}
              className={errors.username ? "error-input" : ""}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email address:</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
            {signUpError && <p className="error">{signUpError}</p>}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Repeat Password:</label>
            <input
              type="password"
              name="repeatPassword"
              autoComplete="new-password"
              {...register("repeatPassword")}
            />
            {errors.repeatPassword && (
              <p className="error">{errors.repeatPassword.message}</p>
            )}
          </div>

          <div className="form-group__checkbox">
            <input type="checkbox" {...register("agree")} />
            <label>I agree to the processing of my personal information</label>
            {errors.agree && <p className="error">{errors.agree.message}</p>}
          </div>
          {/*{signUpError && <p className="error">{signUpError}</p>}*/}
        </>
      )}

      {formType === "editProfile" && (
        <>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="error-message">{errors.username.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email address:</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="error">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Avatar Image (URL):</label>
            <input type="text" name="avatarUrl" {...register("avatarUrl")} />
            {errors.avatarUrl && (
              <p className="error">{errors.avatarUrl.message}</p>
            )}
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting || userStatusRequest === "pending"}
      >
        {formType === "signIn"
          ? "Login"
          : formType === "createAccount"
            ? "Create"
            : "Save"}
      </button>

      {isSubmitting && <Spin fullscreen />}
      <div className="sign-in">
        {formType === "signIn" ? (
          <p>
            Don’t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        ) : formType === "createAccount" ? (
          <p>
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        ) : null}
      </div>
    </form>
  );
};

export { UniversalForm };
