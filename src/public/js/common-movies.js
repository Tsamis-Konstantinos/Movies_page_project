// Variable to store common movies IDs
let moviesArray = [];
        
import { apiKey } from './config.js';

// Fetch and display common movies
document.addEventListener('DOMContentLoaded', async () => {
    const username = window.location.pathname.split('/').pop(); // Get friend's username from URL

    try {
        const res = await axios.get(`/friends/${username}/common-movies`);
        const commonMovies = res.data.commonMovies;
        moviesArray = commonMovies; 

        const commonMoviesListDiv = document.getElementById('commonMoviesList');
        if (moviesArray.length > 0) {
            commonMoviesListDiv.innerHTML = ''; 
            for (const movieID of moviesArray) {
                try {
                    const omdbRes = await axios.get(`https://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`);
                    const movie = omdbRes.data;
                    const movieDiv = document.createElement('div');
                    movieDiv.innerHTML = `
                    <div id="container">
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <p class="title">${movie.Title} (${movie.Year})</p>
                    <p class="plot">${movie.Plot}</p>
                    </div>
                    `;
                    commonMoviesListDiv.appendChild(movieDiv);
                } catch (omdbError) {
                    console.error(`Error fetching details for movie ID ${movieID}:`, omdbError);
                }
            }
        } else {
            commonMoviesListDiv.innerHTML = '<div>No common movies found.</div>';
        }
    } catch (error) {
        console.error('Error fetching common movies:', error);
        document.getElementById('commonMoviesList').innerHTML = '<div>Error fetching common movies.</div>';
    }
});