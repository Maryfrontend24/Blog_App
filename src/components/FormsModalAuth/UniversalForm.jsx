import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "/src/contexts/UsersContext.jsx";
import { Spin } from "antd";

const UniversalForm = ({ formType }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const { registerUser, fetchLoginUser, updateUserProfile, state } = useUsers();
  const { userStatusRequest } = state;
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastFailedLogin = useRef({ email: "", password: "" });

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    if (
      formType === "signIn" &&
      data.email === lastFailedLogin.current.email &&
      data.password === lastFailedLogin.current.password
    ) {
      return;
    }

    setIsSubmitting(true);

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
        user = await registerUser(data.username, data.email, data.password);
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

      if (error?.response?.data?.errors) {
        const errorsFromServer = error.response.data.errors;
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
        setError("password", {
          type: "server",
          message: "Invalid email or password",
        });

        setLoginError("Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
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
              {...register("username", { required: "Username is required" })}
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
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              {...register("password", { required: "Password is required" })}
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
              {...register("repeatPassword", {
                required: "Repeat your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
            />
            {errors.repeatPassword && (
              <p className="error">{errors.repeatPassword.message}</p>
            )}
          </div>

          <div className="form-group__checkbox">
            <input
              type="checkbox"
              {...register("agree", { required: "You must agree" })}
            />
            <label>I agree to the processing of my personal information</label>
            {errors.agree && <p className="error">{errors.agree.message}</p>}
          </div>
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
              {...register("username", { required: "Username is required" })}
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
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              {...register("newPassword", {
                minLength: {
                  value: 6,
                  message: "Password must contain 6-40 characters",
                },
                maxLength: {
                  value: 40,
                  message: "Password must contain 6-40 characters",
                },
              })}
            />
            {errors.newPassword && (
              <p className="error">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Avatar Image (URL):</label>
            <input
              type="text"
              name="avatarUrl"
              {...register("avatarUrl", {
                pattern: {
                  value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
                  message: "Invalid URL",
                },
              })}
            />
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

      {userStatusRequest === "pending" && <Spin fullscreen />}

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
