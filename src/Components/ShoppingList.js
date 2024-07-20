import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebaseConfig';
import { ref, set, push, remove, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ConfirmDeleteModal from './ConfirmDeleteModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ShoppingList = () => {
    const [user] = useAuthState(auth);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', category: '', image: null, price: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name');
    const [totalSpent, setTotalSpent] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (!user) return;
        const shoppingListRef = ref(db, 'shoppinglist');
        const userItemsQuery = query(shoppingListRef, orderByChild('userId'), equalTo(user.uid));

        const unsubscribe = onValue(userItemsQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemsList = Object.entries(data).map(([id, values]) => ({
                    id,
                    ...values
                }));
                setItems(itemsList);
            } else {
                setItems([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching items:", error);
            setError('Failed to fetch items');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        const spent = items.reduce((total, item) => total + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
        setTotalSpent(spent);
    }, [items]);

    const uploadImage = async (imageFile, itemName) => {
        if (!imageFile) return null;
        try {
            const imageRef = storageRef(storage, `images/${user.uid}/${itemName}`);
            await uploadBytes(imageRef, imageFile);
            return await getDownloadURL(imageRef);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    };

    const addItem = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('You must be logged in to add items');
            return;
        }
        try {
            if (!newItem.name.trim() || !newItem.quantity || !newItem.category.trim() || !newItem.price) {
                toast.error('Please fill in all fields correctly');
                return;
            }

            console.log('Starting to add item');
            const imageURL = newItem.image ? await uploadImage(newItem.image, newItem.name) : null;
            console.log('Image uploaded, URL:', imageURL);

            const newItemWithImage = { ...newItem, image: imageURL, userId: user.uid };
            console.log('Writing to database');
            const newItemRef = push(ref(db, 'shoppinglist'));
            await set(newItemRef, newItemWithImage);
            console.log('Item added successfully');

            toast.success('Item added to shopping list');
            setNewItem({ name: '', quantity: '', category: '', image: null, price: '' });
            setImagePreview(null);
        } catch (error) {
            console.error('Error adding item:', error);
            console.log('Item data:', newItem);
            toast.error(`Failed to add item: ${error.message}`);
        }
    };

    const updateItem = async (e) => {
        e.preventDefault();
        try {
            if (!editingItem) return;

            let updatedItemData = { ...newItem };
            if (newItem.image instanceof File) {
                const imageURL = await uploadImage(newItem.image, newItem.name);
                updatedItemData.image = imageURL;
            } else {
                updatedItemData.image = editingItem.image;
            }

            const itemRef = ref(db, `shoppinglist/${editingItem.id}`);
            await update(itemRef, updatedItemData);
            toast.success('Item updated');
            setEditingItem(null);
            setNewItem({ name: '', quantity: '', category: '', image: null, price: '' });
            setImagePreview(null);
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
        }
    };

    const deleteItem = async () => {
        try {
            if (!itemToDelete) return;
            const itemRef = ref(db, `shoppinglist/${itemToDelete}`);
            await remove(itemRef);
            toast.success('Item deleted from shopping list');
            setItemToDelete(null);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({ name: item.name, quantity: item.quantity, category: item.category, image: null, price: item.price });
        setImagePreview(item.image);
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setNewItem({ name: '', quantity: '', category: '', image: null, price: '' });
        setImagePreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const sortedItems = [...items].sort((a, b) => {
        if (a[sortCriteria] < b[sortCriteria]) return -1;
        if (a[sortCriteria] > b[sortCriteria]) return 1;
        return 0;
    });

    const filteredItems = sortedItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chartData = {
        labels: items.map(item => item.name),
        datasets: [
            {
                label: 'Item Prices',
                data: items.map(item => item.price),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    return (
        <div className="shopping-list-container">
            <h2>Shopping List</h2>
            <div className="total-spent">Total Spent: ${totalSpent.toFixed(2)}</div>
            <form className="input-group" onSubmit={editingItem ? updateItem : addItem}>
                <div className="form-row">
                    <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="Item Name"
                        className="form-control"
                    />
                    <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        placeholder="Quantity"
                        className="form-control"
                    />
                    <input
                        type="text"
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        placeholder="Category"
                        className="form-control"
                    />
                    <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="Price"
                        className="form-control"
                    />
                </div>
                <div className="form-row">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-input"
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" className="file-label">Choose Image</label>
                </div>
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}
                <button type="submit">{editingItem ? 'Update Item' : 'Add Item'}</button>
                {editingItem && <button type="button" onClick={cancelEdit}>Cancel Edit</button>}
            </form>
            <div className="list-controls">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                />
                <select
                    value={sortCriteria}
                    onChange={(e) => setSortCriteria(e.target.value)}
                    className="form-control"
                >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="quantity">Sort by Quantity</option>
                </select>
            </div>
            {loading ? <p>Loading...</p> : (
                <ul className="shopping-list">
                    {filteredItems.map((item) => (
                        <li key={item.id}>
                            <div className="item-details">
                                {item.image && <img src={item.image} alt={item.name} className="item-image" />}
                                <div>
                                    <p>{item.name}</p>
                                    <p>{item.quantity} {item.category}</p>
                                    <p>${item.price}</p>
                                </div>
                            </div>
                            <div className="item-actions">
                                <button className="edit-button" onClick={() => handleEdit(item)}>Edit</button>
                                <button className="delete-button" onClick={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="chart-container">
                <Bar data={chartData} />
            </div>
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onConfirm={deleteItem}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default ShoppingList;