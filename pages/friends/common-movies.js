 // Variable to store common movies IDs
 let moviesArray = [];
        
 // OMDB API key (replace with your actual API key)
 const apiKey = 'acf3c869';

 // Fetch and display common movies
 document.addEventListener('DOMContentLoaded', async () => {
     const username = window.location.pathname.split('/').pop(); // Get friend's username from URL

     try {
         const res = await axios.get(`/friends/${username}/common-movies`);
         const commonMovies = res.data.commonMovies;
         moviesArray = commonMovies; // Store in moviesArray

         const commonMoviesListDiv = document.getElementById('commonMoviesList');
         if (moviesArray.length > 0) {
             commonMoviesListDiv.innerHTML = ''; // Clear the div
             for (const movieID of moviesArray) {
                 // Fetch details for each movie from OMDB API
                 try {
                     const omdbRes = await axios.get(`https://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`);
                     const movie = omdbRes.data;

                     // Display movie information
                     const movieDiv = document.createElement('div');
                     movieDiv.innerHTML = `
                         <div>
                             <img src="${movie.Poster}" alt="${movie.Title}">
                             <p>${movie.Title} (${movie.Year})</p>
                             <p>${movie.Plot}</p>
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