import { getOptativeSubjectsGroup, getSubject } from "../../services/firebase/firebase.js";

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById('searchForm');
  const subjectsDiv = document.getElementById('subjectsList');
  const backButton = document.createElement("button"); 
  const titleElement = document.getElementById('title'); 
  backButton.textContent = "Voltar";
  backButton.onclick = () => {
    subjectsDiv.innerHTML = ''; 
    displaySubjects();
  };

  async function displaySubjects() {
    const inputCode = document.getElementById('searchInput').value.toUpperCase(); 
    subjectsDiv.innerHTML = ''; 
    
    try {
      const subjectsGroup = await getOptativeSubjectsGroup(inputCode);
      titleElement.textContent = subjectsGroup.name;
      if (subjectsGroup && subjectsGroup.subjects) {
        for (const key in subjectsGroup.subjects) {
          const subjectName = subjectsGroup.subjects[key];
          const getSub = await getSubject(subjectName);
          if (getSub && getSub.name && getSub.code) {
            const subjectA = document.createElement("a");
            subjectA.textContent = "* " + getSub.name;
            subjectA.href = "#"; 
            subjectA.className = "subjectoption";
            subjectA.onclick = () => showSubjectDetails(getSub.code); 
            subjectsDiv.appendChild(subjectA);
            subjectsDiv.appendChild(document.createElement("br"));
          } else {
            subjectsDiv.textContent = 'Nenhuma matéria encontrada para o código: ' + subjectName;
          }
        }
      } else {
        subjectsDiv.textContent = 'Nenhuma matéria encontrada para o código: ' + inputCode;
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      subjectsDiv.textContent = 'Erro ao buscar matérias. Tente novamente mais tarde.';
    }
  }

  function showSubjectDetails(code) {
    subjectsDiv.innerHTML = ''; 
    const codeDiv = document.createElement("div"); 
    codeDiv.textContent = code;
    subjectsDiv.appendChild(codeDiv);
    subjectsDiv.appendChild(backButton); 
  }

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    displaySubjects();
  });
  
});
