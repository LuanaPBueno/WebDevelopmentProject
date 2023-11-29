import { getCourseNames, getCourse, getOptativeSubjectsGroup, getSubject, getSubjectPrerequisitesFromCourse, getSubjectUnlocksFromCourse } from "../../services/firebase/firebase.js";

document.addEventListener('DOMContentLoaded', async () => {
  let courseNames = await getCourseNames();
  await loadCourseOptionsDropDownButton(courseNames);
  await loadPeriodColumns();
  createPopup();
});

document.getElementById("course-options").addEventListener("change", loadPeriodColumns);

async function loadCourseOptionsDropDownButton(courseNames) {
  let dropdownButton = document.getElementById("course-options");

  courseNames.forEach(courseName => {
    let option = document.createElement("option");
    option.value = courseName;
    option.text = courseName;

    dropdownButton.appendChild(option);
  });
}

async function loadPeriodColumns() {
  let courseName = document.getElementById("course-options").value;
  let course = await getCourse(courseName);

  document.getElementById('course-title').textContent = courseName;

  const periodsContainer = document.querySelector('.periods');
  periodsContainer.replaceChildren(createLoadingDiv());
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
        let subjectEl = createSubjectEl(subject);
        periodEl.appendChild(subjectEl);

      } else {
        let group = await getOptativeSubjectsGroup(code);
        if (!group) continue;

        let groupEl = createOptativeSubjectsGroupEl(group);
        periodEl.appendChild(groupEl);
      }

      subjectGlobalId++;
    }

    containerChildren.push(periodEl);
    periodNumber++;
  }

  periodsContainer.replaceChildren(...containerChildren);
}

function createLoadingDiv() {
  let loading = document.createElement('p');
  loading.textContent = "Carregando...";
  return loading;
}

function createSubjectEl(subject) {
  const subjectEl = document.createElement('div');
  subjectEl.value = subject;
  subjectEl.textContent = subject.name;
  subjectEl.className = 'subject';

  subjectEl.addEventListener('click', function() {
    openPopup(subjectEl.textContent);
  });

  subjectEl.addEventListener('mouseover', function () {
    changeSubjectsOpacity(subjectEl.value);
  });
  subjectEl.addEventListener('mouseout', resetSubjectsVisibility);

  return subjectEl;
}

function createOptativeSubjectsGroupEl(group) {
  const groupEl = document.createElement('div');
  groupEl.value = group;
  groupEl.textContent = group.name;
  groupEl.className = 'optative-subject-group';

  groupEl.addEventListener('click', function() {
    openPopup(groupEl.textContent);
  });

  return groupEl;
}

function resetSubjectsVisibility() {
  const periodsContainer = document.querySelector('.periods');

  for (const periodEl of Array.from(periodsContainer.children)) {
    for (const subjectEl of Array.from(periodEl.children)) {
      if (subjectEl.className != 'subject' && subjectEl.className != 'optative-subject-group') continue;
      subjectEl.style.opacity = 1;
    }
  }
}

async function changeSubjectsOpacity(subject) {
  const periodsContainer = document.querySelector('.periods');

  const courseName = document.getElementById("course-options").value;
  const prerequisites = await getAllPrerequisitesForSubject(subject.code, courseName);
  console.log(prerequisites);
  const unlocks = await getAllUnlocksForSubject(subject.code, courseName);
  console.log(unlocks);

  for (const periodEl of Array.from(periodsContainer.children)) {
    for (const subjectEl of Array.from(periodEl.children)) {
      if (subjectEl.className != 'subject' && subjectEl.className != 'optative-subject-group') continue;
      if (subjectEl.textContent == subject.name || prerequisites.includes(subjectEl.value.code) || unlocks.includes(subjectEl.value.code)) continue;

      subjectEl.style.opacity = 0.5;
    }
  }
}

async function getAllPrerequisitesForSubject(subjectCode, courseName) {
  const prerequisites = await getSubjectPrerequisitesFromCourse(subjectCode, courseName);
  if (Object.keys(prerequisites).length == 0) return [];

  let previousPrerequisites = [];
  for (const subjectCode of prerequisites[0]) {
    let subjectPrerequisites = await getAllPrerequisitesForSubject(subjectCode, courseName);
    previousPrerequisites.push(...subjectPrerequisites);
  }

  return [...prerequisites[0], ...previousPrerequisites];
}

async function getAllUnlocksForSubject(subjectCode, courseName) {
  const unlocks = await getSubjectUnlocksFromCourse(subjectCode, courseName);
  if (Object.keys(unlocks).length == 0) return [];

  let previousUnlocks = [];
  for (const subjectCode of unlocks[0]) {
    let subjectUnlocks = await getAllUnlocksForSubject(subjectCode, courseName);
    previousUnlocks.push(...subjectUnlocks);
  }

  return [...unlocks[0], ...previousUnlocks];
}

function createPopup() {
  const dialog = document.querySelector("dialog");
  const closePopupButton = document.querySelector("dialog  button");
  closePopupButton.addEventListener("click", function() {
    dialog.close(); 
  });
}

function openPopup(subjectName) {
  const dialog = document.getElementById("popup-dialog");

  const titleElement = dialog.querySelector(".title h1");
  titleElement.textContent = subjectName;

  dialog.showModal();
}

