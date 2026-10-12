const url = "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec";

async function testPost() {
  const payload = {
    userType: "Professional",
    pageUrl: "https://course.techtycoon.in/ai_masterclass/",
    name: "Test User",
    email: "test@example.com",
    phone: "+919876543210",
    countryCode: "+91",
    language: "Tamil",
    batch: "Masterclass 2026",
    amount: 99,
    sessionDate: "27th September 2026",
    sessionTime: "6:00 PM IST",
    seats: 1
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    console.log("Status:", res.status);
    console.log("Redirected:", res.redirected);
    console.log("URL:", res.url);
    const text = await res.text();
    console.log("Response text (first 500 chars):", text.slice(0, 500));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testPost();
