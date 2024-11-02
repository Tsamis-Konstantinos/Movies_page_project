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
            alert(`Added ${friendUsername} to your friends list.`);
        } else {
            alert(`Failed to add ${friendUsername}.`);
        }
    } catch (error) {
        console.error("Error adding friend:", error);
        alert("Error adding friend.");
    }
};
