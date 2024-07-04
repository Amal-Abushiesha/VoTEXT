$(document).ready(function () {
  // Function to check if the user is logged in
  function isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }

  // Function to update UI based on login state
  function updateUI() {
    const signInNavItem = $('#signInNavItem');

    if (isLoggedIn()) {
      // If user is logged in
      signInNavItem.html('<a href="#"><img id="signOutIcon" src="assets/imgs/logout.png" class="img-fluid" alt="Sign out"></a>');

      // Add event listener for sign-out button
      $('#signOutIcon').click(function () {
        // Clear authentication token
        localStorage.removeItem('authToken');
        // Update UI
        updateUI();
      });
    } else {
      // If user is not logged in
      signInNavItem.html('<a href="#" class="btn btn-custom sign-in-btn" data-toggle="modal" data-target="#signinModal">Sign In</a>');
    }
  }

  // Update UI when the page loads
  updateUI();

  // AJAX for Sign Up
  $('#signup-form').on('submit', function (e) {
    e.preventDefault();

    // Reference to the submit button and loading icon
    const signupSubmitBtn = $('#signup-submit-btn');
    const signupSubmitText = $('#signup-submit-text');
    const signupLoadingIcon = $('#signup-loading-icon');

    // Change button text to "Loading..." and show the loading icon
    signupSubmitText.text('Loading...');
    signupLoadingIcon.removeClass('d-none');

    // Gather input data
    const signupEmail = $('#signup_email').val();
    const signupPassword = $('#signup_password').val();
    const confirmPassword = $('#confirm_password').val();

    // Check for password match
    if (signupPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Passwords do not match',
        text: 'Please ensure both passwords are the same.',
        confirmButtonText: 'Try Again'
      });
      // Revert button text and hide loading icon
      signupSubmitText.text('Sign Up');
      signupLoadingIcon.addClass('d-none');
      return;
    }

    // AJAX request to register
    $.ajax({
      url: 'https://project-yhx7.onrender.com/register',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        signup_email: signupEmail,
        signup_password: signupPassword,
        confirm_password: confirmPassword
      }),
      success: function (response) {
        if (response && response.data && response.data.token) {
          // Extract the token from the response
          const authToken = response.data.token;
          // Print the token in the console
          console.log('Authentication token:', authToken);
          // Store the token in localStorage
          localStorage.setItem('authToken', `Barear ${authToken}`);

          Swal.fire({
            icon: 'success',
            title: 'Signup successful!',
            text: 'Your account has been created, Welcom.',
            confirmButtonText: 'OK'
          }).then(() => {
            $('#signupModal').modal('hide');
            $('#signup-form')[0].reset(); // Reset form
            // Revert button text and hide loading icon
            signupSubmitText.text('Sign Up');
            signupLoadingIcon.addClass('d-none');
            window.location.href = '/index.html';

          });
        } else {
          console.error('Token not found in response data.');
          // Revert button text and hide loading icon
          signinSubmitText.text('Sign In');
          signinLoadingIcon.addClass('d-none');
        }

      },
      error: function (xhr, status, error) {
        Swal.fire({
          icon: 'error',
          title: 'Signup failed',
          text: 'An error occurred during signup. Please try again.',
          confirmButtonText: 'Retry'
        });
        console.error('Signup error:', xhr.responseText);
        // Revert button text and hide loading icon
        signupSubmitText.text('Sign Up');
        signupLoadingIcon.addClass('d-none');
      }
    });
  });

  // AJAX for Sign In
  $('#signin-form').on('submit', function (e) {
    e.preventDefault();

    // Reference to the submit button and loading icon
    const signinSubmitBtn = $('#signin-submit-btn');
    const signinSubmitText = $('#signin-submit-text');
    const signinLoadingIcon = $('#signin-loading-icon');

    // Change button text to "Loading..." and show the loading icon
    signinSubmitText.text('Loading...');
    signinLoadingIcon.removeClass('d-none');

    // Gather input data
    const email = $('#email').val();
    const password = $('#password').val();

    // AJAX request to login
    $.ajax({
      url: 'https://project-yhx7.onrender.com/login2',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        email: email,
        password: password
      }),
      success: function (response) {
        // Check if the response contains the token
        if (response && response.data && response.data.token) {
          // Extract the token from the response
          const authToken = response.data.token;
          // Print the token in the console
          console.log('Authentication token:', `Barear ${authToken}`);
          // Store the token in localStorage
          localStorage.setItem('authToken', `Barear ${authToken}`);

          Swal.fire({
            icon: 'success',
            title: 'Login successful!',
            text: 'Welcome back!',
            confirmButtonText: 'Continue'
          }).then(() => {
            $('#signinModal').modal('hide');
            $('#signin-form')[0].reset(); // Reset form
            updateUI(); // Update UI after successful login
            // Revert button text and hide loading icon
            signinSubmitText.text('Sign In');
            signinLoadingIcon.addClass('d-none');
            window.location.href = '/index.html';

          });
        } else {
          console.error('Token not found in response data.');
          // Revert button text and hide loading icon
          signinSubmitText.text('Sign In');
          signinLoadingIcon.addClass('d-none');
        }
      },
      error: function (xhr, status, error) {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Invalid email or password. Please try again.',
          confirmButtonText: 'Retry'
        });
        console.error('Login error:', xhr.responseText);
        // Revert button text and hide loading icon
        signinSubmitText.text('Sign In');
        signinLoadingIcon.addClass('d-none');
      }
    });
  });
});   