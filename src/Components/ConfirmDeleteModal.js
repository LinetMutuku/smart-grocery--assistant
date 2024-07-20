import React from 'react';
import '../style.css';

const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this item?</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-button">Delete</button>
                    <button onClick={onCancel} className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;