// dated today, like a letter; age kept current
const now = new Date();
document.getElementById("today").textContent =
  "Bengaluru, " + now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const born = new Date(2002, 0, 17);
let age = now.getFullYear() - born.getFullYear();
if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age--;
document.getElementById("age").textContent = age;

document.getElementById("resume").addEventListener("click", () => {
  gtag("event", "download_resume", {
    event_category: "resume",
    event_label: "resume_download",
  });
});

// this year's running totals, refreshed daily into strava.json
fetch("strava.json")
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((s) => {
    const set = (id, v) => (document.getElementById(id).textContent = v.toLocaleString("en-IN"));
    document.getElementById("s-year").textContent = s.year;
    set("s-km", s.km);
    set("s-runs", s.runs);
    set("s-hours", s.hours);
    document.querySelector(".strava").hidden = false;
  })
  .catch(() => {}); // no stats yet: the tag stays hidden
