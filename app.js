const input = document.getElementById("wordInput");
const button = document.getElementById("translateBtn");
const result = document.getElementById("result");

button.addEventListener("click", async () => {
    const word = input.value.trim();

    if (!word) {
        result.textContent = "❌ یک کلمه وارد کن";
        return;
    }

    result.textContent = "⏳ در حال ترجمه...";

    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: word
            })
        });

        // اول متن خام را می‌گیریم
        const raw = await response.text();

        console.log("Server response:", raw);

        if (!response.ok) {
            throw new Error(
                raw || `HTTP Error ${response.status}`
            );
        }

        // بعد JSON را تبدیل می‌کنیم
        const data = JSON.parse(raw);

        result.textContent =
            data.translated || "ترجمه‌ای دریافت نشد.";

    } catch (error) {
        console.error(error);

        result.textContent =
            "❌ " + error.message;
    }
});