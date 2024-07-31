import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { Chart } from 'react-google-charts';
import toast from 'react-hot-toast';
import '../style.css';
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', quantity: 0, category: '', expirationDate: '', dietaryInfo: '', estimatedValue: 0 });
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [lowStockThreshold, setLowStockThreshold] = useState(3);
    const [recentlyAddedItems, setRecentlyAddedItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const inventoryRef = ref(db, 'inventory');
        const shoppingListRef = ref(db, 'shoppingList');

        const unsubscribeInventory = onValue(inventoryRef, (snapshot) => {
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
        });

        const unsubscribeShoppingList = onValue(shoppingListRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.entries(data).forEach(([id, item]) => {
                    if (item.purchased && !item.addedToInventory) {
                        addItemToInventory(item);
                        markItemAsAddedToInventory(id);
                    }
                });
            }
        });

        return () => {
            unsubscribeInventory();
            unsubscribeShoppingList();
        };
    }, []);

    const addItemToInventory = async (item) => {
        const inventoryRef = ref(db, 'inventory');
        await push(inventoryRef, {
            name: item.name,
            quantity: item.quantity || 1,
            category: item.category || 'Uncategorized',
            expirationDate: item.expirationDate || '',
            dietaryInfo: item.dietaryInfo || '',
            estimatedValue: item.estimatedValue || 0
        });
        setRecentlyAddedItems(prev => [...prev, item.name]);
        setTimeout(() => {
            setRecentlyAddedItems(prev => prev.filter(name => name !== item.name));
        }, 5000);
        toast.success(`${item.name} added to inventory from shopping list`);
    };

    const markItemAsAddedToInventory = async (id) => {
        const itemRef = ref(db, `shoppinglist/${id}`);
        await update(itemRef, { addedToInventory: true });
    };

    const addItem = async () => {
        if (!newItem.name) return toast.error('Item name is required');
        const inventoryRef = ref(db, 'inventory');
        await push(inventoryRef, newItem);
        setNewItem({ name: '', quantity: 0, category: '', expirationDate: '', dietaryInfo: '', estimatedValue: 0 });
        toast.success('Item added to inventory');
    };

    const deleteItem = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                const itemRef = ref(db, `inventory/${itemToDelete.id}`);
                await remove(itemRef);
                toast.success('Item deleted from inventory');
            } catch (err) {
                console.error('Failed to delete item', err);
                toast.error('Failed to delete item');
            } finally {
                setShowDeleteModal(false);
                setItemToDelete(null);
            }
        }
    };

    const startEditing = (item) => {
        setEditingItem({ ...item });
    };

    const cancelEditing = () => {
        setEditingItem(null);
    };

    const saveEdit = async () => {
        if (!editingItem) return;
        const itemRef = ref(db, `inventory/${editingItem.id}`);
        await update(itemRef, editingItem);
        setEditingItem(null);
        toast.success('Item updated successfully');
    };

    const handleEditChange = (field, value) => {
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => a[sortBy].localeCompare(b[sortBy]));

    const categories = [...new Set(items.map(item => item.category))];
    const chartData = [
        ['Category', 'Quantity'],
        ...categories.map(category => [
            category,
            items.filter(item => item.category === category).reduce((sum, item) => sum + item.quantity, 0)
        ])
    ];

    const lowStockItems = items.filter(item => item.quantity <= lowStockThreshold);
    const expiringItems = items.filter(item => {
        const expirationDate = new Date(item.expirationDate);
        const today = new Date();
        const daysUntilExpiration = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration <= 3 && daysUntilExpiration >= 0;
    });

    const totalInventoryValue = items.reduce((sum, item) => sum + (item.quantity * item.estimatedValue), 0);

    return (
        <div className="inventory-container">
            <h2>Inventory Management</h2>
            <div className="inventory-summary">
                <p>Total Items: {items.length}</p>
                <p>Total Value: ${totalInventoryValue.toFixed(2)}</p>
                <p>Low Stock Items: {lowStockItems.length}</p>
                <p>Expiring Soon: {expiringItems.length}</p>
            </div>
            {recentlyAddedItems.length > 0 && (
                <div className="recently-added">
                    <h3>Recently Added from Shopping List:</h3>
                    <ul>
                        {recentlyAddedItems.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="input-group">
                <div className="input-field">
                    <label htmlFor="itemName">Item Name:</label>
                    <input
                        id="itemName"
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="e.g., Apples"
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="itemQuantity">Quantity:</label>
                    <input
                        id="itemQuantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                        placeholder="e.g., 50"
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="itemCategory">Category:</label>
                    <input
                        id="itemCategory"
                        type="text"
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        placeholder="e.g., Produce"
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="itemExpirationDate">Expiration Date:</label>
                    <input
                        id="itemExpirationDate"
                        type="date"
                        value={newItem.expirationDate}
                        onChange={(e) => setNewItem({...newItem, expirationDate: e.target.value})}
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="itemDietaryInfo">Dietary Info:</label>
                    <input
                        id="itemDietaryInfo"
                        type="text"
                        value={newItem.dietaryInfo}
                        onChange={(e) => setNewItem({...newItem, dietaryInfo: e.target.value})}
                        placeholder="e.g., Organic"
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="itemEstimatedValue">Estimated Value ($):</label>
                    <input
                        id="itemEstimatedValue"
                        type="number"
                        value={newItem.estimatedValue}
                        onChange={(e) => setNewItem({...newItem, estimatedValue: parseFloat(e.target.value)})}
                        placeholder="e.g., 1.99"
                    />
                </div>
                <button onClick={addItem}>Add Item</button>
            </div>
            <div className="filter-sort">
                <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter items" />
                <select onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                    <option value="expirationDate">Sort by Expiration Date</option>
                </select>
                <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(parseInt(e.target.value))} placeholder="Low Stock Threshold" />
            </div>
            <div className="inventory-lists">
                <div className="main-list">
                    <h3>All Items</h3>
                    <ul className="inventory-list">
                        {filteredItems.map(item => (
                            <li key={item.id} className={item.quantity <= lowStockThreshold ? 'low-stock' : ''}>
                                {editingItem && editingItem.id === item.id ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editingItem.name}
                                            onChange={(e) => handleEditChange('name', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            value={editingItem.quantity}
                                            onChange={(e) => handleEditChange('quantity', parseInt(e.target.value))}
                                        />
                                        <input
                                            type="text"
                                            value={editingItem.category}
                                            onChange={(e) => handleEditChange('category', e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            value={editingItem.expirationDate}
                                            onChange={(e) => handleEditChange('expirationDate', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            value={editingItem.dietaryInfo}
                                            onChange={(e) => handleEditChange('dietaryInfo', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            value={editingItem.estimatedValue}
                                            onChange={(e) => handleEditChange('estimatedValue', parseFloat(e.target.value))}
                                        />
                                        <button onClick={saveEdit}>Save</button>
                                        <button onClick={cancelEditing}>Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <span>{item.name}</span>
                                        <span>{item.quantity}</span>
                                        <span>{item.category}</span>
                                        <span>{item.expirationDate}</span>
                                        <span>{item.dietaryInfo}</span>
                                        <span>${item.estimatedValue.toFixed(2)}</span>
                                        <button className="inventory-edit-button" onClick={() => startEditing(item)}>Edit</button>
                                        <button className="delete-button" onClick={() => deleteItem(item)}>Delete</button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="side-lists">
                    <div className="low-stock-list">
                        <h3>Low Stock Items</h3>
                        <ul>
                            {lowStockItems.map(item => (
                                <li key={item.id}>{item.name} - Qty: {item.quantity}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="expiring-list">
                        <h3>Expiring Soon</h3>
                        <ul>
                            {expiringItems.map(item => (
                                <li key={item.id}>{item.name} - Expires: {item.expirationDate}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="inventory-chart">
                <h3>Inventory by Category</h3>
                <Chart
                    chartType="PieChart"
                    data={chartData}
                    options={{ title: 'Inventory Distribution' }}
                    width={'100%'}
                    height={'400px'}
                />
            </div>
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default Inventory;