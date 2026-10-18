const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

/* ---------- Theme ---------- */
const themeBtn = document.getElementById("themeBtn");

function syncThemeLabel() {
    const dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
    syncThemeLabel();
    window.dispatchEvent(new Event("themechange"));
});
syncThemeLabel();

/* ---------- Preloader ---------- */
(function preloader() {
    const pre = document.getElementById("pre");
    const count = document.getElementById("preCount");

    function finish() {
        root.classList.add("ready");
        document.body.classList.remove("locked");
        setTimeout(() => { pre.style.display = "none"; }, 1200);
    }

    if (reduceMotion) {
        pre.style.display = "none";
        root.classList.add("ready");
        return;
    }

    document.body.classList.add("locked");
    const start = performance.now();
    const duration = 1300;

    function tick(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        count.textContent = Math.round(eased * 100);
        if (t < 1) {
            requestAnimationFrame(tick);
        } else {
            pre.classList.add("done");
            setTimeout(finish, 450);
        }
    }
    requestAnimationFrame(tick);
})();

/* ---------- Custom cursor ---------- */
(function cursor() {
    if (!finePointer) return;
    root.classList.add("has-cursor");
    const dot = document.getElementById("curDot");
    const ring = document.getElementById("curRing");
    const label = document.getElementById("curLabel");
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener("pointermove", e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    });

    function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.addEventListener("pointerover", e => {
        const t = e.target;
        const lab = t.closest && t.closest("[data-cursor]");
        if (lab) {
            label.textContent = lab.dataset.cursor;
            ring.classList.add("label");
            ring.classList.remove("hot");
        } else if (t.closest && t.closest("a, button, .cloud li, input, textarea")) {
            ring.classList.add("hot");
            ring.classList.remove("label");
        } else {
            ring.classList.remove("hot", "label");
        }
    });
})();

/* ---------- Scroll progress and dock spy ---------- */
(function scrollUI() {
    const bar = document.getElementById("progress");
    const links = Array.from(document.querySelectorAll("#dock a"));
    const sections = links.map(a => document.getElementById(a.dataset.s));
    let ticking = false;

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        let current = 0;
        sections.forEach((s, i) => {
            if (s && s.getBoundingClientRect().top <= window.innerHeight * 0.4) current = i;
        });
        links.forEach((a, i) => a.classList.toggle("on", i === current));
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
})();

/* ---------- Role roller ---------- */
(function roller() {
    const box = document.getElementById("roller");
    const track = document.getElementById("rollTrack");
    const words = Array.from(track.children);
    let i = 0;

    function show(n) {
        const h = words[0].offsetHeight;
        track.style.transform = `translateY(${-n * h}px)`;
        box.style.width = words[n].getBoundingClientRect().width + "px";
    }

    function init() {
        box.style.transition = "none";
        show(0);
        requestAnimationFrame(() => { box.style.transition = ""; });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else init();
    window.addEventListener("resize", () => show(i));

    if (reduceMotion) return;
    setInterval(() => {
        i = (i + 1) % words.length;
        show(i);
    }, 2400);
})();

/* ---------- Statement: words light up with scroll ---------- */
(function statement() {
    const el = document.getElementById("statement");
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const spans = words.map(w => {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = w;
        el.appendChild(s);
        el.appendChild(document.createTextNode(" "));
        return s;
    });
    let ticking = false;

    function update() {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = reduceMotion ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.2), 0, 1);
        const lit = Math.round(p * spans.length);
        spans.forEach((s, i) => s.classList.toggle("on", i < lit));
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
})();

/* ---------- Tilt and magnetic elements ---------- */
if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach(el => {
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
        });
        el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    document.querySelectorAll(".mag").forEach(el => {
        el.addEventListener("pointermove", e => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
        });
        el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
}

/* ---------- Timeline progress ---------- */
(function timeline() {
    const tl = document.getElementById("tl");
    const fill = document.getElementById("tlFill");
    const items = Array.from(tl.querySelectorAll("li"));
    let ticking = false;

    function update() {
        const r = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = reduceMotion ? 1 : clamp((vh * 0.6 - r.top) / r.height, 0, 1);
        fill.style.height = p * 100 + "%";
        items.forEach(li => li.classList.toggle("on", reduceMotion || li.getBoundingClientRect().top < vh * 0.6));
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
})();

/* ---------- Language rings ---------- */
(function rings() {
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const v = parseFloat(entry.target.dataset.v);
            entry.target.querySelector(".val").style.strokeDashoffset = 264 * (1 - v);
            o.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll(".lang").forEach(l => obs.observe(l));
})();

/* ---------- Skills filter ---------- */
(function skills() {
    const filters = document.getElementById("filters");
    const chips = Array.from(document.querySelectorAll("#cloud li"));
    filters.addEventListener("click", e => {
        const btn = e.target.closest(".f");
        if (!btn) return;
        const cat = btn.dataset.cat;
        filters.querySelectorAll(".f").forEach(b => {
            const on = b === btn;
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", String(on));
        });
        chips.forEach(c => c.classList.toggle("dim", cat !== "all" && c.dataset.cat !== cat));
    });
})();

/* ---------- Work: pinned horizontal scroll ---------- */
(function work() {
    const section = document.getElementById("work");
    const track = document.getElementById("workTrack");
    const bar = document.getElementById("workBar");
    const count = document.getElementById("workCount");
    const n = track.children.length;
    const desktop = () => window.matchMedia("(min-width: 901px)").matches;
    let ticking = false;

    function size() {
        if (!desktop()) {
            section.style.height = "";
            track.style.transform = "";
            return;
        }
        const dist = track.scrollWidth - track.clientWidth;
        section.style.height = dist + window.innerHeight + "px";
        update();
    }

    function update() {
        ticking = false;
        if (!desktop()) return;
        const dist = track.scrollWidth - track.clientWidth;
        const r = section.getBoundingClientRect();
        const p = clamp(-r.top / dist, 0, 1);
        track.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
        bar.style.transform = `scaleX(${1 / n + (1 - 1 / n) * p})`;
        const idx = Math.round(p * (n - 1)) + 1;
        count.textContent = `0${idx} / 0${n}`;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", size);
    window.addEventListener("load", size);
    size();
})();

/* ---------- Contact form ---------- */
const scriptURL = "https://script.google.com/macros/s/AKfycbzN6Rpmrt9Kj9wGnDdJgJsLYMY6cBy3pms_vki-07J0YUJkKiWzlTYqzkdcidHXqzmAoQ/exec";
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");
let statusTimer;

function showStatus(text) {
    statusEl.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { statusEl.textContent = ""; }, 5000);
}

form.addEventListener("submit", e => {
    e.preventDefault();
    sendBtn.disabled = true;
    fetch(scriptURL, { method: "POST", body: new FormData(form) })
        .then(() => {
            showStatus("Thanks, your message was sent.");
            form.reset();
        })
        .catch(() => showStatus("Could not send. Check your connection and try again."))
        .finally(() => { sendBtn.disabled = false; });
});