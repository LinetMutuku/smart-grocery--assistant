import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Import react-hot-toast for notifications

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            const itemsCollection = await getDocs(collection(db, 'inventory'));
            setItems(itemsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        fetchItems();
    }, []);

    const addItem = async () => {
        const docRef = await addDoc(collection(db, 'inventory'), { name: newItem });
        setItems([...items, { name: newItem, id: docRef.id }]);
        setNewItem('');
        toast.success('Item added to inventory'); // Notify success with toast
    };

    const deleteItem = async (id) => {
        await deleteDoc(doc(db, 'inventory', id));
        setItems(items.filter(item => item.id !== id));
        toast.success('Item deleted from inventory'); // Notify success with toast
    };

    return (
        <div className="inventory-container">
            <h2>Inventory Management</h2>
            <div className="input-group">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add new item" />
                <button onClick={addItem}>Add</button>
            </div>
            <ul className="inventory-list">
                {items.map(item => (
                    <li key={item.id}>
                        {item.name} <button onClick={() => deleteItem(item.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;
