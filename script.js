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
  if(cur === String(newNumber)) return;

  const top = digitEl.querySelector(".top");
  const bottom = digitEl.querySelector(".bottom");
  const flip = digitEl.querySelector(".flip");
  const ft = digitEl.querySelector(".flip-top");
  const fb = digitEl.querySelector(".flip-bottom");

  // Sätt text innehåll för korrekt lager under animationen
  ft.textContent = cur;           // övre flip visar gamla siffran som fälls ned
  fb.textContent = newNumber;     // nedre flip visar nya siffran som fälls upp
  top.textContent = cur;          // statiska top visar gamla tills flip är klar
  bottom.textContent = newNumber; // statiska bottom visar nya

  // starta om animation
  flip.classList.remove("play");
  void flip.offsetWidth; // tvinga reflow
  flip.classList.add("play");

  // efter animation, lås den nya siffran
  setTimeout(()=>{
    top.textContent = newNumber;
    bottom.textContent = newNumber;
    digitEl.dataset.number = String(newNumber);
  }, 600);
}

function updateUnit(container, strValue){
  const digits = container.querySelectorAll(".digit");
  for(let i=0;i<digits.length;i++){
    flipTo(digits[i], strValue[i] ?? "0");
  }
}

// Initiera antal siffror (dagar kan vara 2–4+)
const initial = getRemaining(TARGET);
const dayDigits = Math.max(2, String(initial.days).length);
mountDigits(containers.days, dayDigits);
mountDigits(containers.hours, 2);
mountDigits(containers.minutes, 2);
mountDigits(containers.seconds, 2);

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
render();
setInterval(render, 1000);
