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

window.addEventListener('DOMContentLoaded', function () {
    updateUserButton();
    displaySentRequests();    // Display sent friend requests
    displayReceivedRequests(); // Display received friend requests
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
 
  
// Function to send a friend request to a user
const sendFriendRequest = async (username) => {
    try {
      const res = await axios.post('/send-friend-request', { friendUsername: username });
      alert(res.data.message); // Alert the user of the result (e.g., "Friend request sent!")
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Error sending friend request");
    }
  };
  
// Function to fetch and display sent friend requests
const displaySentRequests = async () => {
    try {
      const res = await axios.get('/friend-requests/sent');
      const sentDiv = document.getElementById('sent');
      sentDiv.innerHTML = ''; // Clear previous results
  
      res.data.sentRequests.forEach(username => {
        const userDiv = document.createElement('div');
        userDiv.textContent = `${username} (Friend request sent)`;
        sentDiv.appendChild(userDiv);
      });
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };
  
  // Function to fetch and display received friend requests
  const displayReceivedRequests = async () => {
    try {
      const res = await axios.get('/friend-requests/received');
      const receivedDiv = document.getElementById('received');
      receivedDiv.innerHTML = ''; // Clear previous results
  
      res.data.receivedRequests.forEach(username => {
        const userDiv = document.createElement('div');
        userDiv.innerHTML = `${username} <button onclick="acceptFriendRequest('${username}')">Accept</button>`;
        receivedDiv.appendChild(userDiv);
      });
    } catch (error) {
      console.error("Error fetching received requests:", error);
    }
  };

// Function to accept a friend request
const acceptFriendRequest = async (username) => {
    try {
      const res = await axios.post('/accept-friend-request', { friendUsername: username });
      alert(res.data.message); // Notify the user
      displayReceivedRequests(); // Refresh the received requests list
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };
  