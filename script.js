/* Odometer/rullande nedräkning — ändra här */
const TITLE = "Varmt välkommen om";
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

/** Verktyg */
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

/** DigitReel — en rullande siffra (0–9) med smidig wrap */
class DigitReel {
  constructor(){
    this.el = document.createElement("div");
    this.el.className = "digit";

    // Innehåll: två uppsättningar 0..9 för att hantera wrap snyggt
    const reel = document.createElement("div");
    reel.className = "reel";
    for(let r=0; r<2; r++){
      for(let d=0; d<=9; d++){
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = d;
        reel.appendChild(cell);
      }
    }
    this.el.appendChild(reel);

    this.reel = reel;
    this.cellHeight = null;  // sätts efter mount
    this.baseIndex = 10;     // använd ”mittenblocket” som referens (index 10..19)
    this.index = this.baseIndex; // faktisk index i listan
    this.value = 0;          // 0–9

    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this.reel.addEventListener("transitionend", this._onTransitionEnd);
  }

  mount(container){
    container.appendChild(this.el);
    // Mäta cellhöjd efter render
    requestAnimationFrame(() => {
      const firstCell = this.reel.querySelector(".cell");
      this.cellHeight = firstCell.getBoundingClientRect().height;
      // Positionera initialt på baseIndex (0)
      this._jumpTo(this.baseIndex);
    });
  }

  /** Sätt utan animation */
  setImmediate(digit){
    digit = ((digit % 10) + 10) % 10;
    this.value = digit;
    this.index = this.baseIndex + digit;
    this._jumpTo(this.index);
  }

  /** Rulla till digit (0–9) med kortaste väg (upp/ner) */
  rollTo(digit){
    digit = ((digit % 10) + 10) % 10;
    if(this.cellHeight == null) { // om ej mätt än
      this.setImmediate(digit);
      return;
    }
    if(digit === this.value) return;

    const cur = this.value;
    // steg uppåt (negativ Y, rulla upp), steg nedåt (positiv Y, rulla ner)
    const up = (cur - digit + 10) % 10;    // hur många steg upp till digit
    const down = (digit - cur + 10) % 10;  // hur många steg ner till digit

    // Välj kortaste
    if (up <= down) {
      // Rulla upp (minska index)
      this.index -= up;
    } else {
      // Rulla ner (öka index)
      this.index += down;
    }

    this.value = digit;
    this._animateTo(this.index);
  }

  _jumpTo(idx){
    this.reel.style.transition = "none";
    this.reel.style.transform = `translateY(${-idx * this.cellHeight}px)`;
    // Force style calc
    this.reel.offsetHeight; // reflow
    this.reel.style.transition = "";
  }

  _animateTo(idx){
    // Varje steg tar var(--speed). Om flera steg, skala tiden lite.
    const steps = Math.abs(idx - parseFloat(this.reel.style.getPropertyValue("--last-index") || this.baseIndex));
    const perStep = 300; // ms (speglar --speed)
    const duration = Math.min(900, Math.max(200, steps * perStep * 0.6)); // klippning

    this.reel.style.transition = `transform ${duration}ms var(--timing)`;
    this.reel.style.transform = `translateY(${-idx * this.cellHeight}px)`;
    this.reel.style.setProperty("--last-index", idx);
  }

  _onTransitionEnd(){
    // Normalisera index till mittenblocket (10..19) för att undvika overflow
    const normalized = this.baseIndex + this.value;
    if(this.index !== normalized){
      this.index = normalized;
      this._jumpTo(this.index);
    }
  }
}

/** Bygg en grupp siffror */
function mountDigits(container, count){
  container.innerHTML = "";
  const reels = [];
  for(let i=0; i<count; i++){
    const reel = new DigitReel();
    reel.mount(container);
    reels.push(reel);
  }
  return reels;
}

/** Uppdatera alla siffror i en enhet (t.ex. "12" → två reels) */
function updateReels(reels, strValue){
  // vänsterställd, en reel per tecken
  for(let i=0; i<reels.length; i++){
    const ch = strValue[i] ?? "0";
    const d = ch.charCodeAt(0) - 48;
    reels[i].rollTo(d);
  }
}

/** Initiera alla enheter */
const initial = getRemaining(TARGET);
const dayDigits = Math.max(2, String(initial.days).length);

const reels = {
  days:    mountDigits(containers.days, dayDigits),
  hours:   mountDigits(containers.hours, 2),
  minutes: mountDigits(containers.minutes, 2),
  seconds: mountDigits(containers.seconds, 2),
};

/** Sätt startvärden utan animation */
(function setInitial(){
  const r = getRemaining(TARGET);
  const dStr = pad(r.days, reels.days.length);
  const hStr = pad(r.hours);
  const mStr = pad(r.minutes);
  const sStr = pad(r.seconds);

  dStr.split("").forEach((ch, i)=> reels.days[i].setImmediate(+ch));
  hStr.split("").forEach((ch, i)=> reels.hours[i].setImmediate(+ch));
  mStr.split("").forEach((ch, i)=> reels.minutes[i].setImmediate(+ch));
  sStr.split("").forEach((ch, i)=> reels.seconds[i].setImmediate(+ch));
})();

/** Render-loop (varje sekund) */
function render(){
  const r = getRemaining(TARGET);
  const dStr = pad(r.days, reels.days.length);
  const hStr = pad(r.hours);
  const mStr = pad(r.minutes);
  const sStr = pad(r.seconds);

  updateReels(reels.days, dStr);
  updateReels(reels.hours, hStr);
  updateReels(reels.minutes, mStr);
  updateReels(reels.seconds, sStr);
}

render();
setInterval(render, 1000);
