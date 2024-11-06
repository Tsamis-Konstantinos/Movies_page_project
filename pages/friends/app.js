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
                <p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p><p> </p>
                <button onclick="acceptFriendRequest('${request._id}')">Accept</button>
                <button onclick="rejectFriendRequest('${request._id}')">Reject</button>
            `;
            friendRequestsContainer.appendChild(requestElement);
        });
    } catch (error) {
        console.error("Error displaying friend requests:", error);
        friendRequestsContainer.innerHTML = '<div>Error loading friend requests.</div>';
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

// Send a friend request
const sendFriendRequest = async (recipientId) => {
    try {
        await axios.post('/send-friend-request', { recipientId });
        alert("Friend request sent!");
        displayFriendRequests(); // Refresh friend requests list if needed
    } catch (error) {
        console.error("Error sending friend request:", error);
    }
};

// Handle user search
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

// Fetch and display user's friends list
const displayFriends = async () => {
    try {
        const response = await axios.get('/user-details');
        const friendsUsernames = response.data.friendsUsernames;

        friendsListContainer.innerHTML = friendsUsernames.length > 0 
            ? friendsUsernames.map(username => `
                <div>
                    ${username}
                    <button onclick="window.location.href='http://localhost:3000/friends/${encodeURIComponent(username)}'">
                        See common movies
                    </button>
                </div>
            `).join('')
            : '<div>No friends added yet.</div>';
    } catch (error) {
        console.error('Error fetching friends usernames:', error);
        friendsListContainer.innerHTML = '<div>Error fetching friends.</div>';
    }
};

// Initial setup on page load
window.addEventListener('DOMContentLoaded', async function () {
    await updateUserButton(); // Check login state and update user button
    await displayFriends();   // Display friends list
    await displayFriendRequests(); // Display friend requests
});
