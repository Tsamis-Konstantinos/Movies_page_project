const userButton = document.getElementById('userButton');
const friendRequestsContainer = document.getElementById('friendRequests');
const searchForm = document.getElementById('searchForm');
const searchResultsContainer = document.getElementById('searchResults');
const friendsListContainer = document.getElementById('friendsList');

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
  
// Send a friend request
const sendFriendRequest = async (recipientId) => {
  try {
    await axios.post('/send-friend-request', { recipientId });
    alert("Friend request sent!");
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
};

// Accept a friend request
const acceptFriendRequest = async (requesterId) => {
  try {
    await axios.post('/accept-friend-request', { requesterId });
    alert("Friend request accepted!");
    displayFriendRequests(); // Refresh friend requests list
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

// Reject a friend request
const rejectFriendRequest = async (requesterId) => {
  try {
    await axios.post('/reject-friend-request', { requesterId });
    alert("Friend request rejected!");
    displayFriendRequests(); // Refresh friend requests list
  } catch (error) {
    console.error("Error rejecting friend request:", error);
  }
};

// Display friend requests
const displayFriendRequests = async () => {
  try {
    const res = await axios.get('/friend-requests');
    const friendRequests = res.data.friendRequests;

    friendRequestsContainer.innerHTML = '';
    friendRequests.forEach(request => {
      const requestElement = document.createElement('div');
      requestElement.innerHTML = `
        <p>${request.username}</p>
        <button onclick="acceptFriendRequest('${request._id}')">Accept</button>
        <button onclick="rejectFriendRequest('${request._id}')">Reject</button>
      `;
      friendRequestsContainer.appendChild(requestElement);
    });
  } catch (error) {
    console.error("Error displaying friend requests:", error);
  }
};

// Search for users by username
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

// Display search results
const displaySearchResults = (users) => {
  searchResultsContainer.innerHTML = ''; // Clear previous results
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.innerHTML = `
      <p>${user.username}</p>
      <button onclick="sendFriendRequest('${user._id}')">Send Friend Request</button>
    `;
    searchResultsContainer.appendChild(userElement);
  });
};

// Function to display the friends list
const displayFriends = async () => {
  try {
    const res = await axios.get('/friends-list'); // Assuming a route '/friends-list' to fetch friends
    const friends = res.data.friends;

    friendsListContainer.innerHTML = ''; // Clear previous friends list
    friends.forEach(friend => {
      const friendElement = document.createElement('div');
      friendElement.textContent = friend.username;
      friendsListContainer.appendChild(friendElement);
    });
  } catch (error) {
    console.error("Error fetching friends list:", error);
  }
};

// Function to fetch user's friends' usernames
document.addEventListener('DOMContentLoaded', async () => {
  try {
      const response = await axios.get('/user-details');
      const friendsUsernames = response.data.friendsUsernames;

      const friendsListDiv = document.getElementById('friendsList');
      if (friendsUsernames.length > 0) {
          friendsListDiv.innerHTML = friendsUsernames.map(username => `<div>${username}</div>`).join('');
      } else {
          friendsListDiv.innerHTML = '<div>No friends added yet.</div>';
      }
  } catch (error) {
      console.error('Error fetching friends usernames:', error);
      document.getElementById('friendsList').innerHTML = '<div>Error fetching friends.</div>';
  }
});

window.addEventListener('DOMContentLoaded', function () {
  updateUserButton();
  displayFriends();
  displayFriendRequests();
});