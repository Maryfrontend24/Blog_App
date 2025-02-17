import React from "react";
import { useNavigate } from "react-router-dom";
import { UniversalForm } from "/src/components/FormsModalAuth/UniversalForm.jsx";
import { useUsers } from "../contexts/UsersContext.jsx";
import { ErrorNotification } from "../components/notification/ErrorNotification.jsx"; //

const EditAuthorProfile = () => {
  const { updateUserProfile, errorUser } = useUsers();
  const navigate = useNavigate();

  const handleFormSubmit = async (username, email, newPassword, avatarUrl) => {
    try {
      const updatedUser = await updateUserProfile(
        username,
        email,
        newPassword,
        avatarUrl,
      );

      if (updatedUser) {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="edit-profile-page">
      {errorUser && <ErrorNotification errorResp={errorUser} />}

      <UniversalForm
        formType="editProfile"
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
};

export { EditAuthorProfile };
