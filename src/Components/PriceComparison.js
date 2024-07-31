import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { toast, Toaster } from 'react-hot-toast';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { db } from '../firebaseConfig'; // Make sure this path is correct
import '../style.css';

const PriceComparison = () => {
    const [prices, setPrices] = useState([]);
    const [newPrice, setNewPrice] = useState({ item: '', price: '', store: '' });
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('item');
    const [editingId, setEditingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, itemName: '' });

    useEffect(() => {
        const pricesRef = ref(db, 'prices');
        const unsubscribe = onValue(pricesRef, (snapshot) => {
            const data = snapshot.val();
            const priceList = data ? Object.entries(data).map(([id, values]) => ({id, ...values})) : [];
            setPrices(priceList);
        });

        return () => unsubscribe();
    }, []);

    const addOrUpdatePrice = async (e) => {
        e.preventDefault();
        if (!newPrice.item || !newPrice.price || !newPrice.store) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            if (editingId) {
                await update(ref(db, `prices/${editingId}`), newPrice);
                toast.success('Price updated successfully');
                setEditingId(null);
            } else {
                await push(ref(db, 'prices'), newPrice);
                toast.success('Price added successfully');
            }
            setNewPrice({ item: '', price: '', store: '' });
        } catch (err) {
            toast.error(editingId ? 'Failed to update price' : 'Failed to add price');
        }
    };

    const startEditing = (price) => {
        setNewPrice({ item: price.item, price: price.price, store: price.store });
        setEditingId(price.id);
    };

    const cancelEditing = () => {
        setNewPrice({ item: '', price: '', store: '' });
        setEditingId(null);
    };

    const confirmDelete = (id, itemName) => {
        setDeleteModal({ isOpen: true, id, itemName });
    };

    const cancelDelete = () => {
        setDeleteModal({ isOpen: false, id: null, itemName: '' });
    };

    const deletePrice = async () => {
        try {
            await remove(ref(db, `prices/${deleteModal.id}`));
            toast.success('Price deleted successfully');
            cancelDelete();
        } catch (err) {
            toast.error('Failed to delete price');
        }
    };

    const filteredPrices = prices.filter(price =>
        price.item.toLowerCase().includes(filter.toLowerCase()) ||
        price.store.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedPrices = [...filteredPrices].sort((a, b) => {
        if (sortBy === 'price') {
            return parseFloat(a.price) - parseFloat(b.price);
        }
        return a[sortBy].localeCompare(b[sortBy]);
    });

    return (
        <div className="price-comparison-container">
            <h2>Price Comparison</h2>
            <form className="input-group" onSubmit={addOrUpdatePrice}>
                <input
                    type="text"
                    value={newPrice.item}
                    onChange={(e) => setNewPrice({ ...newPrice, item: e.target.value })}
                    placeholder="Item"
                />
                <input
                    type="number"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                    placeholder="Price"
                    step="0.01"
                />
                <input
                    type="text"
                    value={newPrice.store}
                    onChange={(e) => setNewPrice({ ...newPrice, store: e.target.value })}
                    placeholder="Store"
                />
                <button type="submit">{editingId ? 'Update' : 'Add'} Price</button>
                {editingId && <button type="button" onClick={cancelEditing}>Cancel</button>}
            </form>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Filter items or stores"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="item">Sort by Item</option>
                    <option value="price">Sort by Price</option>
                    <option value="store">Sort by Store</option>
                </select>
            </div>
            <ul className="price-list">
                {sortedPrices.map(price => (
                    <li key={price.id} className="price-item">
                        <span className="item-name">{price.item}</span>
                        <span className="item-price">${parseFloat(price.price).toFixed(2)}</span>
                        <span className="item-store">{price.store}</span>
                        <button onClick={() => startEditing(price)} className="edit-btn">Edit</button>
                        <button onClick={() => confirmDelete(price.id, price.item)} className="delete-btn">Delete</button>
                    </li>
                ))}
            </ul>
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onCancel={cancelDelete}
                onConfirm={deletePrice}
                itemName={deleteModal.itemName}
            />
            <Toaster position="bottom-right" />
        </div>
    );
};

export default PriceComparison;