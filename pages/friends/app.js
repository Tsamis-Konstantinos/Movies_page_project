const userButton = document.getElementById('userButton');
const searchForm = document.getElementById('searchForm');
const searchResults = document.getElementById('searchResults');

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

// Function to search for friends
searchForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting
    searchFriends(); // Call the search function instead
});

const searchFriends = async () => {
    const searchInput = document.getElementById('searchInput').value;
    searchResults.innerHTML = ""; // Clear previous results

    try {
        const res = await axios.get('/search-friends', { params: { username: searchInput } });
        if (res.data.length > 0) {
            res.data.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-result');
                
                const userName = document.createElement('span');
                userName.textContent = user.username;
                
                const addButton = document.createElement('button');
                addButton.textContent = "Add";
                addButton.onclick = () => addFriend(user.username);

                userDiv.appendChild(userName);
                userDiv.appendChild(addButton);
                searchResults.appendChild(userDiv);
            });
        } else {
            searchResults.innerHTML = "No friends found.";
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert(error.response.data.message); // Alert with "Please log in to search for friends"
            window.location.href = '/login'; // Redirect to login page
        } else {
            console.error("Error searching friends:", error);
            searchResults.innerHTML = "Error searching friends.";
        }
    }
};

// Function to add a friend
const addFriend = async (friendUsername) => {
    try {
        const res = await axios.post('/add-friend', { friendUsername });
        if (res.data.redirect) {
            // Redirect if not logged in
            window.location.href = res.data.redirect;
        } else if (res.data.success) {
            alert(`User ${friendUsername} has received a friend request.`);
            loadFriendRequests(); // Refresh friend requests
        } else {
            alert(`Failed to add ${friendUsername}.`);
        }
    } catch (error) {
        console.error("Error adding friend:", error);
        alert("Error adding friend.");
    }
};

// Function to load friend requests
const loadFriendRequests = async () => {
    try {
        const res = await axios.get('/friend-requests');
        const { sentRequests, receivedRequests } = res.data;

        // Populate sent requests
        const sentDiv = document.getElementById('sent');
        sentDiv.innerHTML = sentRequests.length > 0 
            ? sentRequests.map(username => `
                <div>
                    ${username} 
                    <button onclick="removeSentRequest('${username}')">Remove</button>
                </div>`).join('') 
            : "No sent requests.";

        // Populate received requests
        const receivedDiv = document.getElementById('received');
        receivedDiv.innerHTML = receivedRequests.length > 0 
            ? receivedRequests.map(username => `
                <div>
                    ${username} 
                    <button onclick="acceptFriendRequest('${username}')">Accept</button>
                    <button onclick="removeReceivedRequest('${username}')">Remove</button>
                </div>`).join('') 
            : "No received requests.";
    } catch (error) {
        if (error.response && error.response.status === 401) {
            alert(error.response.data.message);
            window.location.href = '/login';
        } else {
            console.error("Error loading friend requests:", error);
        }
    }
};

// Function to accept a received friend request
async function acceptFriendRequest(username) {
    try {
        const response = await fetch('/accept-friend-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (response.ok) {
            // Notify the user
            alert(data.message); 
            // Refresh the received requests
            refreshReceivedRequests();
        } else {
            alert(data.message); // Notify the user of the error
        }
    } catch (error) {
        console.error("Error accepting friend request:", error);
    }
}

async function refreshReceivedRequests() {
    try {
        const response = await fetch('/friend-requests'); // Endpoint to fetch friend requests
        const data = await response.json();
        if (response.ok) {
            renderReceivedRequests(data.receivedRequests); // Call the function to render received requests
        } else {
            console.error("Error fetching received requests:", data.message);
        }
    } catch (error) {
        console.error("Error refreshing received requests:", error);
    }
}

function renderReceivedRequests(receivedRequests) {
    const receivedDiv = document.getElementById("received");
    receivedDiv.innerHTML = ""; // Clear existing content

    receivedRequests.forEach(username => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `
            <span>${username}</span>
            <button onclick="acceptFriendRequest('${username}')">Accept</button>
            <button onclick="removeReceivedRequest('${username}')">Remove</button>
        `;
        receivedDiv.appendChild(userDiv);
    });
}

// Function to remove a sent friend request
const removeSentRequest = async (username) => {
    try {
        const res = await axios.post('/remove-sent-request', { username });
        alert(res.data.message); // Display success message
        loadFriendRequests(); // Reload friend requests to reflect changes
    } catch (error) {
        console.error("Error removing sent request:", error);
        alert("Error removing sent request.");
    }
};

// Function to remove a received friend request
const removeReceivedRequest = async (username) => {
    try {
        const res = await axios.post('/remove-received-request', { username });
        alert(res.data.message); // Display success message
        loadFriendRequests(); // Reload friend requests to reflect changes
    } catch (error) {
        console.error("Error removing received request:", error);
        alert("Error removing received request.");
    }
};

// Load friend requests when the page is loaded
window.onload = loadFriendRequests;

// Load the username or set login button on page load
window.addEventListener('DOMContentLoaded', function () {
    updateUserButton(); // Check login state and update user button
    loadFriendRequests(); // Load friend requests on page load
});
