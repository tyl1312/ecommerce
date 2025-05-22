import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [address, setAddress] = useState(user?.home_address || "");
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally, fetch user info from backend if not in context
    // Or update state if context user changes
    if (user) {
      setPhone(user.phone_number || "");
      setAddress(user.home_address || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          phone_number: phone,
          home_address: address,
          first_name: firstName,
          last_name: lastName
        }),
        credentials: "include"
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to update profile");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setSuccess("Profile updated!");
      
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Your Profile</h2>
      <div className="form-group double">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Home Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
      </div>
      <button className="submit-btn" type="submit">Save</button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </form>
  );
};

export default Profile;