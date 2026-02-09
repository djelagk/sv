const dayList = document.getElementById("dayList");
const gameTitle = document.getElementById("gameTitle");
const gameContent = document.getElementById("gameContent");
const unlockHint = document.getElementById("unlockHint");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
let cleanupFn = null;

const devUnlockAll = window.__UNLOCK__ === true;
let secretUnlock = false;
const allUnlocked = () => devUnlockAll || secretUnlock;

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
    title: "Mini quiz",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Mini quiz Saint Valentin</h3>
          <p>3 bonnes reponses et tu gagnes un compliment, petit chat.</p>
          <form id="quizForm">
            <div>
              <p>1) Quel est mon joueur prefere ?</p>
              <label><input type="radio" name="q1" value="a" /> Messi</label><br />
              <label><input type="radio" name="q1" value="b" /> Ronaldo</label><br />
              <label><input type="radio" name="q1" value="c" /> Neymar</label>
            </div>
            <div>
              <p>2) Qui est le plus fort entre Messi et Ronaldo ?</p>
              <label><input type="radio" name="q2" value="a" /> Messi</label><br />
              <label><input type="radio" name="q2" value="b" /> Ronaldo</label>
            </div>
            <div>
              <p>3) Barca ou Real ?</p>
              <label><input type="radio" name="q3" value="a" /> Barca</label><br />
              <label><input type="radio" name="q3" value="b" /> Real</label>
            </div>
            <div class="btn-row">
              <button class="btn" type="submit">Valider</button>
            </div>
          </form>
          <div id="quizResult" class="hint"></div>
        </div>
      `;

      const form = container.querySelector("#quizForm");
      const result = container.querySelector("#quizResult");

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const answers = {
          q1: form.q1.value,
          q2: form.q2.value,
          q3: form.q3.value,
        };
        let score = 0;
        if (answers.q1 === "a") score += 1;
        if (answers.q2 === "a") score += 1;
        if (answers.q3 === "a") score += 1;

        if (score === 3) {
          result.textContent = `Tu as tout bon. Tu es adorable, petit chat. ${getReward(dayIndex)}`;
        } else {
          result.textContent = `Score: ${score}/3. Reessaie  ?`;
        }
      });

      return () => {};
    },
  },
  {
    id: 5,
    title: "Devine le nombre",
    render(container, dayIndex) {
      const secret = Math.floor(Math.random() * 14) + 1;
      container.innerHTML = `
        <div class="game-panel">
          <h3>Devine le nombre (1 a 14)</h3>
          <p>Tu peux essayer autant que tu veux.</p>
          <input class="input" id="guessInput" type="number" min="1" max="14" />
          <div class="btn-row">
            <button class="btn" id="guessBtn">Tester</button>
          </div>
          <div id="guessResult" class="hint"></div>
        </div>
      `;

      const input = container.querySelector("#guessInput");
      const btn = container.querySelector("#guessBtn");
      const result = container.querySelector("#guessResult");

      btn.addEventListener("click", () => {
        const value = Number(input.value);
        if (!value || value < 1 || value > 14) {
          result.textContent = "Entre un nombre entre 1 et 14.";
          return;
        }
        if (value === secret) {
          result.textContent = `Bravo ! C'etait ${secret}. ${getReward(dayIndex)}`;
          btn.disabled = true;
        } else if (value < secret) {
          result.textContent = "Plus grand.";
        } else {
          result.textContent = "Plus petit.";
        }
      });

      return () => {};
    },
  },
  {
    id: 6,
    title: "Reaction rapide",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Reaction rapide</h3>
          <p>Appuie des que le bouton "Je t'aime mon roi" apparait.</p>
          <div class="btn-row">
            <button class="btn" id="startReaction">Lancer</button>
            <button class="btn secondary" id="reactionBtn" disabled>Je t'aime mon roi</button>
          </div>
          <div id="reactionResult" class="hint"></div>
        </div>
      `;

      const startBtn = container.querySelector("#startReaction");
      const reactionBtn = container.querySelector("#reactionBtn");
      const result = container.querySelector("#reactionResult");

      let timeoutId = null;
      let startTime = null;

      startBtn.addEventListener("click", () => {
        result.textContent = "Attends...";
        reactionBtn.disabled = true;
        const delay = 1000 + Math.random() * 2000;
        timeoutId = setTimeout(() => {
          startTime = Date.now();
          reactionBtn.disabled = false;
          result.textContent = "Clique maintenant !";
        }, delay);
      });

      reactionBtn.addEventListener("click", () => {
        if (!startTime) return;
        const reaction = Date.now() - startTime;
        reactionBtn.disabled = true;
        startTime = null;
        result.textContent = `Temps: ${reaction} ms. ${
          reaction < 350 ? "Ultra rapide !" : "Bien joue !"
        } ${getReward(dayIndex)}`;
      });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    },
  },
  {
    id: 7,
    title: "Message final",
    render(container, dayIndex) {
      container.innerHTML = `
        <div class="game-panel">
          <h3>Message final</h3>
          <p>Le dernier jeu, c'est un bisou de 14 secondes.</p>
          <div id="kissArea">
            <p>Maintiens le bouton enfonce 14 secondes.</p>
            <div class="btn-row">
              <button class="btn" id="kissBtn">Bisou 14s</button>
            </div>
            <div id="kissTimer" class="hint kiss-timer"></div>
            <div class="kiss-progress">
              <div id="kissBar" class="kiss-bar"></div>
            </div>
            <div id="kissResult" class="hint"></div>
          </div>
        </div>
      `;

      const kissArea = container.querySelector("#kissArea");
      const kissBtn = container.querySelector("#kissBtn");
      const kissTimer = container.querySelector("#kissTimer");
      const kissResult = container.querySelector("#kissResult");
      const kissBar = container.querySelector("#kissBar");

      const today = new Date();
      const isWeekend = today.getDay() === 6 || today.getDay() === 0;

      if (!isWeekend) {
        kissArea.innerHTML = `
          <p>Ce jeu est reserve au week-end pour un bisou parfait.</p>
          <div class="hint">Reviens samedi ou dimanche pour le debloquer.</div>
        `;
        return () => {};
      }

      let intervalId = null;
      let startTime = null;
      const durationMs = 14000;

      const reset = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        startTime = null;
        kissTimer.textContent = "";
        kissBar.style.width = "0%";
      };

      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, durationMs - elapsed);
        kissTimer.textContent = `Encore ${Math.ceil(remaining / 1000)}s...`;
        kissBar.style.width = `${Math.min(100, (elapsed / durationMs) * 100)}%`;
        if (elapsed >= durationMs) {
          reset();
          kissResult.textContent =
            `Bisou de 14 secondes valide. Tu es mon petit chat, Lisa. ${getReward(dayIndex)}`;
        }
      };

      const startHold = () => {
        kissResult.textContent = "";
        startTime = Date.now();
        updateTimer();
        intervalId = setInterval(updateTimer, 200);
      };

      const cancelHold = () => {
        if (!startTime) return;
        if (Date.now() - startTime < durationMs) {
          kissResult.textContent =
            "Trop court ! Reessaie et tiens 14 secondes, petit chat.";
        }
        reset();
      };

      kissBtn.addEventListener("mousedown", startHold);
      kissBtn.addEventListener("touchstart", startHold);
      kissBtn.addEventListener("mouseup", cancelHold);
      kissBtn.addEventListener("mouseleave", cancelHold);
      kissBtn.addEventListener("touchend", cancelHold);
      kissBtn.addEventListener("touchcancel", cancelHold);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
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

renderDays();

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
