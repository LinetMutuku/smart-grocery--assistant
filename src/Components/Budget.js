import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, remove, update, serverTimestamp } from 'firebase/database';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Budget = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: '', date: '' });
    const [loading, setLoading] = useState(true);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [recentActivity, setRecentActivity] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const fetchExpenses = useCallback(() => {
        const expensesRef = ref(db, 'budget');
        return onValue(expensesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedExpenses = data ? Object.entries(data).map(([id, values]) => ({id, ...values})) : [];
            setExpenses(loadedExpenses);
            calculateTotal(loadedExpenses);
            setLoading(false);
            updateRecentActivity(loadedExpenses);
        }, (error) => {
            console.error('Failed to fetch expenses', error);
            toast.error('Failed to load expenses');
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = fetchExpenses();
        return () => unsubscribe();
    }, [fetchExpenses]);

    const calculateTotal = (expenseList) => {
        const total = expenseList.reduce((acc, expense) => acc + Number(expense.amount), 0);
        setTotalExpenses(total);
    };

    const updateRecentActivity = (expenseList) => {
        const sortedExpenses = [...expenseList].sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivity(sortedExpenses.slice(0, 5));
    };

    const addExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.name.trim() || !newExpense.amount.trim() || !newExpense.category.trim() || !newExpense.date) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            const expenseWithTimestamp = {
                ...newExpense,
                timestamp: serverTimestamp()
            };
            await push(ref(db, 'budget'), expenseWithTimestamp);
            setNewExpense({ name: '', amount: '', category: '', date: '' });
            toast.success('Expense added successfully!');
        } catch (err) {
            console.error('Failed to add expense', err);
            toast.error('Failed to add expense');
        }
    };

    const deleteExpense = (expense) => {
        setExpenseToDelete(expense);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (expenseToDelete) {
            try {
                await remove(ref(db, `budget/${expenseToDelete.id}`));
                toast.success('Expense deleted successfully!');
            } catch (err) {
                console.error('Failed to delete expense', err);
                toast.error('Failed to delete expense');
            } finally {
                setShowDeleteModal(false);
                setExpenseToDelete(null);
            }
        }
    };

    const startEditing = (expense) => {
        setEditingId(expense.id);
        setNewExpense({ name: expense.name, amount: expense.amount, category: expense.category, date: expense.date });
    };

    const saveEdit = async () => {
        if (!newExpense.name.trim() || !newExpense.amount.trim() || !newExpense.category.trim() || !newExpense.date) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            const updatedExpense = {
                ...newExpense,
                timestamp: serverTimestamp()
            };
            await update(ref(db, `budget/${editingId}`), updatedExpense);
            setEditingId(null);
            setNewExpense({ name: '', amount: '', category: '', date: '' });
            toast.success('Expense updated successfully!');
        } catch (err) {
            console.error('Failed to update expense', err);
            toast.error('Failed to update expense');
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const categoryMatch = filter === 'all' || expense.category === filter;
        const dateMatch =
            (!dateRange.start || expense.date >= dateRange.start) &&
            (!dateRange.end || expense.date <= dateRange.end);
        return categoryMatch && dateMatch;
    });

    const categoryData = Object.entries(
        filteredExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
        <div className="budget-container">
            <h2 className="budget-title">Budget Tracking</h2>
            <form className="expense-form" onSubmit={editingId ? saveEdit : addExpense}>
                <input
                    type="text"
                    className="expense-input"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    placeholder="Expense Name"
                />
                <input
                    type="number"
                    className="expense-input"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="Amount"
                />
                <select
                    className="expense-input"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                    <option value="">Select Category</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                </select>
                <input
                    type="date"
                    className="expense-input"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
                <button type="submit" className="add-expense-btn">
                    {editingId ? 'Save Edit' : 'Add Expense'}
                </button>
            </form>
            <div className="filter-container">
                <select
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                </select>
                <input
                    type="date"
                    className="date-filter"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    className="date-filter"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    placeholder="End Date"
                />
            </div>
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : (
                <>
                    <div className="expense-summary">
                        <div className="total-expenses">
                            Total Expenses: ${totalExpenses.toFixed(2)}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="recent-activity">
                        <h3>Recent Activity</h3>
                        <ul>
                            {recentActivity.map(activity => (
                                <li key={activity.id} className="activity-item">
                                    <span>{activity.name}</span>
                                    <span>${activity.amount}</span>
                                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <ul className="expense-list">
                        {filteredExpenses.map(expense => (
                            <li key={expense.id} className="expense-item">
                                <span className="expense-name">{expense.name}</span>
                                <span className="expense-amount">${expense.amount}</span>
                                <span className="expense-category">{expense.category}</span>
                                <span className="expense-date">{expense.date}</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => startEditing(expense)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteExpense(expense)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default Budget;