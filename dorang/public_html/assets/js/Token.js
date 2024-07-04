// Function to send data to /summarize endpoint
async function sendSummarizeRequest(youtubeLink) {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ youtube_link: youtubeLink })
    });
    const data = await response.json();
    console.log(data);
}

// Function to send data to /analyze_comments endpoint
async function sendAnalyzeCommentsRequest(youtubeLink) {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/analyze_comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ youtube_link: youtubeLink })
    });
    const data = await response.json();
    console.log(data);
}