// FIXME botões com o padrão de value
// async function loadHighlightButtons() {
//   function toggleHighlightMostPrerequisites() {
//     highlightMostPrerequisites = !highlightMostPrerequisites;

//     if (highlightMostPrerequisites) {
//       let sortedSubjects = Object.entries(prereqCounts).sort((a, b) => b[1] - a[1]);

//       if (sortedSubjects.length > 0) {
//         const mostPrerequisitesSubject = sortedSubjects[0][0];
//         const el = document.querySelector(`[data-id="${subjectIds[mostPrerequisitesSubject]}"]`);
//         el.style.backgroundColor = 'red';
//       }

//       if (sortedSubjects.length > 1) {
//         const secondMostPrerequisitesSubject = sortedSubjects[1][0];
//         const el = document.querySelector(`[data-id="${subjectIds[secondMostPrerequisitesSubject]}"]`);
//         el.style.backgroundColor = 'orange';
//       }

//       if (sortedSubjects.length > 2) {
//         const thirdMostPrerequisitesSubject = sortedSubjects[2][0];
//         const el = document.querySelector(`[data-id="${subjectIds[thirdMostPrerequisitesSubject]}"]`);
//         el.style.backgroundColor = 'rgb(73 253 253)';
//       }
//     } else {
//       document.querySelectorAll('.subject').forEach(el => {
//         el.style.backgroundColor = 'white';
//       });
//     }
//   }

//   function toggleHighlightMostUnlocking() {
//     highlightMostUnlocking = !highlightMostUnlocking;

//     if (highlightMostUnlocking) {
//       let sortedUnlockingSubjects = Object.entries(unlockCounts).sort((a, b) => b[1] - a[1]);

//       if (sortedUnlockingSubjects.length > 0) {
//         const mostUnlockingSubject = sortedUnlockingSubjects[0][0];
//         const el = document.querySelector(`[data-id="${subjectIds[mostUnlockingSubject]}"]`);
//         el.style.backgroundColor = 'blue';
//       }

//       if (sortedUnlockingSubjects.length > 1) {
//         const secondMostUnlockingSubject = sortedUnlockingSubjects[1][0];
//         const el = document.querySelector(`[data-id="${subjectIds[secondMostUnlockingSubject]}"]`);
//         el.style.backgroundColor = 'lightgreen';
//       }

//       if (sortedUnlockingSubjects.length > 2) {
//         const thirdMostUnlockingSubject = sortedUnlockingSubjects[2][0];
//         const el = document.querySelector(`[data-id="${subjectIds[thirdMostUnlockingSubject]}"]`);
//         el.style.backgroundColor = 'pink';
//       }
//     } else {
//       document.querySelectorAll('.subject').forEach(el => {
//         el.style.backgroundColor = 'white';
//       });
//     }
//   }

//   let highlightMostPrerequisites = false;
//   let highlightMostUnlocking = false;

//   for (const period of Object.values(course.curriculum)) {
//     for (const subjectCode of period) {
//       let subject = await getSubject(subjectCode);
//       if (!subject) continue;

//       // console.log(subject.name);

//       let prerequisites = await getSubjectPrerequisitesFromCourse(subject.code, courseName);
//       if (Object.keys(prerequisites).length == 0) continue;
//       prerequisites = prerequisites[0];
//       if (prerequisites === "A matéria contém pré-requisitos, mas nenhum deles faz parte do curso.") continue;

//       // console.log(prerequisites);

//       const subjectEl = document.querySelector(`[data-id="${subjectIds[subject.name]}"]`);
//       const prereqIds = prerequisites.map(name => subjectIds[name]).join(',');
//       subjectEl.setAttribute('data-prereq', prereqIds);

//       prereqCounts[subject.name] = prerequisites.length;

//       prerequisites.forEach((prereq) => {
//         unlockCounts[prereq] = (unlockCounts[prereq] || 0) + 1;
//       });
//     }
//   }

//   const toggleButton = document.createElement('button');
//   toggleButton.className = 'button-56';
//   toggleButton.textContent = 'Alternar destaque da disciplina com mais pré-requisitos';
//   toggleButton.addEventListener('click', toggleHighlightMostPrerequisites);

//   const toggleMostUnlockingButton = document.createElement('button');
//   toggleMostUnlockingButton.className = 'button-56';
//   toggleMostUnlockingButton.textContent = 'Alternar destaque da disciplina que mais desbloqueia outras';
//   toggleMostUnlockingButton.addEventListener('click', toggleHighlightMostUnlocking);

//   const buttonContainer = document.getElementById('button-container');
//   buttonContainer.appendChild(toggleButton);
//   buttonContainer.appendChild(toggleMostUnlockingButton);

//   const subjects = document.querySelectorAll('.subject');
//   subjects.forEach(subject => {
//     subject.addEventListener('mouseover', function() {
//       const prereqs = this.getAttribute('data-prereq');
//       if (prereqs) {
//         prereqs.split(',').forEach(id => {
//           document.querySelector(`[data-id="${id}"]`).style.backgroundColor = 'lightyellow';
//         });
//       }
//     });

//     subject.addEventListener('mouseout', function() {
//       const prereqs = this.getAttribute('data-prereq');
//       if (prereqs) {
//         prereqs.split(',').forEach(id => {
//           document.querySelector(`[data-id="${id}"]`).style.backgroundColor = 'white';
//         });
//       }
//     });
//   });
// }
