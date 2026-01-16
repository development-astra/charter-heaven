(() => {
    // ✅ Change this when you deploy:
    const API_URL = "https://api.astraresults.com/send_email/v1/green-air";
    // const API_URL = "http://localhost:4848/send_email/v1/green-air";

    function qs(sel, root = document) {
        return root.querySelector(sel);
    }

    // === Professional modal helpers (uses your existing #uiModal) ===
    function openUiModal(message) {
        const uiModal = qs("#uiModal");
        const uiModalMsg = qs("#uiModalMsg");
        if (!uiModal || !uiModalMsg) {
            alert(message); // fallback
            return;
        }
        uiModalMsg.textContent = message;
        uiModal.classList.add("is-open");
        uiModal.setAttribute("aria-hidden", "false");
    }

    function serializeForm(form) {
        const fd = new FormData(form);
        const params = new URLSearchParams();
        for (const [k, v] of fd.entries()) params.append(k, v);
        return params;
    }

    function getRecaptchaResponseForForm(form) {
        const el = form.querySelector(".g-recaptcha");
        if (!el) return { ok: true, token: "" }; // if you ever remove captcha

        if (typeof grecaptcha === "undefined") {
            return { ok: false, token: "", error: "reCAPTCHA is still loading. Please try again." };
        }

        // We stored this in index.html render script:
        const widRaw = el.dataset.widgetId;
        const wid = widRaw ? Number(widRaw) : null;

        const token =
            Number.isFinite(wid) ? grecaptcha.getResponse(wid) : grecaptcha.getResponse();

        if (!token) {
            return { ok: false, token: "", error: "Please complete the reCAPTCHA to submit." };
        }

        return { ok: true, token };
    }

    async function submitForm(form) {
        // Native HTML validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const rec = getRecaptchaResponseForForm(form);
        if (!rec.ok) {
            openUiModal(rec.error);
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.8";
                submitBtn.style.cursor = "not-allowed";
            }

            const params = serializeForm(form);
            params.append("g-recaptcha-response", rec.token);

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: params.toString(),
            });

            const data = await res.json().catch(() => null);

            // If your API returns {success: true/false}
            if (res.ok && data && data.success) {
                window.location.href = "thank-you.html";
            } else {
                window.location.href = "form-error.html";
            }
        } catch (err) {
            console.error("Mail submit error:", err);
            window.location.href = "form-error.html";
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "";
                submitBtn.style.cursor = "";
                submitBtn.innerHTML = originalBtnText;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const heroForm = document.getElementById("contactFormHero");
        const footerForm = document.getElementById("contactFormFooter");

        if (heroForm) {
            heroForm.addEventListener("submit", (e) => {
                e.preventDefault();
                submitForm(heroForm);
            });
        }

        if (footerForm) {
            footerForm.addEventListener("submit", (e) => {
                e.preventDefault();
                submitForm(footerForm);
            });
        }
    });
})();
