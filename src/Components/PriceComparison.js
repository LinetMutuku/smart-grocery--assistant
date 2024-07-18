import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Import react-hot-toast for notifications

const PriceComparison = () => {
    const [prices, setPrices] = useState([]);
    const [newPrice, setNewPrice] = useState({ item: '', price: '', store: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const pricesCollection = await getDocs(collection(db, 'prices'));
                setPrices(pricesCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (err) {
                setError('Failed to fetch prices');
            }
        };
        fetchPrices();
    }, []);

    const addPrice = async (e) => {
        e.preventDefault();
        if (!newPrice.item || !newPrice.price || !newPrice.store) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const docRef = await addDoc(collection(db, 'prices'), newPrice);
            setPrices([...prices, { ...newPrice, id: docRef.id }]);
            setNewPrice({ item: '', price: '', store: '' });
            toast.success('Price added successfully'); // Notify success with toast
        } catch (err) {
            setError('Failed to add price');
        }
    };

    return (
        <div className="price-comparison-container">
            <h2>Price Comparison</h2>
            <form className="input-group" onSubmit={addPrice}>
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
                />
                <input
                    type="text"
                    value={newPrice.store}
                    onChange={(e) => setNewPrice({ ...newPrice, store: e.target.value })}
                    placeholder="Store"
                />
                <button type="submit">Add Price</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <ul className="price-list">
                {prices.map(price => (
                    <li key={price.id}>
                        {price.item} at {price.store}: ${price.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PriceComparison;
