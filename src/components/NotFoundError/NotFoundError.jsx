import React from "react";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const NotFoundError = ({ errorMessage }) => {
  return (
    <Result
      status="500"
      title="500"
      subTitle={
        errorMessage || "Sorry, there was an error loading the articles."
      }
      extra={
        <Button type="primary">
          <Link to="/">Go to Home Page</Link>
        </Button>
      }
    />
  );
};

export { NotFoundError };
