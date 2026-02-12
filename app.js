const dayList = document.getElementById("dayList");
const gameTitle = document.getElementById("gameTitle");
const gameContent = document.getElementById("gameContent");
const unlockHint = document.getElementById("unlockHint");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
let cleanupFn = null;

const devUnlockAll = window.__UNLOCK__ === true;
let secretUnlock = false;
let apiUnlock = false;
const allUnlocked = () => devUnlockAll || secretUnlock || apiUnlock;

const formatDate = (date) =>
  date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => new Date(date.getTime() + days * MS_PER_DAY);

const now = startOfDay(new Date());
const fixedStart = new Date(2026, 1, 8);
const days = Array.from({ length: 7 }, (_, i) => addDays(fixedStart, i));
const getReward = (dayIndex) => {
  if (dayIndex === 2) return "Petit chat a gagné un massage des pieds.";
  const n = new Date().getDate();
  return `Petit chat a gagne ${n} seconde${n > 1 ? "s" : ""} de bisou.`;
};

const games = [
  {
    id: 1,
    title: "Lisa, will you be my valentine ?",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Lisa, will you be my valentine ?</h3>
          <p>Petit chat, la seule bonne reponse est "Oui".</p>
          <div class="btn-row">
            <button class="btn" id="yesBtn">Oui</button>
            <button class="btn secondary" id="noBtn">Non</button>
          </div>
          <div id="answer" class="hint"></div>
          <div class="floating-area" id="floatingArea"></div>
        </div>
      `;

      const yesBtn = container.querySelector("#yesBtn");
      const noBtn = container.querySelector("#noBtn");
      const answer = container.querySelector("#answer");
      const floatingArea = container.querySelector("#floatingArea");

      const moveNo = () => {
        const maxX = floatingArea.clientWidth - 90;
        const maxY = floatingArea.clientHeight - 40;
        const x = Math.max(0, Math.floor(Math.random() * maxX));
        const y = Math.max(0, Math.floor(Math.random() * maxY));
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
      };

      floatingArea.appendChild(noBtn);
      moveNo();

      noBtn.addEventListener("mouseenter", moveNo);
      noBtn.addEventListener("click", moveNo);
      yesBtn.addEventListener("click", () => {
        answer.textContent =
          `Yesss ! petit chat , rendez-vous le 14 pour la surprise finale. Reviens chaque jour pour jouer un nouveau jeu. ${getReward(dayIndex)}`;
      });

      return () => {};
    },
  },
  {
    id: 2,
    title: "Coeur éclatant",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Coeur éclatant</h3>
          <p>Clique 10 fois sur le coeur en moins de 3 secondes.</p>
          <div class="btn-row">
            <button class="btn" id="startHeart">Demarrer</button>
            <span id="timer" class="hint"></span>
          </div>
          <div class="btn-row">
            <button class="btn" id="heartBtn" disabled>❤</button>
          </div>
          <div id="result" class="hint"></div>
        </div>
      `;

      const startBtn = container.querySelector("#startHeart");
      const heartBtn = container.querySelector("#heartBtn");
      const timerEl = container.querySelector("#timer");
      const resultEl = container.querySelector("#result");

      let clicks = 0;
      let remaining = 3;
      let intervalId = null;

      const reset = () => {
        clicks = 0;
        remaining = 3;
        timerEl.textContent = "";
        resultEl.textContent = "";
        heartBtn.disabled = true;
      };

      const start = () => {
        if (intervalId) clearInterval(intervalId);
        reset();
        heartBtn.disabled = false;
        timerEl.textContent = "3s";
        intervalId = setInterval(() => {
          remaining -= 1;
          timerEl.textContent = `${remaining}s`;
          if (remaining <= 0) {
            clearInterval(intervalId);
            heartBtn.disabled = true;
            if (clicks >= 10) {
              resultEl.textContent = `Bravo ! Coeur illumine. ${getReward(dayIndex)}`;
            } else {
              resultEl.textContent = "Presque ! Reessaie.";
            }
          }
        }, 1000);
      };

      heartBtn.addEventListener("click", () => {
        clicks += 1;
        if (clicks >= 10) {
          resultEl.textContent = `Bravo ! Tu as reussi. ${getReward(dayIndex)}`;
        }
      });
      startBtn.addEventListener("click", start);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    },
  },
  {
    id: 3,
    title: "Mot melange",
    render(container, dayIndex) {
      const word = "je suis fou de ton gros pétard";
      const scrambled = word
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

      container.innerHTML = `
        <div class="game-panel">
          <h3>Mot melange</h3>
          <p>Remets la phrase dans le bon ordre :</p>
          <p><strong>${scrambled}</strong></p>
          <p class="hint">Indice : 🍑</p>
          <p class="hint">N'hesite pas a echanger plus d'indices contre des bouts de petites culottes.</p>
          <input class="input" id="wordInput" placeholder="Ta reponse exacte" />
          <div class="btn-row">
            <button class="btn" id="checkWord">Verifier</button>
          </div>
          <div id="wordResult" class="hint"></div>
        </div>
      `;

      const input = container.querySelector("#wordInput");
      const check = container.querySelector("#checkWord");
      const result = container.querySelector("#wordResult");

      check.addEventListener("click", () => {
        if (input.value.trim().toLowerCase() === word) {
          result.textContent = `Parfait ! ${getReward(dayIndex)}`;
        } else {
          result.textContent = "Pas encore. Reessaie.";
        }
      });

      return () => {};
    },
  },
  {
    id: 4,
    title: "Charade",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Charade</h3>
          <p>Résous cette charade, petit chat. Entre le mot en minuscules.</p>
          <div class="charade">
            <p>Mon premier est postérieur.</p>
            <p>Mon second est un fleuve d'Égypte.</p>
            <p>Mon troisième avait un violon.</p>
            <p>Mon dernier représente les États-Unis.</p>
            <p><em>Et mon tout, les femmes l'adorent.</em></p>
          </div>
          <input class="input" id="charadeInput" placeholder="Ta réponse (un seul mot)" />
          <div class="btn-row">
            <button class="btn" id="charadeCheck">Vérifier</button>
          </div>
          <div id="charadeResult" class="hint"></div>
        </div>
      `;

      const input = container.querySelector("#charadeInput");
      const check = container.querySelector("#charadeCheck");
      const result = container.querySelector("#charadeResult");
      const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/\.+$/, "");

      check.addEventListener("click", () => {
        const answer = normalize(input.value);
        const ok = answer === "cunnilingus";
        if (ok) {
          result.textContent = `Bravo, tu as trouvé. Ta récompense, c'est le mot trouvé.`;
        } else {
          result.textContent = "Ce n'est pas ça. Réfléchis à chaque partie.";
        }
      });

      return () => {};
    },
  },
  {
    id: 5,
    title: "Jeudi",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel game-panel--message">
          <p class="final-message">Il n'y a plus d'eau chaude, zuttt !</p>
        </div>
      `;
      return () => {};
    },
  },
  {
    id: 6,
    title: "Blanche neige",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel game-panel--message">
          <p class="final-message">Je reflète sans jamais juger,</p>
          <p class="final-message">Je montre sans jamais parler.</p>
          <p class="final-message">Je garde les secrets des visages,</p>
          <p class="final-message">Et pourtant je ne suis qu’un passage.</p>
        </div>
      `;
      return () => {};
    },
  },
  {
    id: 7,
    title: "Poème secret",
    render(container, dayIndex) {
      const isLastDay = dayIndex === 6;
      container.innerHTML = `
        <div class="game-panel">
          <h3>Poème secret</h3>
          <p>Ce poème cache un mot. Trouve-le, petit chat. Fais attention à la qualité du poème.</p>
          <div class="poem">
            <p>Tu es mon paradis,</p>
            <p>Tu es tout mon amour,</p>
            <p>Ton visage illumine mes nuits,</p>
            <p>Ton sourire est doux,</p>
            <p>Tu vaut plus que de l'or,</p>
            <p>Tu es ma reine,</p>
            <p>Je te donne mon âme.</p>
          </div>
          <input class="input" id="poemInput" placeholder="Le mot secret" />
          <div class="btn-row">
            <button class="btn" id="poemCheck">Verifier</button>
          </div>
          <div id="poemResult" class="hint"></div>
          ${isLastDay ? '<p class="final-message" style="margin-top:20px">Et ce soir, on se retrouve pour une belle soirée. Je t\'aime, Lisa. ❤️</p>' : ""}
        </div>
      `;

      const input = container.querySelector("#poemInput");
      const check = container.querySelector("#poemCheck");
      const result = container.querySelector("#poemResult");

      check.addEventListener("click", () => {
        const answer = input.value.trim().toLowerCase();
        if (answer === "pandora") {
          result.textContent = `Tu as trouvé le mot secret. Mais ce n'est pas finis tu devras faire 1 bisou au maitre du jeu pour débloquer ta récompense)}`;
        } else {
          result.textContent = "Ce n'est pas ça.";
        }
      });

      return () => {};
    },
  },
];

