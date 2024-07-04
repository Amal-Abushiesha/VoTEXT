function processsummarize() {
    const youtubeLink = document.getElementById('youtube_link').innerText.trim(); // Use innerText to get content
    const summarizeButton = document.getElementById('summarizebutton');

    if (!youtubeLink) {
        console.warn('Please provide a valid YouTube link.');
        return; // Exit the function if there's no YouTube link
    }

    const requestData = { youtube_link: youtubeLink };

    // Disable the submit button
    summarizeButton.disabled = true;

    // Check if loading elements already exist in the DOM
    let loadingIcon = document.getElementById('loading-icon');
    let loadingText = document.getElementById('loading-text');

    // If loading elements don't exist, create and append them
    if (!loadingIcon || !loadingText) {
        loadingIcon = document.createElement('img');
        loadingIcon.id = 'loading-icon';
        loadingIcon.src = 'https://i.gifer.com/VAyR.gif';
        loadingIcon.alt = 'Loading';
        loadingIcon.style.height = '24px';

        loadingText = document.createElement('div');
        loadingText.id = 'loading-text';
        loadingText.classList.add('additional-info');

        const loadingDiv = document.getElementById('loading-summarize');
        loadingDiv.appendChild(loadingIcon);
        loadingDiv.appendChild(loadingText);
    }

    const loadingWords = ["Loading...", "Processing...", "Analyzing...", "Working...", "Fetching Data..."];
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

    fetch('/summarize', {
        method: 'POST',
        headers: {
            'Authorization': localStorage.getItem('authToken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            const resultTextarea = document.getElementById('result');

            // Extract the summaries array from the response
            const summaries = data.summaries;

            // Create a string to accumulate the formatted output
            let formattedOutput = '';

            // Iterate over each summary object
            summaries.forEach(summaryObj => {
                const timeRange = summaryObj.time_range;
                const summaryText = summaryObj.summary;

                // Append the time range followed by the summary to formattedOutput
                formattedOutput += `${timeRange}\n${summaryText}\n\n`;
            });

            // Set the formatted output to the resultTextarea
            resultTextarea.value = formattedOutput;

            // Remove the loading icon and text
            clearInterval(textInterval);
            loadingIcon.parentNode.removeChild(loadingIcon);
            loadingText.parentNode.removeChild(loadingText);

            // Re-enable the submit button and change its text
            summarizeButton.disabled = false;
            summarizeButton.innerHTML = 'Regenerate';
        })
        .catch(error => {
            // console.error('Error:', error);
           // Show sweet alert notification
            swal({
                title: "Error!",
                text: "Failed to fetch data. Please try again later.",
                icon: "error",
                button: "OK",
            });
            // Remove the loading icon and text
            clearInterval(textInterval);
            loadingIcon.parentNode.removeChild(loadingIcon);
            loadingText.parentNode.removeChild(loadingText);

            // Re-enable the submit button in case of error
            summarizeButton.disabled = false;
        });
}
