
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
    const [login, setLogin] = useState({
        loginId: "",
        loginPassword: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    // clear the local stirage when in the login page
    localStorage.clear()
    const API_URL = import.meta.env.VITE_API_URL;

    // Handle login API request
    const handleLogin = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                login,
                {
                    withCredentials: true
                }
            );

            console.log(response.data);
            if (!response.data.status === 200) {
                setErrorMessage(
                    response.data.message || "Unable to login."
                );
                
            } 
            navigate("/dashboard");
            
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">S</div>

                    <h1>Welcome back</h1>

                    <p>
                        Sign in to your ServiceHub provider account.
                    </p>
                </div>

                {/* Login Form */}
                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >
                    <div className="form-group">
                        <label htmlFor="loginId">
                            Username or Email
                        </label>

                        <input
                            id="loginId"
                            type="text"
                            name="loginId"
                            placeholder="Enter your username or email"
                            autoComplete="username"
                            value={login.loginId}
                            required
                            onChange={(e) =>
                                setLogin({
                                    ...login,
                                    loginId: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="loginPassword">
                            Password
                        </label>

                        <input
                            id="loginPassword"
                            type="password"
                            name="loginPassword"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={login.loginPassword}
                            required
                            onChange={(e) =>
                                setLogin({
                                    ...login,
                                    loginPassword: e.target.value
                                })
                            }
                        />
                    </div>

                    {errorMessage && (
                        <p className="auth-error">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <a href="/register">
                            Create account
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;
