import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Budget = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ name: '', amount: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const expensesCollection = await getDocs(collection(db, 'budget'));
                setExpenses(expensesCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch expenses', err);
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const addExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.name.trim() || !newExpense.amount.trim()) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            const docRef = await addDoc(collection(db, 'budget'), newExpense);
            setExpenses([...expenses, { ...newExpense, id: docRef.id }]);
            setNewExpense({ name: '', amount: '' });
            toast.success('Expense added successfully!');
        } catch (err) {
            console.error('Failed to add expense', err);
            toast.error('Failed to add expense');
        }
    };

    return (
        <div className="budget-container">
            <h2>Budget Tracking</h2>
            <form className="input-group" onSubmit={addExpense}>
                <label htmlFor="expenseName">Expense Name</label>
                <input
                    type="text"
                    id="expenseName"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    placeholder="Expense Name"
                />
                <label htmlFor="expenseAmount">Amount</label>
                <input
                    type="number"
                    id="expenseAmount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="Amount"
                />
                <button type="submit">Add Expense</button>
            </form>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="budget-list">
                    {expenses.map(expense => (
                        <li key={expense.id}>
                            {expense.name}: ${expense.amount}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Budget;
