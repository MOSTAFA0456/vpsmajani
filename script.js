let currentWord = null;


/* =========================
   SEARCH
========================= */

function searchWord() {

    const input =
        document.getElementById("searchInput");

    const query =
        input.value.trim().toLowerCase();

    if (!query) {
        showHome();
        return;
    }

    const word = words.find(
        item => item.word.toLowerCase() === query
    );

    if (word) {

        showWord(word);

        saveHistory(word.word);

    } else {

        const results = words.filter(
            item =>
                item.word
                .toLowerCase()
                .includes(query)
        );

        if (results.length > 0) {

            showWordList(
                results,
                `نتایج جستجو برای "${query}"`
            );

        } else {

            document.getElementById("result").innerHTML = `

                <div class="welcome">

                    <h2>😕 کلمه پیدا نشد</h2>

                    <p>
                        این کلمه در دیتابیس فعلی وجود ندارد.
                    </p>

                    <p>
                        اگر دیتابیس بزرگ اضافه شود،
                        تعداد بسیار بیشتری از کلمات قابل جستجو خواهند بود.
                    </p>

                </div>

            `;
        }
    }

    document.getElementById("suggestions").innerHTML = "";
}


/* =========================
   SHOW WORD
========================= */

function showWord(word) {

    currentWord = word;

    const favorite =
        isFavorite(word.word);

    document.getElementById("result").innerHTML = `

        <div class="word-card">

            <div class="word-top">

                <div>

                    <div class="word">
                        ${escapeHTML(word.word)}
                    </div>

                    <div class="part">
                        ${escapeHTML(word.partOfSpeech)}
                    </div>

                </div>

                <button
                    class="action-btn speak"
                    onclick="speakWord('${escapeJS(word.word)}')"
                >
                    🔊 تلفظ
                </button>

            </div>


            <div class="translation">

                🇦🇫
                ${escapeHTML(word.translation)}

            </div>


            <div class="pronunciation">

                🔤
                ${escapeHTML(word.pronunciation)}

            </div>


            <div class="definition">

                <h3>📖 تعریف</h3>

                <p>
                    ${escapeHTML(word.definition)}
                </p>

            </div>


            <div class="example">

                <strong>✍️ Example:</strong>

                <br>

                ${escapeHTML(word.example)}

            </div>


            <div class="actions">

                <button
                    class="action-btn favorite"
                    onclick="toggleFavorite('${escapeJS(word.word)}')"
                >
                    ${favorite ? "★ حذف از علاقه‌مندی" : "☆ افزودن به علاقه‌مندی"}
                </button>

            </div>

        </div>
    `;
}


/* =========================
   SPEECH
========================= */

