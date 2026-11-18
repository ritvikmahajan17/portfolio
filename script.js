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
