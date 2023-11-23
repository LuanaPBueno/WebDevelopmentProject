import { getCourseNames, getCourse, getOptativeSubjectsGroup, getSubject, getSubjectPrerequisitesFromCourse } from "../../services/firebase/firebase.js";

document.addEventListener('DOMContentLoaded', async () => {
  let courseNames = await getCourseNames();
  await loadCourseOptionsDropDownButton(courseNames);
  await loadPage();
});

document.getElementById("course-options").addEventListener("change", loadPage);

async function loadCourseOptionsDropDownButton(courseNames) {
  let dropdownButton = document.getElementById("course-options");

  courseNames.forEach(courseName => {
    let option = document.createElement("option");
    option.value = courseName;
    option.text = courseName;

    dropdownButton.appendChild(option);
  });
}

async function loadPage() {
  let courseName = document.getElementById("course-options").value;
  let course = await getCourse(courseName);

  let highlightMostPrerequisites = false;
  let highlightMostUnlocking = false;

  const subjectIds = {};
  const prereqCounts = {};
  const unlockCounts = {};

  document.getElementById('course-title').textContent = courseName;

  const periodsContainer = document.querySelector('.periods');
  periodsContainer.replaceChildren();
  let containerChildren = [];

  let subjectGlobalId = 1;
  let periodNumber = 1;

  for (const period of Object.values(course.curriculum)) {
    const periodEl = document.createElement('div');
    periodEl.className = 'period';
    periodEl.id = `period-${periodNumber}`;

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${periodNumber}º Período`;
    periodEl.appendChild(titleEl);

    for (const code of period) {
      let subject = await getSubject(code);
      if (subject) {
        const subjectEl = document.createElement('div');
        subjectEl.className = 'subject';
        subjectEl.setAttribute('data-id', subjectGlobalId);
        subjectIds[subject.name] = subjectGlobalId;
        subjectEl.textContent = subject.name;
        periodEl.appendChild(subjectEl);

      } else {
        let group = await getOptativeSubjectsGroup(code);
        if (!group) continue;

        const subjectEl = document.createElement('div');
        subjectEl.className = 'subject';
        subjectEl.setAttribute('data-id', subjectGlobalId);
        subjectIds[group.name] = subjectGlobalId;
        subjectEl.textContent = group.name;
        periodEl.appendChild(subjectEl);
      }

      subjectGlobalId++;
    }

    containerChildren.push(periodEl);
    periodNumber++;
  }

  periodsContainer.replaceChildren(...containerChildren);

  for (const period of Object.values(course.curriculum)) {
    for (const subjectCode of period) {
      let subject = await getSubject(subjectCode);
      if (!subject) continue;

      console.log(subject.name);

      let prerequisites = await getSubjectPrerequisitesFromCourse(subject.code, courseName);
      if (Object.keys(prerequisites).length == 0) continue;
      prerequisites = prerequisites[0];
      if (prerequisites === "A matéria contém pré-requisitos, mas nenhum deles faz parte do curso.") continue;

      console.log(prerequisites);

      const subjectEl = document.querySelector(`[data-id="${subjectIds[subject.name]}"]`);
      const prereqIds = prerequisites.map(name => subjectIds[name]).join(',');
      subjectEl.setAttribute('data-prereq', prereqIds);

      prereqCounts[subject.name] = prerequisites.length;

      prerequisites.forEach((prereq) => {
        unlockCounts[prereq] = (unlockCounts[prereq] || 0) + 1;
      });
    }
  }

  function toggleHighlightMostPrerequisites() {
    highlightMostPrerequisites = !highlightMostPrerequisites;

    if (highlightMostPrerequisites) {
      let sortedSubjects = Object.entries(prereqCounts).sort((a, b) => b[1] - a[1]);

      if (sortedSubjects.length > 0) {
        const mostPrerequisitesSubject = sortedSubjects[0][0];
        const el = document.querySelector(`[data-id="${subjectIds[mostPrerequisitesSubject]}"]`);
        el.style.backgroundColor = 'red';
      }

      if (sortedSubjects.length > 1) {
        const secondMostPrerequisitesSubject = sortedSubjects[1][0];
        const el = document.querySelector(`[data-id="${subjectIds[secondMostPrerequisitesSubject]}"]`);
        el.style.backgroundColor = 'orange';
      }

      if (sortedSubjects.length > 2) {
        const thirdMostPrerequisitesSubject = sortedSubjects[2][0];
        const el = document.querySelector(`[data-id="${subjectIds[thirdMostPrerequisitesSubject]}"]`);
        el.style.backgroundColor = 'rgb(73 253 253)';
      }
    } else {
      document.querySelectorAll('.subject').forEach(el => {
        el.style.backgroundColor = 'white';
      });
    }
  }

  function toggleHighlightMostUnlocking() {
    highlightMostUnlocking = !highlightMostUnlocking;

    if (highlightMostUnlocking) {
      let sortedUnlockingSubjects = Object.entries(unlockCounts).sort((a, b) => b[1] - a[1]);

      if (sortedUnlockingSubjects.length > 0) {
        const mostUnlockingSubject = sortedUnlockingSubjects[0][0];
        const el = document.querySelector(`[data-id="${subjectIds[mostUnlockingSubject]}"]`);
        el.style.backgroundColor = 'blue';
      }

      if (sortedUnlockingSubjects.length > 1) {
        const secondMostUnlockingSubject = sortedUnlockingSubjects[1][0];
        const el = document.querySelector(`[data-id="${subjectIds[secondMostUnlockingSubject]}"]`);
        el.style.backgroundColor = 'lightgreen';
      }

      if (sortedUnlockingSubjects.length > 2) {
        const thirdMostUnlockingSubject = sortedUnlockingSubjects[2][0];
        const el = document.querySelector(`[data-id="${subjectIds[thirdMostUnlockingSubject]}"]`);
        el.style.backgroundColor = 'pink';
      }
    } else {
      document.querySelectorAll('.subject').forEach(el => {
        el.style.backgroundColor = 'white';
      });
    }
  }

  const toggleButton = document.createElement('button');
  toggleButton.className = 'button-56';
  toggleButton.textContent = 'Alternar destaque da disciplina com mais pré-requisitos';
  toggleButton.addEventListener('click', toggleHighlightMostPrerequisites);

  const toggleMostUnlockingButton = document.createElement('button');
  toggleMostUnlockingButton.className = 'button-56';
  toggleMostUnlockingButton.textContent = 'Alternar destaque da disciplina que mais desbloqueia outras';
  toggleMostUnlockingButton.addEventListener('click', toggleHighlightMostUnlocking);

  const buttonContainer = document.getElementById('button-container');
  buttonContainer.appendChild(toggleButton);
  buttonContainer.appendChild(toggleMostUnlockingButton);

  const subjects = document.querySelectorAll('.subject');
  subjects.forEach(subject => {
    subject.addEventListener('mouseover', function() {
      const prereqs = this.getAttribute('data-prereq');
      if (prereqs) {
        prereqs.split(',').forEach(id => {
          document.querySelector(`[data-id="${id}"]`).style.backgroundColor = 'lightyellow';
        });
      }
    });

    subject.addEventListener('mouseout', function() {
      const prereqs = this.getAttribute('data-prereq');
      if (prereqs) {
        prereqs.split(',').forEach(id => {
          document.querySelector(`[data-id="${id}"]`).style.backgroundColor = 'white';
        });
      }
    });
    subject.addEventListener('click', function() { // função que ativa o openPopup ao clicar numa matéria
      openPopup(subject.textContent);
    });
  });
}

const modal = document.querySelector("dialog") // cria variavel modal que consiste de todo o dialog do popup no html
const buttonClose = document.querySelector("dialog  button") // cria variavel buttonClose que é o botão de fechar o popup
buttonClose.addEventListener("click", function(){ // função que fecha o popup quando clica no botão de fechar o popup
  modal.close(); 
});

function openPopup(subjectName) { // função que abre o popup

  const modal = document.getElementById("popup-dialog");

  const titleElement = modal.querySelector(".title h1"); // associa uma variavel com o titulo do popup
  titleElement.textContent = subjectName; // define a variavel do titulo com o nome da matéria

  modal.showModal();
}
