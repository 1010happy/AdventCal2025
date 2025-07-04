// Select the video element
const video = document.getElementById('video');

// Function to start the camera stream
async function startCamera() {
    try {
        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Set the video source to the camera stream
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing the camera:', error);
        alert('Could not access the camera. Please check your permissions.');
    }
}

// Start the camera stream when the page loads
window.addEventListener('load', startCamera);