import { useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let newErrors = {};
        let isValid = true;

        if (formData.name.trim().length === 0) {
            newErrors.name = "Name is required";
            isValid = false;
        }

        if (formData.email.length === 0) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        if (formData.password.length === 0) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (validate()) {
            setLoading(true);
            try {
                const body = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                };
                
                const response = await axios.post(
                    `${serverEndpoint}/auth/register`,
                    body
                );
                
                setMessage("Account created successfully! Redirecting to login...");
                setErrors({});
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } catch (error) {
                console.log(error);
                if (error.response?.data?.message) {
                    setErrors({
                        message: error.response.data.message,
                    });
                } else {
                    setErrors({
                        message: "Something went wrong, please try again",
                    });
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-5">
                            {/* Brand Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark">
                                    Create <span className="text-primary">Account</span>
                                </h2>
                                <p className="text-muted">
                                    Join MergeMoney to split expenses with friends
                                </p>
                            </div>

                            {/* Success Message */}
                            {message && (
                                <div className="alert alert-success py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {message}
                                </div>
                            )}

                            {/* Error Message */}
                            {errors.message && (
                                <div className="alert alert-danger py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {errors.message}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Full Name
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.name ? "is-invalid" : ""
                                        }`}
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Email Address
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.email ? "is-invalid" : ""
                                        }`}
                                        type="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.password ? "is-invalid" : ""
                                        }`}
                                        type="password"
                                        name="password"
                                        placeholder="At least 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary">
                                        Confirm Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.confirmPassword ? "is-invalid" : ""
                                        }`}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.confirmPassword && (
                                        <div className="invalid-feedback">
                                            {errors.confirmPassword}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button 
                                        className="btn btn-primary w-100 btn-md rounded-pill fw-bold shadow-sm mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            "Sign Up"
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Login Link */}
                            <div className="text-center mt-3">
                                <p className="text-muted small mb-0">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
