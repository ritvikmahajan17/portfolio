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
