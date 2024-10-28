function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordCheckbox = document.getElementById('show_password');

    if (passwordCheckbox.checked) {
        passwordField.type = 'text';
        confirmPasswordField.type = 'text';
    } else {
        passwordField.type = 'password';
        confirmPasswordField.type = 'password';
    }
}