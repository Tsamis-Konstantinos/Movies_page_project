const form = document.querySelector('#searchForm');

// Function to perform the search
const searchMovies = async (searchTerm) => {
    const apiKey = 'acf3c869';
    const url = 'http://www.omdbapi.com/';
    
    // Create the configuration for the API call
    let config = {
        params: {
            apikey: apiKey
        }
    };

    // Check if the search term is a 4-digit number (year)
    if (/^\d{4}$/.test(searchTerm)) {
        // If it's a year, search using the 'y' parameter
        config.params.y = searchTerm;
        config.params.s = 'Movie'; // A general keyword to ensure results are returned
    } else {
        // Otherwise, search by title using the 's' parameter
        config.params.s = searchTerm;
    }
    
    // Make the API request using Axios
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
    
    // Get the search term from the form
    const searchTerm = form.elements.query.value.trim();
    
    // Call the search function
    searchMovies(searchTerm);
    
    form.elements.query.value = '';
});

// Perform a search for "2024" when the page loads for a default layout
window.addEventListener('DOMContentLoaded', function () {
    searchMovies('2024'); // Automatically search for 2024 on page load
});

// Function to create image elements for the search results
const makeImages = (movies) => {
    document.querySelectorAll('.movie-container').forEach(div => div.remove());
    for (let result of movies) {
        if (result.Poster !== 'N/A') {
            const div = document.createElement('div');
            div.classList.add('movie-container'); // Add a class for styling
            const img = document.createElement('IMG');
            img.src = result.Poster;
            const titleText = document.createElement('p');
            titleText.textContent = `${result.Title} (${result.Year})`; // Format: Title (Year)
            div.appendChild(img);
            div.appendChild(titleText);
            
            // Append the div to the body
            document.body.append(div);
        }
    }
}
