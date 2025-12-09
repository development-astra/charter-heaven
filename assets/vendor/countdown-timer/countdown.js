// countdown.js
function startCountdown() {
    // Try to get the saved target date from localStorage
    let countdownDate = localStorage.getItem("countdownTarget");

    if (!countdownDate) {
        // If no date saved, set initial target date (5 days from now)
        const initialDate = new Date();
        initialDate.setDate(initialDate.getDate() + 5);
        countdownDate = initialDate.getTime();
        localStorage.setItem("countdownTarget", countdownDate);
    } else {
        countdownDate = parseInt(countdownDate, 10);
    }

    const interval = setInterval(function () {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display result
        document.getElementById("days").innerHTML = days.toString().padStart(2, "0");
        document.getElementById("hours").innerHTML = hours.toString().padStart(2, "0");
        document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, "0");
        document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, "0");

        // If countdown finished -> restart for the next 5 days
        if (distance < 0) {
            clearInterval(interval);

            // Add 5 days to current target date
            const newDate = new Date(countdownDate);
            newDate.setDate(newDate.getDate() + 5);

            // Save new date in localStorage
            localStorage.setItem("countdownTarget", newDate.getTime());

            // Restart countdown
            startCountdown();
        }
    }, 1000);
}

// Initialize countdown
startCountdown();