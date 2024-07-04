document.getElementById('youtube_link').addEventListener('click', function (event) {
    if (!localStorage.getItem('authToken')) {
        event.preventDefault(); // Prevent default action
        showAuthenticationMessage('Please sign in to continue.');
    }
});

function showAuthenticationMessage(message) {
    Swal.fire({
        title: 'Authentication Required',
        text: message,
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

function validateYouTubeLink(link) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return pattern.test(link);
}

function checkAuthenticationAndLink(action) {
    const youtubeLink = document.getElementById('youtube_link').innerText.trim();
    if (!localStorage.getItem('authToken')) {
        showAuthenticationMessage('Please sign in to continue.');
    } else if (!validateYouTubeLink(youtubeLink)) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a YouTube link.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } else {
        if (action === 'summarize') {
            processsummarize();
        } else if (action === 'analyze') {
            processYouTubeLink();
        }
    }
}

document.getElementById('summarizebutton').addEventListener('click', function () {
    checkAuthenticationAndLink('summarize');
});

document.getElementById('submitbutton').addEventListener('click', function () {
    checkAuthenticationAndLink('analyze');
});

document.getElementById('youtube_link').addEventListener('blur', function () {
    const youtubeLink = this.innerText.trim();
    if (youtubeLink && !validateYouTubeLink(youtubeLink)) {
        Swal.fire({
            title: 'Wrong',
            html: '<strong>Invalid YouTube link</strong>. Please enter a valid YouTube link. Example: <u style="font-size: small;">https://www.youtube.com/watch?v=abcd1234</u>',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        this.innerText = ''; // Clear the invalid link
    }
});

function goToHistoryPage() {
    if (localStorage.getItem('authToken')) {
        window.location.href = 'History.html';
    } else {
        showAuthenticationMessage('Please sign in to view the history page.');
    }
}

document.getElementById('History').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action
    goToHistoryPage();
});


function sendMail() {
    var params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
    };

    const serviceID = "service_477r7b1"; // Your EmailJS service ID
    const templateID = "template_wu03azp"; // Your EmailJS template ID

    emailjs.send(serviceID, templateID, params)
        .then(res => {
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
            console.log(res);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Your message was sent successfully!!'
            });
        })
        .catch(err => console.log(err));
}
