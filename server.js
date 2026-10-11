const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

const englishToPersian = {
    hello: "سلام",
    world: "دنیا",
    love: "عشق",
    water: "آب",
    computer: "کامپیوتر",
    create: "ایجاد کردن",
    dictionary: "فرهنگ لغت",
    friend: "دوست",
    game: "بازی",
    happy: "خوشحال",
    house: "خانه",
    language: "زبان",
    learn: "یاد گرفتن",
    school: "مدرسه",
    strong: "قوی",
    technology: "فناوری",
    important: "مهم",
    about: "درباره",
    beautiful: "زیبا",
    book: "کتاب",
    ability: "توانایی",
    thank: "تشکر",
    you: "شما",
    my: "من",
    name: "نام",
    good: "خوب",
    nice: "خوب",
    day: "روز",
    time: "زمان",
    english: "انگلیسی",
    persian: "فارسی",
    this: "این",
    that: "آن",
    is: "است",
    are: "هستند",
    where: "کجا",
    when: "چه وقت",
    why: "چرا",
    how: "چطور",
    what: "چه",
    yes: "بله",
    no: "نه",
    morning: "صبح",
    evening: "عصر",
    school: "مدرسه",
    house: "خانه"
};

const persianToEnglish = Object.fromEntries(
    Object.entries(englishToPersian).map(([en, fa]) => [fa, en])
);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

function translateLocally(text, from = "en", to = "fa") {
    const normalized = String(text || "").trim();

    if (!normalized) {
        return null;
    }

    if (from === "en" && to === "fa") {
        const lower = normalized.toLowerCase();
        if (englishToPersian[lower]) {
            return englishToPersian[lower];
        }

        const words = lower.split(/\s+/);
        const translatedWords = words.map(word => englishToPersian[word] || word);
        const translatedText = translatedWords.join(" ");

        return translatedText !== lower ? translatedText : null;
    }

    if (from === "fa" && to === "en") {
        const lower = normalized.toLowerCase();
        if (persianToEnglish[lower]) {
            return persianToEnglish[lower];
        }

        const words = normalized.split(/\s+/).map(word => word.toLowerCase());
        const translatedWords = words.map(word => persianToEnglish[word] || word);
        const translatedText = translatedWords.join(" ");

        return translatedText !== lower ? translatedText : null;
    }

    return null;
}

app.post("/translate", async (req, res) => {
    try {
        const text = String(req.body?.text || "").trim();
        const from = String(req.body?.from || "en").toLowerCase();
        const to = String(req.body?.to || "fa").toLowerCase();

        if (!text) {
            return res.status(400).json({
                error: "لطفاً یک کلمه یا جمله وارد کنید."
            });
        }

        const localTranslation = translateLocally(text, from, to);

        if (localTranslation) {
            return res.json({
                original: text,
                translated: localTranslation,
                detectedLanguage: from
            });
        }

        if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
            return res.status(404).json({
                error: "این کلمه در فرهنگ لغت محلی پیدا نشد. برای ترجمه با Google، کلید API را تنظیم کنید."
            });
        }

        const response = await fetch(
            "https://translation.googleapis.com/language/translate/v2",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": GOOGLE_API_KEY
                },
                body: JSON.stringify({
                    q: text,
                    source: from,
                    target: to,
                    format: "text"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return res.status(response.status).json({
                error: data?.error?.message || "خطا در اتصال به Google Translate"
            });
        }

        const translation = data?.data?.translations?.[0];

        if (!translation) {
            return res.status(500).json({
                error: "ترجمه‌ای دریافت نشد."
            });
        }

        res.json({
            original: text,
            translated: translation.translatedText,
            detectedLanguage: translation.detectedSourceLanguage || from
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "خطا در ارتباط با سرویس ترجمه."
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log(" AFK_Group Dictionary");
    console.log("======================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("Translation mode: local dictionary fallback");
    console.log("");
});