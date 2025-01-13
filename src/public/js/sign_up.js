async function validateForm(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.{8,})/; // Password criteria

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert("Password must contain at least 8 characters, one capital letter, one number, and one symbol.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Create a user object to send to the server
    const userData = {
        username,
        email,
        password
    };

    try {
        // Submit the form data via POST request to the server
        const response = await axios.post('/signup', userData);
        // Redirect to login if successful
        window.location.href = response.data.redirectUrl; // Adjust based on response structure
    } catch (error) {
        if (error.response) {
            alert(error.response.data);
        } else {
            alert("An error occurred. Please try again.");
        }
    }
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm_password');
    const passwordCheckbox = document.getElementById('show_password');

    if (passwordCheckbox.checked) {
        passwordField.type = 'text';
        confirmPasswordField.type = 'text';
    } else {
        passwordField.type = 'password';
        confirmPasswordField.type = 'password';
    }
}