const renderDays = () => {
  dayList.innerHTML = "";
  let nextLocked = null;

  days.forEach((date, index) => {
    const unlocked = allUnlocked() || now >= date;
    const allowClick = unlocked || index === 0;
    if (!unlocked && !nextLocked) nextLocked = date;
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <strong>Jour ${index + 1}</strong>
      <span>${formatDate(date)}</span>
      <button ${allowClick ? "" : "disabled"} data-day="${index}" type="button">
        ${allowClick ? "Jouer" : "Verrouille"}
      </button>
    `;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => openGame(index));
    card.addEventListener("click", (event) => {
      if (event.target.tagName.toLowerCase() === "button") return;
      if (!allowClick) return;
      openGame(index);
    });
    dayList.appendChild(card);
  });

  if (allUnlocked()) {
    unlockHint.textContent =
      devUnlockAll ? "Mode dev actif : tous les jeux sont debloques." : "Tous les jeux sont debloques.";
  } else if (nextLocked) {
    unlockHint.textContent = `Prochain jeu dispo le ${formatDate(nextLocked)}.`;
  } else {
    unlockHint.textContent = "Tous les jeux sont debloques.";
  }
};

const openGame = (index) => {
  const game = games[index];
  if (!game) return;
  if (cleanupFn) cleanupFn();
  cleanupFn = game.render(gameContent, index);
  gameTitle.textContent = `Jour ${index + 1} – ${game.title}`;
};

const initUnlockAndRender = async () => {
  const backendUrl = window.__BACKEND_URL__;
  const urlParams = new URLSearchParams(window.location.search);
  const unlockToken = urlParams.get("unlock");

  if (unlockToken && backendUrl) {
    window.location.href = `${backendUrl}/unlock?token=${encodeURIComponent(unlockToken)}`;
    return;
  }

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/unlock-status`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        apiUnlock = data.unlocked === true;
      }
    } catch (_) {}
  }
  renderDays();
};

