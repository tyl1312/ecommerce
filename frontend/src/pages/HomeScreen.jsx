import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to our Website</h1>
      {user ? (
        <div>
          <p>Hello, {user.first_name} {user.last_name} ({user.email})</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