function speakWord(word) {

    if (!("speechSynthesis" in window)) {

        alert("مرورگر شما از تلفظ صوتی پشتیبانی نمی‌کند.");

        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(word);

    speech.lang = "en-US";

    speech.rate = 0.8;

    window.speechSynthesis.speak(speech);
}


/* =========================
   FAVORITES
========================= */

function getFavorites() {

    return JSON.parse(
        localStorage.getItem("afk_favorites") || "[]"
    );
}


function isFavorite(word) {

    return getFavorites()
        .includes(word);
}


function toggleFavorite(word) {

    let favorites = getFavorites();

    if (favorites.includes(word)) {

        favorites =
            favorites.filter(
                item => item !== word
            );

    } else {

        favorites.push(word);
    }

    localStorage.setItem(
        "afk_favorites",
        JSON.stringify(favorites)
    );

    const found =
        words.find(
            item => item.word === word
        );

    if (found) {
        showWord(found);
    }
}


function showFavorites() {

    const favorites =
        getFavorites();

    const list =
        words.filter(
            item => favorites.includes(item.word)
        );

    if (list.length === 0) {

        document.getElementById("result").innerHTML = `

            <div class="welcome">

                <h2>⭐ علاقه‌مندی‌ها</h2>

                <p>
                    هنوز کلمه‌ای ذخیره نکرده‌اید.
                </p>

            </div>

        `;

        return;
    }

    showWordList(
        list,
        "⭐ کلمات مورد علاقه"
    );
}


/* =========================
   HISTORY
========================= */

function getHistory() {

    return JSON.parse(
        localStorage.getItem("afk_history") || "[]"
    );
}


function saveHistory(word) {

    let history =
        getHistory();

    history =
        history.filter(
            item => item !== word
        );

    history.unshift(word);

    history =
        history.slice(0, 20);

    localStorage.setItem(
        "afk_history",
        JSON.stringify(history)
    );
}


function showHistory() {

    const history =
        getHistory();

    const list =
        words.filter(
            item => history.includes(item.word)
        );

    if (list.length === 0) {

        document.getElementById("result").innerHTML = `

            <div class="welcome">

                <h2>🕘 تاریخچه</h2>

                <p>
                    هنوز جستجویی انجام نشده است.
                </p>

            </div>
        `;

        return;
    }

    showWordList(
        list,
        "🕘 آخرین جستجوها"
    );
}


/* =========================
   WORD LIST
========================= */

function showWordList(list, title) {

    let html = `

        <div class="word-card">

            <h2>${escapeHTML(title)}</h2>

            <div class="word-list">

    `;

    list.forEach(word => {

        html += `

            <div
                class="word-item"
                onclick="showWordByName('${escapeJS(word.word)}')"
            >

                <strong>
                    ${escapeHTML(word.word)}
                </strong>

                <br>

                <small>
                    ${escapeHTML(word.translation)}
                </small>

            </div>

        `;
    });

    html += `

            </div>

        </div>

    `;

    document.getElementById("result").innerHTML = html;
}


function showWordByName(name) {

    const word =
        words.find(
            item => item.word === name
        );

    if (word) {

        document.getElementById("searchInput")
            .value = word.word;

        showWord(word);

        saveHistory(word.word);
    }
}


/* =========================
   ALPHABET
========================= */

function createAlphabet() {

    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const container =
        document.getElementById(
            "alphabetButtons"
        );

    alphabet.split("").forEach(letter => {

        const button =
            document.createElement("button");

        button.className = "letter";

        button.textContent = letter;

        button.onclick =
            () => searchByLetter(letter);

        container.appendChild(button);
    });
}


function searchByLetter(letter) {

    const result =
        words.filter(
            word =>
                word.word
                    .toUpperCase()
                    .startsWith(letter)
        );

    if (result.length === 0) {

        document.getElementById("result").innerHTML = `

            <div class="welcome">

                <h2>کلمه‌ای پیدا نشد</h2>

                <p>
                    در دیتابیس فعلی برای حرف
                    ${letter}
                    کلمه‌ای وجود ندارد.
                </p>

            </div>
        `;

        return;
    }

    showWordList(
        result,
        `کلمات با حرف ${letter}`
    );
}


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "afk_dark",
        document.body.classList.contains("dark")
    );
}


function loadDarkMode() {

    const dark =
        localStorage.getItem("afk_dark");

    if (dark === "true") {

        document.body.classList.add("dark");
    }
}


/* =========================
   HOME
========================= */

function showHome() {

    document.getElementById("searchInput").value = "";

    document.getElementById("result").innerHTML = `

        <div class="welcome">

            <h2>👋 خوش آمدید</h2>

            <p>
                یک کلمه انگلیسی وارد کنید تا معنی،
                تلفظ و مثال آن را ببینید.
            </p>

        </div>

    `;
}


/* =========================
   AUTOCOMPLETE
========================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .trim()
                    .toLowerCase();

            const box =
                document.getElementById(
                    "suggestions"
                );

            if (!value) {

                box.innerHTML = "";

                return;
            }

            const matches =
                words
                    .filter(
                        word =>
                            word.word
                                .toLowerCase()
                                .startsWith(value)
                    )
                    .slice(0, 8);

            box.innerHTML =
                matches.map(
                    word => `

                        <div
                            class="suggestion"
                            onclick="selectSuggestion('${escapeJS(word.word)}')"
                        >
                            ${escapeHTML(word.word)}
                        </div>

                    `
                ).join("");
        }
    );


function selectSuggestion(word) {

    document.getElementById(
        "searchInput"
    ).value = word;

    document.getElementById(
        "suggestions"
    ).innerHTML = "";

    searchWord();
}


/* ENTER KEY */

document
    .getElementById("searchInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                searchWord();
            }
        }
    );


/* =========================
   SECURITY HELPERS
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeJS(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


/* =========================
   START
========================= */

createAlphabet();

loadDarkMode();