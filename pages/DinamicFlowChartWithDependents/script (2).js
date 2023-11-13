// const subjectsArray = document.querySelectorAll(".subject");

document.addEventListener('click', () => {
  location.reload();
}) //ADD: recarrega a página quando alguém clica na tela.

function getDepedents(subjectName) {
  const dependentsArray = [];
  console.log(subjectData[subjectName]);
  subjectData[subjectName].dependents.forEach((depName) => {
    dependentsArray.push(depName);
    const depsOfDep = getDepedents(depName);
    dependentsArray.push(...depsOfDep);
  });
  return dependentsArray;
}

function getPrereqs(subjectName) {
  const prereqsArray = [];
  console.log(subjectData[subjectName]);
  subjectData[subjectName].prereqs.forEach((prereqName) => {
    prereqsArray.push(prereqName);
    const prerOfprer = getPrereqs(prereqName);
    prereqsArray.push(...prerOfprer);
  });
  return prereqsArray;
}

function getCoreqs(subjectName) {
  const coreqsArray = [];
  console.log(subjectName);
  console.log(subjectData[subjectName]);
  subjectData[subjectName].coreqs.forEach((coreqName) => {
    coreqsArray.push(coreqName);
    const cOfc = getCoreqs(coreqName);
    coreqsArray.push(...cOfc);
  });
  return coreqsArray;
}

document.addEventListener('DOMContentLoaded', () => {
  let highlightMostPrerequisites = true;
  let highlightMostUnlocking = true;

  const subjectIds = {};
  const prereqCounts = {};
  const unlockCounts = {};
  const removedElements = [];

  document.getElementById('course-title').textContent = courseName;

  const periodsContainer = document.querySelector('.periods');
  let subjectGlobalId = 1;

  // Percorrendo cada período
  courseData.forEach((data) => {
    // Criando o div do período
    const periodEl = document.createElement('div');
    periodEl.className = 'period';
    periodEl.id = `period-${data.period}`;

    // Criando o titulo do período
    const titleEl = document.createElement('h3');
    titleEl.textContent = `${data.period}º Período`;
    periodEl.appendChild(titleEl);

    // Percorrendo cada matéria do período
    data.subjects.forEach((sub) => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject';
      subjectEl.setAttribute('data-id', subjectGlobalId);
      subjectIds[sub.name] = subjectGlobalId;
      subjectEl.textContent = sub.name;
      periodEl.appendChild(subjectEl);

      // associar um add event listener ao elem
      subjectEl.addEventListener("click", (event) => {
        event.stopPropagation();
        const clickedSubName = event.target.innerText;
        const deps = getDepedents(clickedSubName);
        const prereqs = getPrereqs(clickedSubName);
        const coreqs = getCoreqs(clickedSubName);
        const subjectsArray = document.querySelectorAll(".subject");
        subjectsArray.forEach((elem) => {
          const currSubName = elem.innerText;
          if (!deps.includes(currSubName) && !prereqs.includes(currSubName) && !coreqs.includes(currSubName) && currSubName != clickedSubName) {
            elem.remove();
            removedElements.push(elem);
          }
        })
      });
      document.addEventListener("click", (event) => {
        event.stopPropagation();
        removedElements.forEach((elem) => {
          const periodId = elem.closest(".period");
          if (periodEl != null) {
            const periodId = periodEl.id;
          } else {
            console.error("Elemento não encontrado");
          }
        });
        removedElements.length = 0;
      });

      periodsContainer.appendChild(periodEl);
    });
    subjectGlobalId++;
  });

  courseData.forEach((data) => {
    data.subjects.forEach((sub) => {
      const subjectEl = document.querySelector(`[data-id="${subjectIds[sub.name]}"]`);
      const prereqIds = sub.prereqs.map(name => subjectIds[name]).join(',');
      subjectEl.setAttribute('data-prereq', prereqIds);

      prereqCounts[sub.name] = sub.prereqs.length;

      sub.prereqs.forEach((prereq) => {
        unlockCounts[prereq] = (unlockCounts[prereq] || 0) + 1;
      });
    });
  });

  function toggleHighlightMostPrerequisites(evento) {
    evento.stopPropagation(); //ADD: qnd eu clico na matéria n interfere o clique da tela pra recarregar a página.
    highlightMostPrerequisites = !highlightMostPrerequisites;

    if (highlightMostPrerequisites) {
      let sortedSubjects = Object.entries(prereqCounts).sort((a, b) => b[1] - a[1]);

      // Highlight the subject with the most prerequisites
      if (sortedSubjects.length > 0) {
        const mostPrerequisitesSubject = sortedSubjects[0][0];
        const el = document.querySelector(`[data-id="${subjectIds[mostPrerequisitesSubject]}"]`);
        el.style.backgroundColor = 'red';
      }

      // Highlight the subject with the second most prerequisites
      if (sortedSubjects.length > 1) {
        const secondMostPrerequisitesSubject = sortedSubjects[1][0];
        const el = document.querySelector(`[data-id="${subjectIds[secondMostPrerequisitesSubject]}"]`);
        el.style.backgroundColor = 'orange';
      }

      // Highlight the subject with the third most prerequisites
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

  function toggleHighlightMostUnlocking(evento) {
    evento.stopPropagation();
    highlightMostUnlocking = !highlightMostUnlocking;

    if (highlightMostUnlocking) {
      let maxCount = -1;
      let mostUnlockingSubject = null;

      for (const [subject, count] of Object.entries(unlockCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostUnlockingSubject = subject;
        }
      }

      if (mostUnlockingSubject) {
        const el = document.querySelector(`[data-id="${subjectIds[mostUnlockingSubject]}"]`);
        el.style.backgroundColor = 'blue';
      }
    } else {
      document.querySelectorAll('.subject').forEach(el => {
        if (el.style.backgroundColor === 'blue') {
          el.style.backgroundColor = 'white';
        }
      });
    }
  }

  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Alternar destaque da disciplina com mais pré-requisitos';
  toggleButton.addEventListener('click', toggleHighlightMostPrerequisites);
  const container = document.querySelector('#container');
  container.insertBefore(toggleButton, container.firstChild);

  const toggleMostUnlockingButton = document.createElement('button');
  toggleMostUnlockingButton.textContent = 'Alternar destaque da disciplina que mais desbloqueia outras';
  toggleMostUnlockingButton.addEventListener('click', toggleHighlightMostUnlocking);
  container.insertBefore(toggleMostUnlockingButton, toggleButton.nextSibling);

  // Add interactivity for highlighting prereqs
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
  });
});
