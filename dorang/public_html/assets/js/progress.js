
function processYouTubeLink() {
    const youtubeLink = document.getElementById('youtube_link').innerText.trim();

    if (youtubeLink) {
        const requestData = {youtube_link: youtubeLink};

        // Make progress circles visible at the start of the AJAX request
        const submitButton = document.getElementById('submitbutton');
        submitButton.innerHTML = `<img src="https://i.gifer.com/VAyR.gif" alt="Loading" style="height:24px;">`;  // Loading icon

                // Words to display during loading
        const loadingWords = ["Loading...", "Processing...", "Analyzing...", "Working...", "Fetching Data..."];

        // Display the initial loading text with a smooth transition
        loadingText.style.opacity = 0;  // Start with invisible text
        setTimeout(() => {
            loadingText.innerText = loadingWords[0];  // Display the first word
            loadingText.style.opacity = 1;  // Gradually make it visible
        }, 500);  // Delay to allow smooth transition

        // Update text every second with smooth transitions
        let wordIndex = 1;  // Start from the second word
        const textInterval = setInterval(() => {
            loadingText.style.opacity = 0;  // Smoothly disappear
            setTimeout(() => {
                loadingText.innerText = loadingWords[wordIndex % loadingWords.length];
                loadingText.style.opacity = 1;  // Smoothly appear
                wordIndex++;
            }, 500);  // Delay to allow smooth transition
        }, 2000);  // Change every 2 seconds


        $.ajax({
            url: '/analyze_comments',  // Flask endpoint
            type: 'POST',
            contentType: 'application/json',
            headers:{'Authorization': localStorage.getItem('authToken')},
            data: JSON.stringify(requestData),  // JSON data
            success: function (data) {

                // Restore button content and clear interval
                submitButton.innerHTML = 'Regenerate';
                clearInterval(textInterval);  // Stop changing text
                loadingText.innerText = '';  // Clear loading text

                document.getElementById('p1').innerText = data.positive_percentage || 0;
                document.getElementById('p2').innerText = data.neutral_percentage || 0;
                document.getElementById('p3').innerText = data.negative_percentage || 0;
                document.getElementById('progress-circles').style.display = 'flex';  // Display the basic circles

                // Delay the stroke animation by 1 second
                setTimeout(() => {
                    // Apply the stroke animation after the delay
                    const progressCircles = document.querySelectorAll("svg circle");
                    progressCircles.forEach((circle, index) => {
                        let dataValue = 0;

                        if (index === 0) {
                            dataValue = data.positive_percentage;
                        } else if (index === 1) {
                            dataValue = data.neutral_percentage;
                        } else if (index === 2) {
                            dataValue = data.negative_percentage;
                        }

                        const percentage = parseInt(dataValue, 10) || 0;
                        const offset = 472 - (472 * percentage / 100);  // Adjust stroke-dashoffset

                        // Apply smooth transition for a visual effect
                        circle.style.transition = "stroke-dashoffset 2s linear";  // Smooth transition
                        circle.style.stroke = "#007bff";  // Set stroke color to blue
                        circle.style.strokeDashoffset = offset;  // Set correct offset
                    });
                }, 500);  // Delay by 0.5 second
            },
            error: function (error) {
                // console.error('Error analyzing comments:', error);
                swal({
                    title: "Error!",
                    text: "Failed to analyze comments. Please try again later.",
                    icon: "error",
                    button: "OK",
                });
                // Restore button content on error and clear interval
                submitButton.innerHTML = 'Retry';
                clearInterval(textInterval);  // Stop changing text
                loadingText.innerText = 'Error processing request';  // Indicate error

            }
        });
    } else {
        console.warn('Please provide a valid YouTube link.');
    }
}