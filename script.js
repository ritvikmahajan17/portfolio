const getData = async () => {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbxORJVR0f5CKqnaBs8tTvIHVpy1yo7oAcSSAXcpLo_n87uwakvyISsEZmoxa1LUZt0a/exec"
  );
  const data = await response.json();

  const info = data.data;

  const jsonisfyData = info.map((item) => {
    return {
      [item[0]]: item[1],
    };
  });
  return jsonisfyData;
};

const getAge = () => {
  const dob = new Date("2002-01-17");
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const renderData = async () => {
  document.getElementById("age").innerHTML = getAge();

  const data = await getData();
  const desgn = data[0].current_desg;
  const resumeLink = data[1].resume;
  document.getElementById("designation").innerHTML = desgn;
  document.getElementById("resume").href = resumeLink;
};

renderData();
