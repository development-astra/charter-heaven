(function () {
  "use strict";

  console.log("validate.js loaded ✅");

  let forms = document.querySelectorAll('.contact-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log("Form submitted ✅");

      let thisForm = this;
      let action = thisForm.getAttribute('action');
      if (!action) {
        console.error('Form action is not set!');
        return;
      }

      // ---- 🔍 Custom Validation ----
      let name = thisForm.querySelector('[name="full_name"]');
      let email = thisForm.querySelector('[name="email"]');
      let phone = thisForm.querySelector('[name="phone"]');
      let service = thisForm.querySelector('[name="service"]');

      let errors = [];

      if (name && !name.value.trim()) {
        errors.push("Full name is required.");
      }

      if (email && !email.value.trim()) {
        errors.push("Email is required.");
      } else if (email) {
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
          errors.push("Please enter a valid email address.");
        }
      }

      if (phone && !phone.value.trim()) {
        errors.push("Phone number is required.");
      } else if (phone) {
        let phonePattern = /^[0-9+\-\s]+$/;
        if (!phonePattern.test(phone.value.trim())) {
          errors.push("Phone number can only contain digits, spaces, + or -.");
        }
      }

      if (service && !service.value.trim()) {
        errors.push("Please select a service.");
      }

      // Show errors if any
      if (errors.length > 0) {
        alert("⚠️ Please fix the following:\n\n" + errors.join("\n"));
        return;
      }

      // ---- 🌀 Loader ----
      let loading = thisForm.querySelector('.loading');
      if (loading) loading.style.display = "block";

      let formData = new FormData(thisForm);

      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(response => {
          if (response.ok) {
            return response.text();
          } else {
            throw new Error(`${response.status} ${response.statusText} ${response.url}`);
          }
        })
        .then(data => {
          if (loading) loading.style.display = "none";
          console.log("📩 Server response:", data);

          if (data.trim().startsWith('OK')) {
            window.location.href = "/aqua-pro/thank-you.html";
          } else {
            alert("⚠️ Error: " + data); // show server error for debugging
            window.location.href = "/aqua-pro/form-error.html";
          }
        })
        .catch((error) => {
          if (loading) loading.style.display = "none";
          console.error("Form error:", error);
          window.location.href = "/aqua-pro/form-error.html";
        });
    });
  });

})();
