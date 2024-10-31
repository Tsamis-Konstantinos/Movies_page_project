const form = document.querySelector('#searchForm');
const userButton = document.getElementById('userButton');
const libraryButton = document.getElementById('libraryButton');
const friendsButton = document.getElementById('friendsButton');

// Function to fetch the username and update the button display and functionality
const updateUserButton = async () => {
    try {
        const res = await axios.get('/get-username'); 
        if (res.data.username) {
            // User is logged in, display username and ↪EXIT symbol
            userButton.innerHTML = `${res.data.username}  ↪EXIT`;
            userButton.onclick = logoutUser; 
        } else {
            // User is not logged in, display "Login"
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
        await axios.post('/logout'); // Make sure your server has this route implemented
        window.location.reload(); // Reload the page to reflect the logged-out state
    } catch (error) {
        console.error("Error logging out:", error);
    }
};

// Load the username or set login button on page load
window.addEventListener('DOMContentLoaded', function () {
    updateUserButton(); // Check login state and update user button
    updateLibraryButton();
    updateFriendsButton();
    searchMovies('2024'); // Perform an initial search for movies
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTerm = form.elements.query.value.trim();
    searchMovies(searchTerm);
    form.elements.query.value = '';
});

// Function to perform the search
const searchMovies = async (searchTerm) => {
    const apiKey = 'acf3c869';
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
        
        // Check if search results exist
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
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('like-checkbox');

            // Create plot div (hidden initially)
            const plotDiv = document.createElement('div');
            plotDiv.classList.add('plot');
            plotDiv.textContent = 'Loading plot...';
            div.appendChild(plotDiv);

            // Fetch plot on hover
            div.addEventListener('mouseenter', async () => {
                plotDiv.textContent = await fetchPlot(result.imdbID);
            });

            // Hide plot on mouse leave
            div.addEventListener('mouseleave', () => {
                plotDiv.textContent = '';
            });

            div.appendChild(img);
            div.appendChild(titleText);
            div.appendChild(checkbox);
            document.body.append(div);
        }
    }
};

// Function to fetch short plot for a movie
const fetchPlot = async (movieId) => {
    const apiKey = 'acf3c869';
    const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}&plot=short`;
    try {
        const res = await axios.get(url);
        return res.data.Plot || "Plot not available.";
    } catch (err) {
        console.error("Error fetching plot:", err);
        return "Error fetching plot.";
    }
};
