
import React, { useState } from "react";
import axios from "axios";
import "./register.css";
import {userValidation} from '../utilityFunctions'
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [register, setRegister] = useState({
        email: "",
        username: "",
        password: ""
    });

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate =  useNavigate()

    // Handle registration
    const handleRegistration = async (e) => {
        e.preventDefault();

        try {
            console.log(register);
            // check the user input valid or not
            const checkUserInput = userValidation(register)
            const response = await axios.post(
                `${API_URL}/api/auth/register`,
                register,
                {
                    withCredentials: true
                }
            );

            console.log(response.data);
            if(response.data.status ===  201){
                console.log("User registration succesful")
                navigate("/login")
            }
            return;

        } catch (error) {
            console.error(
                error.response?.data || error.message
            );

        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-logo">S</div>

                    <h1>Create your account</h1>

                    <p>
                        Register your provider account
                        to get started with ServiceHub.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleRegistration}
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={register.email}
                            required
                            onChange={(e) =>
                                setRegister({
                                    ...register,
                                    email: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            autoComplete="username"
                            value={register.username}
                            required
                            onChange={(e) =>
                                setRegister({
                                    ...register,
                                    username: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            value={register.password}
                            required
                            onChange={(e) =>
                                setRegister({
                                    ...register,
                                    password: e.target.value
                                })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                    >
                        Create account
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <a href="/login">
                            Sign in
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;
