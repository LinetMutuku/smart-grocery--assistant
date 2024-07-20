import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../style.css';

// Log environment variables (be cautious about logging sensitive information)
console.log('APP_ID:', process.env.REACT_APP_APP_ID);
console.log('APP_KEY:', process.env.REACT_APP_APP_KEY);

const Recipe = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Verify environment variables are loaded
        if (!process.env.REACT_APP_APP_ID || !process.env.REACT_APP_APP_KEY) {
            console.error('Environment variables are not set correctly');
            toast.error('API configuration error. Please check the console.');
        }
    }, []);

    const searchRecipes = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Sending request with params:', {
                type: 'public',
                q: searchTerm,
                app_id: process.env.REACT_APP_APP_ID,
                app_key: process.env.REACT_APP_APP_KEY
            });

            const response = await axios.get('https://api.edamam.com/api/recipes/v2', {
                params: {
                    type: 'public',
                    q: searchTerm,
                    app_id: process.env.REACT_APP_APP_ID,
                    app_key: process.env.REACT_APP_APP_KEY
                }
            });

            console.log('Response:', response.data);
            setRecipes(response.data.hits);
            toast.success('Recipes fetched successfully!');
        } catch (error) {
            console.error('Error fetching recipes:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            toast.error(`Failed to fetch recipes: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
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