const form = document.querySelector('#searchForm');
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Get the search term from the form and trim any spaces
    const searchTerm = form.elements.query.value.trim();
    
    // Define the API key and URL for the OMDb API
    const apiKey = 'acf3c869'; // Your OMDb API key
    const url = 'http://www.omdbapi.com/';
    
    // Create the configuration for the API call
    let config = {
        params: {
            apikey: apiKey   // Include your API key
        }
    };

    // Check if the search term is a 4-digit number (year)
    if (/^\d{4}$/.test(searchTerm)) {
        // If it's a year, search using the 'y' parameter
        config.params.y = searchTerm;
        // Use a generic search term to ensure the API returns results
        config.params.s = 'Movie'; // You can change this to any keyword (e.g., 'Film', 'Show')
    } else {
        // Otherwise, search by title using the 's' parameter
        config.params.s = searchTerm;
    }
    
    // Make the API request using Axios
    try {
        const res = await axios.get(url, config);

        // Check if there are any results
        if (res.data.Response === 'True') {
            makeImages(res.data.Search);
        } else {
            alert('No results found');
        }
    } catch (err) {
        console.error("Error fetching data from OMDb API:", err);
        alert('Error fetching data. Please try again later.');
    }
    
    // Clear the search input
    form.elements.query.value = '';
});

// Function to create image elements for the search results
const makeImages = (movies) => {
    // Clear any existing images or divs before adding new ones
    document.querySelectorAll('.movie-container').forEach(div => div.remove());
    
    // Loop over the results and create a div, image, and text for each one
    for (let result of movies) {
        if (result.Poster !== 'N/A') {
            // Create a new div to contain the image and the title/year
            const div = document.createElement('div');
            div.classList.add('movie-container'); // Add a class for styling if needed
            
            // Create the image element
            const img = document.createElement('IMG');
            img.src = result.Poster;
            
            // Create a paragraph element to hold the title and year
            const titleText = document.createElement('p');
            titleText.textContent = `${result.Title} (${result.Year})`; // Title (Year) format
            
            // Append the image and title text to the div
            div.appendChild(img);
            div.appendChild(titleText);
            
            // Append the div to the body
            document.body.append(div);
        }
    }
}
