import { Flex, Button, Space, Avatar } from "antd";
import React from "react";
import {
  CheckCircleTwoTone,
  HeartTwoTone,
  SmileTwoTone,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useUsers } from "/src/contexts/UsersContext.jsx";
import defImage from "/src/assets/defImage.jpg";

const Header = () => {
  const { state, logoutUser } = useUsers();

  const isAuthenticated = !!state.token && !!state.username;

  return (
    <Flex className="header" justify="space-between">
      <div className="home">
        <NavLink to="/articles" className="link-home">
          <span>Realworld Blog</span>
          <Space className="icon">
            <SmileTwoTone />
            <HeartTwoTone twoToneColor="#eb2f96" />
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          </Space>
        </NavLink>
      </div>
      {isAuthenticated ? (
        <div className="header-auth">
          <NavLink to="/create-article">
            <Button className="create-article" type="default">
              Create article
            </Button>
          </NavLink>
          <div className="avatar-flex">
            <div className="text">
              <div className="author-article" style={{ fontSize: "15" }}>
                {state.username || "User"}
              </div>
            </div>
            <NavLink to="/profile">
              <Avatar className="userAvatar" src={state?.image || defImage} />
            </NavLink>
          </div>
          <Button className="logout" type="default" onClick={logoutUser}>
            Log Out
          </Button>
        </div>
      ) : (
        /* Гость */
        <div className="header-novigation__login">
          <span>
            <NavLink to="/signin" className="link">
              Sign In
            </NavLink>
          </span>
          <span className="create-account">
            <NavLink to="/signup" className="link">
              Sign Up
            </NavLink>
          </span>
        </div>
      )}
    </Flex>
  );
};

export default Header;
