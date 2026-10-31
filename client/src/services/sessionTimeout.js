
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

let inactivityTimer;

function logoutUser() {
    // Prevent further activity from resetting the timer
    clearTimeout(inactivityTimer);

    // Clear authentication data
    localStorage.removeItem("hustlehub_token");
    localStorage.removeItem("hustlehub_user");

    // If using sessionStorage for authentication
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = "/login";
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
        logoutUser();
    }, INACTIVITY_LIMIT);
}

// Events that indicate user activity
const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click"
];

// Listen for user activity
activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
});

// Start the timer when the script loads
resetInactivityTimer();
