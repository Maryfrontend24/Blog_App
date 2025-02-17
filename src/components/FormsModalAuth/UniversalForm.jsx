import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "/src/contexts/UsersContext.jsx";
import { Spin } from "antd";

const UniversalForm = ({ formType }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const { registerUser, fetchLoginUser, updateUserProfile, state, errorUser } =
    useUsers();
  const { userStatusRequest } = state;
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      let user;

      if (formType === "signIn") {
        user = await fetchLoginUser(data.email, data.password);
        if (user) navigate("/");
      }

      if (formType === "createAccount") {
        user = await registerUser(data.username, data.email, data.password);
        if (user) navigate("/signin");
      }

      if (formType === "editProfile") {
        user = await updateUserProfile(
          data.username,
          data.email,
          data.newPassword,
          data.avatarUrl,
        );
        if (user) navigate("/articles");
      }
    } catch (error) {
      if (error?.response?.data) {
        Object.keys(error.response.data.errors).forEach((field) => {
          setError(field, {
            type: "server",
            message: error.response.data.errors[field],
          });
        });
      } else {
        setError("general", {
          type: "server",
          message: "Something went wrong!",
        });
      }
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
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Must be at least 3 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Must be at most 20 characters",
                },
              })}
            />
            {errors.username && (
              <p className="error">{errors.username.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email address:</label>
            <input
              type="email"
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
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Must be at least 6 characters",
                },
                maxLength: {
                  value: 40,
                  message: "Must be at most 40 characters",
                },
              })}
            />
            {errors.password && (
              <p className="error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Repeat Password:</label>
            <input
              type="password"
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
              {...register("newPassword", {
                minLength: {
                  value: 6,
                  message: "Password must contains from 6 to 40 characters",
                },
                maxLength: {
                  value: 40,
                  message: "Password must contains from 6 to 40 characters",
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

      <button type="submit" disabled={userStatusRequest === "pending"}>
        {formType === "signIn"
          ? "Login"
          : formType === "createAccount"
            ? "Create"
            : "Save"}
      </button>

      {userStatusRequest === "pending" && <Spin fullscreen />}
      {errorUser && <p className="error">{errorUser}</p>}

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
