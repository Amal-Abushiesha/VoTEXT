document.addEventListener('DOMContentLoaded', function () {
    fetchHistoryData();
});

function fetchHistoryData() {
    // Retrieve token from localStorage
    const authToken = localStorage.getItem('authToken').split(' ')[1];

    // Check if token exists
    if (!authToken) {
        console.error('Token not found');
        return;
    }

    fetch('https://project-yhx7.onrender.com/historyUser2', {
        headers: {
            'Authorization': `Bearer ${authToken}`, // Include token in headers
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateTable(data.allData);
        } else {
            console.error('Error: Status not success');
        }
    })
    .catch(error => console.error('Error fetching history data:', error));
}

function updateTable(data) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';  // Clear existing rows

    data.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="text-center">${record.currentDate}</td>
            <td class="text-center"><a href="${record.youtube_link}" target="_blank">Link</a></td>
            <td><div class="summary-text">${record.summaries}</div></td>
            <td class="text-center">${record.negative_percentage}</td>
            <td class="text-center">${record.neutral_percentage}</td>
            <td class="text-center">${record.positive_percentage}</td>
            <td class="text-center actions">
                <img src="assets/imgs/remove-blue.svg" alt="Delete" class="icon delete-icon" onclick="deleteRecord(${index})" />
                <img src="assets/imgs/download-blue.svg" alt="Download" class="icon download-icon" onclick="downloadRecord(${index + 1})" />
            </td>
        `;
        tableBody.appendChild(row);
    });

    addReadMoreEventListeners();
}



function toggleSummary(element) {
    const summaryShort = element.previousElementSibling.previousElementSibling;
    const summaryFull = element.previousElementSibling;

    if (summaryFull.classList.contains('d-none')) {
        summaryShort.classList.add('d-none');
        summaryFull.classList.remove('d-none');
        element.innerText = 'Read Less';
    } else {
        summaryShort.classList.remove('d-none');
        summaryFull.classList.add('d-none');
        element.innerText = 'Read More';
    }
}

function downloadRecord(recordId) {
    Swal.fire({
        title: 'Select file format',
        input: 'select',
        inputOptions: {
            'txt': 'Text',
            'doc': 'DOC',
            'docx': 'DOCX',
            'csv': 'CSV',
            'json': 'JSON',
            'asc': 'ASC',
            'rtf': 'RTF',
            'msg': 'MSG'
            // Add more options for other formats if needed
        },
        showCancelButton: true,
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to choose a file format';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const selectedFormat = result.value;

            const row = document.querySelector(`table tbody tr:nth-child(${recordId})`);
            const cells = row.querySelectorAll('td');

            let content = '';
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    if (index === cells.length - 2) {
                        // Add a new line if it's the summary cell
                        content += `${cell.innerText}\n\n`;
                    } else {
                        content += `${cell.innerText}\n`;
                    }
                }
            });

            if (selectedFormat === 'txt') {
                const blob = new Blob([content], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `record-${recordId}.txt`;
                link.click();
            } else if (selectedFormat === 'csv') {
                const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
                const csvLink = document.createElement('a');
                csvLink.setAttribute('href', csvContent);
                csvLink.setAttribute('download', `record-${recordId}.csv`);
                csvLink.click();
            } else if (selectedFormat === 'json') {
                const jsonData = JSON.stringify(content);
                const jsonBlob = new Blob([jsonData], { type: 'application/json' });
                const jsonLink = document.createElement('a');
                jsonLink.href = URL.createObjectURL(jsonBlob);
                jsonLink.setAttribute('download', `record-${recordId}.json`);
                jsonLink.click();
            } else {
                // For other formats, you can implement similar download logic
                const blob = new Blob([content], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `record-${recordId}.${selectedFormat}`;
                link.click();
            }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // User canceled the download
            console.log('Download canceled.');
        }
    });
}


function deleteRecord(recordId) {
    // Display confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this record. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove from frontend
            console.log(recordId);
            // Remove from backend
            fetch(`https://project-yhx7.onrender.com/deleteData/${recordId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('authToken'),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Record deleted:', data);
                    location.reload();
                    updateTable(data.data);
                } else {
                    console.error('Error deleting record:', data);
                }
            })
            .catch(error => console.error('Error deleting record:', error));
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // User canceled the deletion
            console.log('Deletion canceled.');
        }
    });
}

