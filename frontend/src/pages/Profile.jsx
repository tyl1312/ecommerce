import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
	const { user, setUser } = useAuth();
	const [username, setUsername] = useState(user?.username || "");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			setUsername(user.username || "");
		}
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem('accessToken')}`
				},
				body: JSON.stringify({
					username: username,
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
			navigate("/")

		} catch (err) {
			setError("Failed to update profile");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="login-form">
			<h2>Your Profile</h2>
			<div className="form-group">
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={e => setUsername(e.target.value)}
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