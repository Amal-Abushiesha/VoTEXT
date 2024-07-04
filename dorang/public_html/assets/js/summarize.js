function smoothScrollTo(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to show form container and scroll to it smoothly
function showFormContainer() {
    var formContainer = document.getElementById('formContainer');
    if (formContainer.style.display === 'none') {
        formContainer.style.display = 'block';
        setTimeout(function () {
            formContainer.style.opacity = '1';
            smoothScrollTo(formContainer);
        }, 10);
    } else {
        smoothScrollTo(formContainer);
    }
}

// Prevent default animation on submit
document.getElementById("submitbutton").addEventListener("click", function () {
    const progressCircles = document.querySelectorAll("circle");
    progressCircles.forEach((circle) => {
        circle.style.animation = "none"; // Prevent animation
    });
});

// Event listener for clicking on the "Summarize" button
document.getElementById('summarizeBtn').addEventListener('click', function () {
    showFormContainer();
});

// Event listener for clicking on the "Summarize" link
document.getElementById('summarizeLink').addEventListener('click', function (event) {
    event.preventDefault();
    showFormContainer();
});

document.getElementById('summarizefooter').addEventListener('click', function (event) {
    event.preventDefault();
    showFormContainer();
});

// Event listener for clicking on the "Services" link
document.getElementById('servicesLink').addEventListener('click', function (event) {
    event.preventDefault();
    var servicesSection = document.getElementById('servicesSection');
    smoothScrollTo(servicesSection);
});

document.getElementById('servicesfooter').addEventListener('click', function (event) {
    event.preventDefault();
    var servicesSection = document.getElementById('servicesSection');
    smoothScrollTo(servicesSection);
});

// start of result div  
function copyText() {
    var textarea = document.getElementById('result');
    textarea.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges(); // Remove the selection
    showMessage('Text copied!');
}

function clearText() {
    var textarea = document.getElementById('result');
    textarea.value = '';
    showMessage('Text cleared!');
}

function showMessage(message) {
    var msgElement = document.getElementById('messageElement');
    msgElement.textContent = message;
    msgElement.style.left = (event.clientX + 10) + 'px';
    msgElement.style.top = (event.clientY - 20) + 'px';
    msgElement.classList.remove('hide'); // Make sure it's visible
    setTimeout(function () {
        msgElement.classList.add('hide'); // Hide the message after 1.5 seconds
    }, 1000);
}
// end of result div

