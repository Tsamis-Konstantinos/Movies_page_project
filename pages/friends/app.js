const userButton = document.getElementById('userButton');
const searchForm = document.getElementById('searchForm');

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
            userButton.innerHTML =  "Login";
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
});
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = document.getElementById('searchInput').value;

  try {
    const res = await axios.get(`/search-users?query=${query}`);
    const users = res.data.users;
    displaySearchResults(users);
  } catch (error) {
    console.error("Error searching users:", error);
  }
});

// Listen for the search form submission
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
  
    try {
      // Send a GET request to the search-users route
      const res = await axios.get(`/search-users?query=${query}`);
      const users = res.data.users;
      displaySearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  });
  
  // Function to display search results in the searchResults div
  const displaySearchResults = (users) => {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; // Clear previous results
  
    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.innerHTML = `${user.username} <button onclick="sendFriendRequest('${user.username}')">Add Friend</button>`;
      resultsDiv.appendChild(userDiv);
    });
  };
  
  // Placeholder function to handle friend request (you can implement this further as needed)
  const sendFriendRequest = (username) => {
    console.log(`Friend request sent to ${username}`);
    // Add your logic to handle friend requests here
  };
  