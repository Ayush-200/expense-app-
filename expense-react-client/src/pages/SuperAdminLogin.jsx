import { useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useDispatch } from "react-redux";
import { SET_USER } from "../redux/user/action";
import { Link } from "react-router-dom";

function SuperAdminLogin() {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
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

        if (formData.email.length === 0) {
            newErrors.email = "Email is required";
            isValid = false;
        }

        if (formData.password.length === 0) {
            newErrors.password = "Password is required";
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
                    email: formData.email,
                    password: formData.password,
                };
                const config = { withCredentials: true };
                const response = await axios.post(
                    `${serverEndpoint}/auth/login`,
                    body,
                    config
                );
                
                // Check if user is super admin
                if (response.data.user.role !== 'superadmin') {
                    setErrors({
                        message: "Access denied. Super admin credentials required.",
                    });
                    return;
                }

                dispatch({
                    type: SET_USER,
                    payload: response.data.user,
                });
            } catch (error) {
                console.log(error);
                setErrors({
                    message: "Invalid credentials or access denied",
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden border-danger border-3">
                        <div className="card-body p-5">
                            {/* Brand Header */}
                            <div className="text-center mb-4">
                                <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                                    <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: "3rem" }}></i>
                                </div>
                                <h2 className="fw-bold text-dark">
                                    Super Admin <span className="text-danger">Access</span>
                                </h2>
                                <p className="text-muted">
                                    Restricted area - Authorized personnel only
                                </p>
                            </div>

                            {/* Global Alerts */}
                            {errors.message && (
                                <div className="alert alert-danger py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {errors.message}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Admin Email
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.email ? "is-invalid" : ""
                                        }`}
                                        type="email"
                                        name="email"
                                        placeholder="superAdmin@gmail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary">
                                        Admin Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.password ? "is-invalid" : ""
                                        }`}
                                        type="password"
                                        name="password"
                                        placeholder="Enter admin password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button 
                                        className="btn btn-danger w-100 btn-md rounded-pill fw-bold shadow-sm mb-4"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-shield-lock me-2"></i>
                                                Sign In as Super Admin
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Back to regular login */}
                            <div className="text-center mt-3">
                                <p className="text-muted small mb-0">
                                    Not an admin?{" "}
                                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                        Regular Sign In
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

export default SuperAdminLogin;
