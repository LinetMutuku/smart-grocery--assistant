import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast'; // Import react-hot-toast for notifications

const Recipe = () => {
    const [recipes, setRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState({ title: '', ingredients: '' });

    useEffect(() => {
        const fetchRecipes = async () => {
            const recipesCollection = await getDocs(collection(db, 'recipes'));
            setRecipes(recipesCollection.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        fetchRecipes();
    }, []);

    const addRecipe = async () => {
        await addDoc(collection(db, 'recipes'), newRecipe);
        setRecipes([...recipes, newRecipe]);
        setNewRecipe({ title: '', ingredients: '' });
        toast.success('Recipe added successfully'); // Notify success with toast
    };

    return (
        <div className="recipe-container">
            <h2>Recipe Suggestions</h2>
            <div className="input-group">
                <input
                    type="text"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    placeholder="Recipe Title"
                />
                <input
                    type="text"
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    placeholder="Ingredients (comma separated)"
                />
                <button onClick={addRecipe}>Add Recipe</button>
            </div>
            <ul className="recipe-list">
                {recipes.map(recipe => (
                    <li key={recipe.id}>
                        <h3>{recipe.title}</h3>
                        <p>{recipe.ingredients}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Recipe;
