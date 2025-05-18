import React from "react";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 100 }}>
      <h1>Welcome to Our Shop</h1>
      <button style={{ margin: 12, padding: "12px 32px" }} onClick={() => navigate("/login")}>
        Login
      </button>
      <button style={{ margin: 12, padding: "12px 32px" }} onClick={() => navigate("/signup")}>
        Sign Up
      </button>
      <button style={{ margin: 12, padding: "12px 32px" }} onClick={() => navigate("/shop")}>
        Continue without account
      </button>
    </div>
  );
};

export default HomeScreen;