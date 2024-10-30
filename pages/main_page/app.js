const form = document.querySelector('#searchForm');
const userButton = document.getElementById('userButton');

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
        if (res.data.Response === 'True') {
            makeImages(res.data.Search);
        } else {
            alert('No results found');
        }
    } catch (err) {
        console.error("Error fetching data from OMDb API:", err);
        alert('Error fetching data. Please try again later.');
    }
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTerm = form.elements.query.value.trim();
    searchMovies(searchTerm);
    form.elements.query.value = '';
});

window.addEventListener('DOMContentLoaded', function () {
    loadUsername(); // Load username on page load
    searchMovies('2024');
});

const makeImages = (movies) => {
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

            div.appendChild(img);
            div.appendChild(titleText);
            div.appendChild(checkbox);

            document.body.append(div);
        }
    }
}
