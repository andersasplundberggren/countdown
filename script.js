/* Flip-Clock Nedräkning
   — Redigera inställningarna här nere —
*/
const TITLE = "Varmt välkommen om";
// Ange mål i ISO 8601 med explicit svensk offset.
// Sommartid (mar–okt): +02:00  •  Vintertid (okt–mar): +01:00
const TARGET = new Date("2025-08-18T08:00:00+01:00");
const TARGET_TEXT = "Knickedicken med kicken till KLK";

/* ———— Ingen ändring behövs nedan ———— */

document.getElementById("title").textContent = TITLE;
document.getElementById("targetText").textContent = TARGET_TEXT;

const containers = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

function makeDigit(initial = "0"){
  const d = document.createElement("div");
  d.className = "digit";
  d.dataset.number = initial;

  d.innerHTML = `
    <div class="card">
      <div class="top">${initial}</div>
      <div class="bottom">${initial}</div>
      <div class="flip">
        <div class="flip-top">${initial}</div>
        <div class="flip-bottom">${initial}</div>
      </div>
    </div>
  `;

  // Lägg till event-lyssnare för tajtare kontroll
  const flip = d.querySelector(".flip");
  const flipTop = d.querySelector(".flip-top");
  const flipBottom = d.querySelector(".flip-bottom");
  const top = d.querySelector(".top");
  const bottom = d.querySelector(".bottom");

  // När övre halvan flippat klart: uppdatera top till nya siffran (men den är nedfälld)
  flipTop.addEventListener("animationend", (e) => {
    if (e.animationName !== "flipTop") return;
    top.textContent = flipBottom.textContent; // top blir nu nya siffran (syns först när flip-bottom fälls upp klart)
  });

  // När nedre halvan flippat klart: lås allt till nya siffran och avsluta
  flipBottom.addEventListener("animationend", (e) => {
    if (e.animationName !== "flipBottom") return;
    const newVal = flipBottom.textContent;
    top.textContent = newVal;
    bottom.textContent = newVal;
    d.dataset.number = newVal;
    flip.classList.remove("play"); // avsluta spelad klass
  });

  d._setNumbers = (current, next) => {
    // Statiska ytor: initialt visar båda CURRENT tills halvtid
    top.textContent = current;
    bottom.textContent = current;

    // Flip-plattor: övre visar CURRENT (fälls ned), nedre visar NEXT (fälls upp)
    flipTop.textContent = current;
    flipBottom.textContent = next;
  };

  d._play = () => {
    const flip = d.querySelector(".flip");
    flip.classList.remove("play");
    void flip.offsetWidth; // reflow för att kunna starta om
    flip.classList.add("play");
  };

  return d;
}

function mountDigits(container, count){
  container.innerHTML = "";
  for(let i=0;i<count;i++) container.appendChild(makeDigit("0"));
}

function pad(num, size=2){
  let s = String(num);
  while(s.length < size) s = "0" + s;
  return s;
}

function getRemaining(target){
  const now = new Date();
  const total = Math.max(0, target.getTime() - now.getTime());
  const seconds = Math.floor((total/1000) % 60);
  const minutes = Math.floor((total/1000/60) % 60);
  const hours   = Math.floor((total/1000/60/60) % 24);
  const days    = Math.floor(total/1000/60/60/24);
  return { total, days, hours, minutes, seconds };
}

function flipTo(digitEl, newNumber){
  const cur = digitEl.dataset.number;
  const next = String(newNumber);
  if(cur === next) return;

  digitEl._setNumbers(cur, next);
  digitEl._play();
}

function updateUnit(container, strValue){
  const digits = container.querySelectorAll(".digit");
  for(let i=0;i<digits.length;i++){
    const nextDigit = strValue[i] ?? "0";
    flipTo(digits[i], nextDigit);
  }
}

// Initiera antal siffror (dagar kan vara 2–4+)
const initial = getRemaining(TARGET);
const dayDigits = Math.max(2, String(initial.days).length);
mountDigits(containers.days, dayDigits);
mountDigits(containers.hours, 2);
mountDigits(containers.minutes, 2);
mountDigits(containers.seconds, 2);

// Sätt initialt visade värden utan att spela animation
function setInitial(){
  const r = getRemaining(TARGET);
  const dStr = pad(r.days, containers.days.children.length);
  const hStr = pad(r.hours);
  const mStr = pad(r.minutes);
  const sStr = pad(r.seconds);

  const units = [
    [containers.days, dStr],
    [containers.hours, hStr],
    [containers.minutes, mStr],
    [containers.seconds, sStr],
  ];

  for(const [container, value] of units){
    const digits = container.querySelectorAll(".digit");
    for(let i=0;i<digits.length;i++){
      const el = digits[i];
      el.dataset.number = value[i];
      el.querySelector(".top").textContent = value[i];
      el.querySelector(".bottom").textContent = value[i];
      el.querySelector(".flip-top").textContent = value[i];
      el.querySelector(".flip-bottom").textContent = value[i];
    }
  }
}

function render(){
  const r = getRemaining(TARGET);
  const dStr = pad(r.days, containers.days.children.length);
  const hStr = pad(r.hours);
  const mStr = pad(r.minutes);
  const sStr = pad(r.seconds);

  updateUnit(containers.days, dStr);
  updateUnit(containers.hours, hStr);
  updateUnit(containers.minutes, mStr);
  updateUnit(containers.seconds, sStr);
}

// Kickoff
setInitial();
render();
setInterval(render, 1000);
