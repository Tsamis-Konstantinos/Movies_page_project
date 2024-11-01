const userButton = document.getElementById('userButton');
const movieContainer = document.getElementById('movieContainer');

// Function to fetch the username and update the button display and functionality
const updateUserButton = async () => {
    try {
        const res = await axios.get('/get-username'); 
        if (res.data.username) {
            // User is logged in, display username and ↪EXIT symbol
            userButton.innerHTML = `${res.data.username}  ↪EXIT`;
            userButton.onclick = logoutUser; 
            // Fetch saved movies for the logged-in user
            await fetchSavedMovies();
        } else {
            // User is not logged in, display "Login"
            userButton.innerHTML =  "Login";
            userButton.onclick = () => window.location.href = '/login'; // Redirect to login page
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
};

// Function to fetch and display saved movies
const fetchSavedMovies = async () => {
    try {
        const res = await axios.get('/saved-movies');
        const movies = res.data.movies;

        // Check if the user has any saved movies
        if (movies.length === 0) {
            movieContainer.innerHTML = '<p>No saved movies found.</p>';
            return;
        }

        // Clear existing content in the movie container
        movieContainer.innerHTML = '';

        // Loop through the movie IDs and create elements for each movie
        for (const movieId of movies) {
            const movieDetails = await fetchMovieDetails(movieId);
            if (movieDetails) {
                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie-container');

                // Create the movie content
                movieDiv.innerHTML = `
                    <img src="${movieDetails.Poster}" alt="${movieDetails.Title} poster">
                    <p>${movieDetails.Title} (${movieDetails.Year})</p>
                    <button onclick="removeMovie('${movieId}', this)">Remove</button>
                    <div class="movie-plot" style="display: none;">${movieDetails.Plot}</div>
                `;

                // Append the movie div to the container
                movieContainer.appendChild(movieDiv);

                // Add hover effect to show/hide plot
                movieDiv.addEventListener('mouseover', () => {
                    const plotDiv = movieDiv.querySelector('.movie-plot');
                    plotDiv.style.display = 'block'; // Show the plot on hover
                });

                movieDiv.addEventListener('mouseout', () => {
                    const plotDiv = movieDiv.querySelector('.movie-plot');
                    plotDiv.style.display = 'none'; // Hide the plot when not hovering
                });
            }
        }
    } catch (error) {
        console.error("Error fetching saved movies:", error);
    }
};

// Function to fetch movie details from OMDb API
const fetchMovieDetails = async (movieId) => {
    const apiKey = 'acf3c869'; // Your API key
    const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
    
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (err) {
        console.error("Error fetching movie details:", err);
        return null; // Return null if there was an error
    }
};

// Function to remove a movie
const removeMovie = async (movieId, button) => {
    try {
        await axios.post('/remove-movie', { movieId }); // API call to remove movie from user's saved list
        const movieDiv = button.parentElement; // Get the movie div
        movieContainer.removeChild(movieDiv); // Remove the movie div from the DOM
    } catch (error) {
        console.error("Error removing movie:", error);
    }
};

// Function to log the user out
const logoutUser = async () => {
    try {
        await axios.post('/logout'); // Make sure your server has this route implemented
        window.location.reload(); // Reload the page to reflect the logged-out state
    } catch (error) {
        console.error("Error logging out:", error);
    }
};

// Load the username or set login button on page load
window.addEventListener('DOMContentLoaded', function () {
    updateUserButton(); // Check login state and update user button
});
