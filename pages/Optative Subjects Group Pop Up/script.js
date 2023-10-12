class OptativeSubjectsGroup {
  constructor(name, code, subjects) {
    this.name = name;
    this.code = code;
    this.subjects = subjects;
  }
}

const group = new OptativeSubjectsGroup(
  "OPTATIVAS DE COMPUTACAO CIENTIFICA",
  "INF0305",
  {
    "INF1032": "INTRODUCAO A CIENCIA DOS DADOS",
    "INF1608": "ANALISE NUMERICA I",
    "INF1761": "COMPUTACAO GRAFICA",
  },
)

document.addEventListener("DOMContentLoaded", function () {
  document.title = group.name;
  const titleH1 = document.getElementById("title");
  titleH1.textContent = group.name + " (" + group.code + ")";

  const subjectsDiv = document.getElementById("subjectsList");
  for (const key in group.subjects) {
    const subjectA = document.createElement("a");
    subjectA.textContent = group.subjects[key] + " (" + key + ")";
    subjectA.href = "https://www.puc-rio.br/ferramentas/ementas/ementa.aspx?cd=" + key;
    subjectA.className = "subjectoption";

    const br = document.createElement("br");
    subjectsDiv.append(subjectA, br);
  }
});
