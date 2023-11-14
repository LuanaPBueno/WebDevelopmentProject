import { getOptativeSubjectsGroup, getSubject } from "../../services/firebase/firebase.js";

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById('searchForm');
  
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const inputCode = document.getElementById('searchInput').value.toUpperCase();
    const subjectsDiv = document.getElementById('subjectsList');
    subjectsDiv.innerHTML = ''; // Limpar resultados anteriores
    
    try {
      const subjectsGroup = await getOptativeSubjectsGroup(inputCode);
      
      if (subjectsGroup && subjectsGroup.subjects) {
        for (const key in subjectsGroup.subjects) {
          const subjectName = subjectsGroup.subjects[key];

          try {
            const getSub = await getSubject(subjectName);

            if (getSub && getSub.name && getSub.code) {

              const subjectsNameString = getSub.name;

              const subjectA = document.createElement("a");
              subjectA.textContent = subjectsNameString;
              subjectA.href = "https://www.puc-rio.br/ferramentas/ementas/ementa.aspx?cd=" + getSub.code;
              subjectA.className = "subjectoption";
              subjectsDiv.appendChild(subjectA);
              subjectsDiv.appendChild(document.createElement("br"));

            } else {
              subjectsDiv.textContent = 'Nenhuma matéria encontrada para o código: ' + subjectName;
            }

          } catch (error) {
            console.error('Erro ao buscar dados:', error);
            subjectsDiv.textContent = 'Erro ao buscar matéria. Tente novamente mais tarde.';
          }  
        }
      } else {
        subjectsDiv.textContent = 'Nenhuma matéria encontrada para o código: ' + inputCode;
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      subjectsDiv.textContent = 'Erro ao buscar matérias. Tente novamente mais tarde.';
    }
  });
});
