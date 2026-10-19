// Sätt en adress här (t.ex. Formspree eller egen server) för att ta emot förfrågningar via e-post.
// Är den tom öppnas ett färdigskrivet sms till företagets telefon i stället.
const FORM_ENDPOINT = "";
const PHONE = "+46725738561";

const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
});

nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("offert");
const status = form.querySelector(".form__status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let firstInvalid = null;
  form.querySelectorAll("[required]").forEach((field) => {
    const invalid = !field.value.trim();
    field.setAttribute("aria-invalid", String(invalid));
    if (invalid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    status.textContent = "Fyll i namn, telefon och en kort beskrivning.";
    firstInvalid.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));

  if (FORM_ENDPOINT) {
    status.textContent = "Skickar …";
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = "Tack! Vi hör av oss så snart vi kan.";
    } catch {
      status.innerHTML = 'Det gick inte att skicka. Ring oss på <a href="tel:' + PHONE + '">072-573 85 61</a>.';
    }
    return;
  }

  const details = [
    "Namn: " + data.namn,
    "Telefon: " + data.telefon,
    data.epost && "E-post: " + data.epost,
    data.typ && "Arbete: " + data.typ,
    data.plats && "Plats: " + data.plats,
  ].filter(Boolean);
  const message = ["Offertförfrågan via hemsidan", ...details, "", data.beskrivning].join("\n");

  window.location.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(message);
  status.innerHTML = 'Ett sms öppnas med din förfrågan. Fungerar det inte – ring <a href="tel:' + PHONE + '">072-573 85 61</a>.';
});
