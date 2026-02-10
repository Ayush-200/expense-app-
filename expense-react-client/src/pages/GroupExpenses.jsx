import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function GroupExpenses() {
    const { groupId } = useParams();
    const [groupDetails, setGroupDetails] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [splitType, setSplitType] = useState("equal");
    const [customSplits, setCustomSplits] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}/details`,
                { withCredentials: true }
            );
            setGroupDetails(response.data.group);
            setExpenses(response.data.expenses);
            setBalances(response.data.balances);
            
            // Initialize custom splits
            const splits = {};
            response.data.group.membersEmail.forEach(email => {
                splits[email] = "";
            });
            setCustomSplits(splits);
        } catch (error) {
            console.error("Error fetching group details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let splitAmong = [];
            
            if (splitType === "equal") {
                // Split equally among all members
                const splitAmount = parseFloat(amount) / groupDetails.membersEmail.length;
                splitAmong = groupDetails.membersEmail.map(email => ({
                    email,
                    amount: parseFloat(splitAmount.toFixed(2))
                }));
            } else {
                // Custom split
                splitAmong = Object.entries(customSplits)
                    .filter(([_, amt]) => amt && parseFloat(amt) > 0)
                    .map(([email, amt]) => ({
                        email,
                        amount: parseFloat(amt)
                    }));
                
                // Validate total
                const total = splitAmong.reduce((sum, s) => sum + s.amount, 0);
                if (Math.abs(total - parseFloat(amount)) > 0.01) {
                    alert(`Split amounts must equal total amount. Current: ${total}, Expected: ${amount}`);
                    setSubmitting(false);
                    return;
                }
            }

            await axios.post(
                `${serverEndpoint}/expenses/create`,
                {
                    groupId,
                    title,
                    amount: parseFloat(amount),
                    splitAmong
                },
                { withCredentials: true }
            );

            // Reset form
            setTitle("");
            setAmount("");
            setSplitType("equal");
            setShowForm(false);
            
            // Refresh data
            fetchGroupDetails();
        } catch (error) {
            console.error("Error creating expense:", error);
            alert("Failed to create expense");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        
        try {
            await axios.delete(
                `${serverEndpoint}/expenses/${expenseId}`,
                { withCredentials: true }
            );
            fetchGroupDetails();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense");
        }
    };

    if (loading) {
        return (
            <div className="container p-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-grow text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Loading group details...</p>
            </div>
        );
    }

    if (!groupDetails) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">Group not found</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">{groupDetails.name}</li>
                </ol>
            </nav>

            {/* Group Header */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <h2 className="fw-bold mb-2">{groupDetails.name}</h2>
                        {groupDetails.description && (
                            <p className="text-muted mb-0">{groupDetails.description}</p>
                        )}
                    </div>
                    <button 
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Members & Balances */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
                <h5 className="fw-bold mb-3">
                    <i className="bi bi-people me-2 text-primary"></i>
                    Members & Balances
                </h5>
                <div className="row g-3">
                    {groupDetails.membersEmail.map(email => {
                        const balance = balances[email] || 0;
                        const isPositive = balance > 0;
                        const isZero = Math.abs(balance) < 0.01;
                        
                        return (
                            <div key={email} className="col-md-6">
                                <div className={`p-3 rounded-3 border ${isZero ? 'bg-light' : isPositive ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="bi bi-person-circle me-2"></i>
                                            <span className="fw-medium">{email}</span>
                                        </div>
                                        <div className={`fw-bold ${isZero ? 'text-muted' : isPositive ? 'text-success' : 'text-danger'}`}>
                                            {isPositive && '+'}₹{balance.toFixed(2)}
                                        </div>
                                    </div>
                                    {!isZero && (
                                        <small className="text-muted d-block mt-1">
                                            {isPositive ? 'Gets back' : 'Owes'}
                                        </small>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Expense Form */}
            {showForm && (
                <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-receipt me-2 text-primary"></i>
                        New Expense
                    </h5>
                    <form onSubmit={handleSubmitExpense}>
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="e.g., Dinner at restaurant"
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">Amount (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Split Type</label>
                            <select 
                                className="form-select"
                                value={splitType}
                                onChange={(e) => setSplitType(e.target.value)}
                            >
                                <option value="equal">Split Equally</option>
                                <option value="custom">Custom Split</option>
                            </select>
                        </div>

                        {splitType === "custom" && (
                            <div className="mb-3">
                                <label className="form-label">Custom Amounts</label>
                                {groupDetails.membersEmail.map(email => (
                                    <div key={email} className="input-group mb-2">
                                        <span className="input-group-text">{email}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={customSplits[email]}
                                            onChange={(e) => setCustomSplits({
                                                ...customSplits,
                                                [email]: e.target.value
                                            })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create Expense'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            <div className="bg-white p-4 rounded-4 shadow-sm">
                <h5 className="fw-bold mb-3">
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    Transaction History
                </h5>
                
                {expenses.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                        <p>No expenses yet. Add your first expense above!</p>
                    </div>
                ) : (
                    <div className="list-group">
                        {expenses.map(expense => (
                            <div key={expense._id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold">{expense.title}</h6>
                                        <p className="mb-1 text-muted small">
                                            Paid by <span className="fw-medium">{expense.paidBy}</span>
                                        </p>
                                        <p className="mb-2 text-muted small">
                                            {new Date(expense.createdAt).toLocaleDateString()} at {new Date(expense.createdAt).toLocaleTimeString()}
                                        </p>
                                        <div className="small">
                                            <strong>Split:</strong>
                                            <ul className="mb-0 mt-1">
                                                {expense.splitAmong.map((split, idx) => (
                                                    <li key={idx}>
                                                        {split.email}: ₹{split.amount.toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fs-5 fw-bold text-primary mb-2">
                                            ₹{expense.amount.toFixed(2)}
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteExpense(expense._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupExpenses;
