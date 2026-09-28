const THEMES = {
  cumulus:
    "https://videos.pexels.com/video-files/5200486/5200486-hd_1920_1080_30fps.mp4",
  milkyway:
    "https://videos.pexels.com/video-files/4911644/4911644-hd_1920_1080_30fps.mp4",
  surf:
    "https://videos.pexels.com/video-files/7666608/7666608-hd_1920_1080_30fps.mp4",
};

const video = document.getElementById("bg-video");
const themeButtons = document.querySelectorAll(".themes button");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const storedTheme = () => {
  try {
    return localStorage.getItem("bgTheme");
  } catch (e) {
    return null;
  }
};

const setTheme = (name) => {
  if (!THEMES[name]) name = "cumulus";
  document.documentElement.dataset.theme = name;
  if (video.src !== THEMES[name]) video.src = THEMES[name];
  themeButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.theme === name))
  );
  try {
    localStorage.setItem("bgTheme", name);
  } catch (e) {}
};

// reduced motion still gets the footage, held on its first frame
if (reduceMotion.matches) {
  video.addEventListener("loadeddata", () => video.pause());
}

themeButtons.forEach((b) =>
  b.addEventListener("click", () => setTheme(b.dataset.theme))
);

setTheme(
  new URLSearchParams(location.search).get("bg") || storedTheme() || "cumulus"
);

const getAge = () => {
  const dob = new Date("2002-01-17");
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

document.getElementById("age").innerHTML = getAge();

function trackButtonClick() {
  console.log("Track button click");
  gtag("event", "download_resume", {
    event_category: "resume",
    event_label: "resume_download",
  });
}

// Add event listener to the button
document.getElementById("resume").addEventListener("click", trackButtonClick);
