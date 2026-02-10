import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { Link } from "react-router-dom";

function SuperAdminDashboard() {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersResponse, groupsResponse] = await Promise.all([
                axios.get(`${serverEndpoint}/auth/admin/users`, { withCredentials: true }),
                axios.get(`${serverEndpoint}/auth/admin/groups`, { withCredentials: true })
            ]);
            
            setUsers(usersResponse.data);
            setGroups(groupsResponse.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getUserGroups = (userEmail) => {
        return groups.filter(group => group.membersEmail.includes(userEmail));
    };

    if (loading) {
        return (
            <div className="container p-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-grow text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row mb-4">
                <div className="col">
                    <h2 className="fw-bold">
                        <i className="bi bi-shield-lock-fill text-danger me-2"></i>
                        Super Admin Dashboard
                    </h2>
                    <p className="text-muted">Manage all users and groups</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 bg-primary bg-opacity-10">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle p-3 me-3">
                                    <i className="bi bi-people-fill fs-3"></i>
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0">{users.length}</h3>
                                    <p className="text-muted mb-0">Total Users</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center">
                                <div className="bg-success text-white rounded-circle p-3 me-3">
                                    <i className="bi bi-collection-fill fs-3"></i>
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0">{groups.length}</h3>
                                    <p className="text-muted mb-0">Total Groups</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <i className="bi bi-people me-2"></i>
                        All Users
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === "groups" ? "active" : ""}`}
                        onClick={() => setActiveTab("groups")}
                    >
                        <i className="bi bi-collection me-2"></i>
                        All Groups
                    </button>
                </li>
            </ul>

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">All Users</h5>
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Groups</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const userGroups = getUserGroups(user.email);
                                        return (
                                            <tr key={user._id}>
                                                <td className="fw-medium">{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'superadmin' ? 'bg-danger' : 'bg-primary'}`}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {userGroups.length} groups
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setActiveTab("groups");
                                                        }}
                                                    >
                                                        View Groups
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Groups Tab */}
            {activeTab === "groups" && (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">All Groups</h5>
                        {groups.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                                <p>No groups created yet</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {groups.map(group => (
                                    <div key={group._id} className="col-md-6">
                                        <div className="card border shadow-sm rounded-3 h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h6 className="fw-bold mb-0">{group.name}</h6>
                                                    <span className="badge bg-light text-dark">
                                                        {group.membersEmail.length} members
                                                    </span>
                                                </div>
                                                <p className="text-muted small mb-3">
                                                    {group.description || "No description"}
                                                </p>
                                                <div className="mb-3">
                                                    <small className="text-muted fw-bold">Admin:</small>
                                                    <div className="small">{group.adminEmail}</div>
                                                </div>
                                                <div className="mb-3">
                                                    <small className="text-muted fw-bold">Members:</small>
                                                    <div className="mt-1">
                                                        {group.membersEmail.map((email, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                                                {email}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-muted small">
                                                    Created: {new Date(group.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperAdminDashboard;
