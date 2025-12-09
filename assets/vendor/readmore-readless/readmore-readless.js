document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".read-more-btn");

    buttons.forEach((btn) => {
        btn.addEventListener("click", function () {
            const text = this.previousElementSibling;

            text.classList.toggle("expanded");
            this.textContent = text.classList.contains("expanded")
                ? "Read less"
                : "Read more";
        });
    });
});