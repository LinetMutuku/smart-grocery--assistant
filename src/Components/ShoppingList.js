import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', category: '', image: null });
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const itemsCollection = await getDocs(collection(db, 'shoppingList'));
                setItems(itemsCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (err) {
                setError('Failed to fetch items');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const uploadImage = async (imageFile, itemName) => {
        try {
            const storageRef = ref(storage, `images/${itemName}`);
            await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        try {
            if (!newItem.name || !newItem.quantity || !newItem.category || !newItem.image) {
                toast.error('Please fill in all fields');
                return;
            }

            const imageURL = await uploadImage(newItem.image, newItem.name);
            const newItemWithImage = { ...newItem, image: imageURL };

            const newItemRef = await addDoc(collection(db, 'shoppingList'), newItemWithImage);
            setItems([...items, { ...newItemWithImage, id: newItemRef.id }]);
            toast.success('Item added to shopping list');
            setNewItem({ name: '', quantity: '', category: '', image: null });
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to add item');
        }
    };

    const updateItem = async (updatedItem) => {
        try {
            let updatedItemData = { ...updatedItem };

            // If newItem.image is a File object, upload it and update imageURL
            if (newItem.image instanceof File) {
                const imageURL = await uploadImage(newItem.image, newItem.name);
                updatedItemData.image = imageURL;
            }

            await updateDoc(doc(db, 'shoppingList', updatedItem.id), updatedItemData);

            // Update state with the modified item
            const updatedItems = items.map(item => item.id === updatedItem.id ? updatedItemData : item);
            setItems(updatedItems);

            toast.success('Item updated');
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
        }
    };

    const deleteItem = async (id) => {
        try {
            await deleteDoc(doc(db, 'shoppingList', id));
            setItems(items.filter(item => item.id !== id));
            toast.success('Item deleted from shopping list');
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        // Set initial values for edit mode, including handling image state
        setNewItem({ name: item.name, quantity: item.quantity, category: item.category, image: null });
    };

    const cancelEdit = () => {
        setEditingItem(null);
        // Reset form fields, including image state
        setNewItem({ name: '', quantity: '', category: '', image: null });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
        }
    };

    return (
        <div className="shopping-list-container">
            <h2>Shopping List</h2>
            <form className="input-group" onSubmit={editingItem ? (e) => { e.preventDefault(); updateItem(editingItem); } : addItem}>
                <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Item Name"
                />
                <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="Quantity"
                />
                <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    placeholder="Category"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                />
                <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
                {editingItem && <button type="button" onClick={cancelEdit}>Cancel</button>}
            </form>
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="shopping-list">
                    {items.map(item => (
                        <li key={item.id}>
                            <div>
                                <img src={item.image} alt={item.name} style={{ maxWidth: '100px' }} />
                                <span>{item.name} - {item.quantity} ({item.category})</span>
                            </div>
                            <div>
                                <button onClick={() => handleEdit(item)}>Edit</button>
                                <button onClick={() => deleteItem(item.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShoppingList;
