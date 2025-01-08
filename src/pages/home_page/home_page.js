const form = document.querySelector('#searchForm');
const userButton = document.getElementById('userButton');
const libraryButton = document.getElementById('libraryButton');
const friendsButton = document.getElementById('friendsButton');
const apiKey = 'acf3c869';

// Function to fetch the username and update the button display and functionality
const updateUserButton = async () => {
    try {
        const res = await axios.get('/get-username'); 
        if (res.data.username) {
            userButton.innerHTML = `${res.data.username}  ↪EXIT;`
            userButton.onclick = logoutUser; 
        } else {
            userButton.innerHTML = "Login";
            userButton.onclick = () => window.location.href = '/login'; // Redirect to login page
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
};

const updateLibraryButton = async () => {
    try {
        const res = await axios.get('/get-username'); 
        if (res.data.username) {
            libraryButton.onclick = () => window.location.href = '/library';
        } else {
            libraryButton.onclick = () => window.location.href = '/login';
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
};

const updateFriendsButton = async () => {
    try {
        const res = await axios.get('/get-username'); 
        if (res.data.username) {
            friendsButton.onclick = () => window.location.href = '/friends';
        } else {
            friendsButton.onclick = () => window.location.href = '/login';
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
};

// Function to log the user out
const logoutUser = async () => {
    try {
        await axios.post('/logout'); 
        window.location.reload(); 
    } catch (error) {
        console.error("Error logging out:", error);
    }
};

window.addEventListener('DOMContentLoaded', function () {
    updateUserButton(); 
    updateLibraryButton();
    updateFriendsButton();
    searchMovies('2025');
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTerm = form.elements.query.value.trim();
    searchMovies(searchTerm);
    form.elements.query.value = '';
});

// Function to perform the search
const searchMovies = async (searchTerm) => {
    const url = 'http://www.omdbapi.com/';
    
    let config = {
        params: { apikey: apiKey }
    };

    if (/^\d{4}$/.test(searchTerm)) {
        config.params.y = searchTerm;
        config.params.s = 'Movie';
    } else {
        config.params.s = searchTerm;
    }
    
    try {
        const res = await axios.get(url, config);
        
        if (res.data.Search && res.data.Search.length > 0) {
            makeImages(res.data.Search);
        } else {
            alert('No results found');
        }
    } catch (err) {
        console.error("Error fetching data from OMDb API:", err);
        alert('Error fetching data. Please try again later.');
    }
};

// Function to create movie divs with hover plot display
const makeImages = async (movies) => {
    document.querySelectorAll('.movie-container').forEach(div => div.remove());

    for (let result of movies) {
        if (result.Poster !== 'N/A') {
            const div = document.createElement('div');
            div.classList.add('movie-container');
            
            const img = document.createElement('IMG');
            img.src = result.Poster;

            const titleText = document.createElement('p');
            titleText.textContent = `${result.Title} (${result.Year})`;

            const movieButton = document.createElement('button');
            const movieImdbId = result.imdbID;

            // Function to set button state based on login status and movie save status
            const setButtonState = async () => {
                try {
                    const res = await axios.get('/get-username');
                    if (res.data.username) {
                        const userRes = await axios.get('/get-user-movies');
                        const isMovieLiked = userRes.data.movies.includes(movieImdbId);
                        movieButton.textContent = isMovieLiked ? 'Liked' : 'Like';
                        movieButton.onclick = async () => {
                            try {
                                if (isMovieLiked) {
                                await axios.post('/remove-movie', { movieId: movieImdbId });
                                    movieButton.textContent = 'Like'; 
                                } else {
                                    await axios.post('/save-movie', { movieId: movieImdbId });
                                    movieButton.textContent = 'Liked';
                                }
                                setButtonState();
                            } catch (error) {
                                console.error("Error toggling movie like state:", error);
                            }
                        };
                    } else {
                        movieButton.textContent = 'Like';
                        movieButton.onclick = () => window.location.href = '/login';
                    }
                } catch (error) {
                    console.error("Error setting button state:", error);
                }
            };

            setButtonState();
            div.appendChild(img);
            div.appendChild(titleText);
            div.appendChild(movieButton);

            const plotDiv = document.createElement('div');
            plotDiv.classList.add('plot');
            div.appendChild(plotDiv);

            div.addEventListener('mouseenter', async () => {
                plotDiv.textContent = await fetchPlot(result.imdbID);
            });

            div.addEventListener('mouseleave', () => {
                plotDiv.textContent = '';
            });

            document.body.append(div);
        }
    }
};

// Function to fetch short plot for a movie
const fetchPlot = async (movieId) => {
    const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}&plot=short`;
    try {
        const res = await axios.get(url);
        return res.data.Plot || "Plot not available.";
    } catch (err) {
        console.error("Error fetching plot:", err);
        return "Error fetching plot.";
    }
};