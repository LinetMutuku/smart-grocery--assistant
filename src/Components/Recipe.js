// Recipe.js
import React, { useState } from 'react';
import axios from 'axios';
import '../style.css';

const APP_ID = process.env.REACT_APP_APP_ID;
const APP_KEY = process.env.REACT_APP_APP_KEY;
const API_URL = process.env.REACT_APP_API_URL;

const Recipe = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchRecipes = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/search?q=${searchTerm}&app_id=${APP_ID}&app_key=${APP_KEY}`);
            setRecipes(response.data.hits);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert('Failed to fetch recipes. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="recipe-container">
            <h1>Recipe Search</h1>
            <form onSubmit={searchRecipes} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter a dish or ingredient"
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            {loading && <p>Loading...</p>}

            <div className="recipes-grid">
                {recipes.map((hit, index) => (
                    <div key={index} className="recipe-card">
                        <img src={hit.recipe.image} alt={hit.recipe.label} className="recipe-image"/>
                        <h2>{hit.recipe.label}</h2>
                        <p>Source: {hit.recipe.source}</p>
                        <ul className="ingredient-list">
                            {hit.recipe.ingredientLines.map((ingredient, i) => (
                                <li key={i}>{ingredient}</li>
                            ))}
                        </ul>
                        <a href={hit.recipe.url} target="_blank" rel="noopener noreferrer" className="recipe-link">
                            View Full Recipe
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recipe;