initUnlockAndRender();

(function () {
  const footer = document.querySelector(".footer p");
  if (!footer) return;
  let clicks = 0;
  let timer = null;
  footer.addEventListener("click", () => {
    clicks += 1;
    if (timer) clearTimeout(timer);
    if (clicks >= 3) {
      clicks = 0;
      secretUnlock = true;
      renderDays();
    } else {
      timer = setTimeout(() => { clicks = 0; }, 400);
    }
  });
})();

(function () {
  const container = document.getElementById("heartsContainer");
  if (!container) return;
  const hearts = ["❤️", "💕", "💗", "💖", "💝"];
  const count = 18;
  const items = [];

  const rand = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "heart";
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = rand(0, 100) + "%";
    el.style.top = rand(0, 100) + "%";
    container.appendChild(el);
    const size = 0.8 + Math.random() * 1.2;
    items.push({
      el,
      x: rand(0, 100),
      y: rand(0, 100),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.08, 0.08),
      size,
    });
  }

  let w = window.innerWidth;
  let h = window.innerHeight;

  const tick = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    const heartSizePercent = 4;
    items.forEach((item) => {
      let { x, y, vx, vy } = item;
      x += vx;
      y += vy;
      if (x <= 0) { x = 0; item.vx = -vx; }
      else if (x >= 100 - heartSizePercent) { x = 100 - heartSizePercent; item.vx = -vx; }
      if (y <= 0) { y = 0; item.vy = -vy; }
      else if (y >= 100 - heartSizePercent) { y = 100 - heartSizePercent; item.vy = -vy; }
      item.x = x;
      item.y = y;
      item.el.style.left = x + "%";
      item.el.style.top = y + "%";
      item.el.style.fontSize = (item.size * 1.5) + "rem";
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
