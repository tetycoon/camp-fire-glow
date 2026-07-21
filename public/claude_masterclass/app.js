/**
 * CLAUDE MASTERCLASS — FRONTEND LOGIC & RAZORPAY INTEGRATION
 * Web App Endpoint: https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec
 */

const APPS_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec";
let selectedPlan = 299;

// Countdown Timer Logic
(function startCountdown() {
    const targetDate = new Date('2026-07-25T17:00:00+05:30').getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            const elDays = document.getElementById('cd-days');
            const elHours = document.getElementById('cd-hours');
            const elMins = document.getElementById('cd-mins');
            const elSecs = document.getElementById('cd-secs');

            if (elDays) elDays.innerText = String(days).padStart(2, '0');
            if (elHours) elHours.innerText = String(hours).padStart(2, '0');
            if (elMins) elMins.innerText = String(mins).padStart(2, '0');
            if (elSecs) elSecs.innerText = String(secs).padStart(2, '0');
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
})();

// Modal Control
function openPaymentModal(plan = 299) {
    selectedPlan = plan;
    selectPass(plan);
    goToStep1();
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function selectPass(plan) {
    selectedPlan = plan;
    
    // Update Option Cards
    document.getElementById('opt-299').classList.toggle('selected', plan === 299);
    document.getElementById('opt-999').classList.toggle('selected', plan === 999);

    // Update Price Summaries
    document.getElementById('selected-pass-total').innerText = `₹${plan} INR`;
    document.getElementById('form-fee-display').innerText = `₹${plan} INR`;
    document.getElementById('btn-fee-display').innerText = `₹${plan}`;
    document.getElementById('back-pass-price').innerText = `₹${plan}`;
    
    const mobPrice = document.getElementById('mobile-pass-price');
    if (mobPrice) mobPrice.innerText = `₹${plan} INR`;

    // Update Warning Note
    const passNote = document.getElementById('pass-note');
    if (passNote) {
        if (plan === 299) {
            passNote.innerHTML = '⚠️ Live session only (No recorded access in ₹299 pass)';
            passNote.style.color = '#D85A30';
        } else {
            passNote.innerHTML = '⭐ Includes full recorded video access + source code!';
            passNote.style.color = '#6B4FBB';
        }
    }
}

function goToStep1() {
    document.getElementById('modal-step-1').style.display = 'block';
    document.getElementById('modal-step-2').style.display = 'none';
}

function goToStep2() {
    document.getElementById('modal-step-1').style.display = 'none';
    document.getElementById('modal-step-2').style.display = 'block';
}

// Accordion Control
function toggleFaq(buttonElement) {
    const faqItem = buttonElement.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
    
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Form Submission & Razorpay Checkout
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim().replace(/\D/g, '');
    const profession = document.getElementById('cust-profession').value;

    if (phone.length !== 10) {
        alert('Please enter a valid 10-digit WhatsApp mobile number.');
        return;
    }

    const submitBtn = document.getElementById('pay-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerText = 'Initializing payment...';
    submitBtn.disabled = true;

    try {
        // Step 1: Send lead data to Google Apps Script Web App to get Order ID
        let orderId = "";
        try {
            const res = await fetch(APPS_SCRIPT_WEBAPP_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    profession: profession,
                    language: "Tamil (தமிழ்)",
                    amount: selectedPlan
                })
            });
            const data = await res.json();
            if (data && data.orderId) {
                orderId = data.orderId;
            }
        } catch (err) {
            console.warn("Backend order creation warning, opening Razorpay direct checkout", err);
        }

        // Step 2: Open Razorpay Modal
        const options = {
            key: "rzp_live_T2CbVONQc6qrqj",
            amount: selectedPlan * 100,
            currency: "INR",
            name: "Claude Masterclass 2026",
            description: selectedPlan === 999 
                ? "VIP All-Access Pass (Live + Recordings + Source Code)" 
                : "Standard Live Session Pass",
            image: "https://aitycoon.in/images/tech_tycoon_logo.png",
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: "#D85A30"
            },
            handler: async function (response) {
                try {
                    await fetch(APPS_SCRIPT_WEBAPP_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({
                            paymentSuccess: true,
                            razorpay_order_id: response.razorpay_order_id || orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            name: name,
                            email: email,
                            phone: phone,
                            amount: selectedPlan
                        })
                    });
                } catch (e) {
                    console.error("Payment notification error", e);
                }

                alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour registration is confirmed. Check your email & WhatsApp for Zoom details.`);
                closePaymentModal();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            },
            modal: {
                ondismiss: function () {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        };

        if (orderId) {
            options.order_id = orderId;
        }

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error(err);
        alert('Error initiating checkout. Please try again.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
