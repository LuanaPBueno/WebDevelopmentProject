import {
  getCourseNames,
  getCourse,
  getOptativeSubjectsGroup,
  getSubject,
  getSubjectPrerequisitesFromCourse,
  getSubjectUnlocksFromCourse,
} from "../../services/firebase/firebase.js";

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

  const periodsContainer = document.querySelector('.periods');
  periodsContainer.replaceChildren(createLoadingDiv());
  let containerChildren = [];

  const loadingDiv = document.getElementById("loading");

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
    }

    let percentageLoaded = (periodNumber / Object.values(course.curriculum).length * 100).toFixed(0);
    loadingDiv.textContent = "Carregando dados do curso " + courseName + "... " + percentageLoaded + " % concluído.";

    containerChildren.push(periodEl);
    periodNumber++;
  }

  document.getElementById('course-title').textContent = courseName;
  periodsContainer.replaceChildren(...containerChildren);
}

function createLoadingDiv() {
  let loading = document.createElement('p');
  loading.id = "loading";
  loading.textContent = "Carregando...";
  return loading;
}

function createSubjectEl(subject) {
  const subjectEl = document.createElement('div');
  subjectEl.value = subject;
  subjectEl.textContent = subject.name;
  subjectEl.className = 'subject';

  subjectEl.addEventListener('click', async function () {
    await changeSubjectsOpacity(subjectEl.value);
    
    disableResetButtons();
    let resetButton = subjectEl.children.namedItem("resetButton");
    resetButton.style.opacity = 1;
  });

  subjectEl.addEventListener('mouseover', function () {
    let infoButton = subjectEl.children.namedItem("infoButton");
    infoButton.style.opacity = 1;
  });
  subjectEl.addEventListener('mouseout', function () {
    let infoButton = subjectEl.children.namedItem("infoButton");
    infoButton.style.opacity = 0;
  });

  subjectEl.appendChild(document.createTextNode(' '));
  subjectEl.appendChild(createInfoButton(subject));

  subjectEl.appendChild(document.createTextNode(' '));
  subjectEl.appendChild(createResetVisibilityButton());

  return subjectEl;
}

function createOptativeSubjectsGroupEl(group) {
  const groupEl = document.createElement('div');
  groupEl.value = group;
  groupEl.textContent = group.name;
  groupEl.className = 'optative-subject-group';

  groupEl.addEventListener('mouseover', function () {
    let infoButton = groupEl.children.namedItem("infoButton");
    infoButton.style.opacity = 1;
  });
  groupEl.addEventListener('mouseout', function () {
    let infoButton = groupEl.children.namedItem("infoButton");
    infoButton.style.opacity = 0;
  });

  groupEl.appendChild(document.createTextNode(' '));
  groupEl.appendChild(createInfoButton(group));

  return groupEl;
}

function createInfoButton(subject) {
  const button = document.createElement('button');
  button.textContent = 'i';
  button.style.opacity = 0;
  button.name = "infoButton";

  button.addEventListener('click', function() {
    if (button.style.opacity < 1) return;

    event.stopPropagation();
    openPopup(subject);
  });

  return button;
}

function createResetVisibilityButton() {
  const button = document.createElement('button');
  button.textContent = 'X';
  button.style.opacity = 0;
  button.name = "resetButton";

  button.addEventListener('click', function () {
    if (button.style.opacity < 1) return;

    event.stopPropagation();
    button.style.opacity = 0;
    resetSubjectsVisibility();
  });

  return button;
}

function disableResetButtons() {
  let buttons = document.getElementsByName("resetButton");

  for (const button of buttons) {
    button.style.opacity = 0;
  }
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
  resetSubjectsVisibility();
  const periodsContainer = document.querySelector('.periods');

  const courseName = document.getElementById("course-options").value;
  const prerequisites = await getAllPrerequisitesForSubject(subject.code, courseName);
  console.log(prerequisites);
  const unlocks = await getAllUnlocksForSubject(subject.code, courseName);
  console.log(unlocks);

  for (const periodEl of Array.from(periodsContainer.children)) {
    for (const subjectEl of Array.from(periodEl.children)) {
      if (subjectEl.className != 'subject' && subjectEl.className != 'optative-subject-group') continue;
      if (subjectEl.value.code == subject.code || prerequisites.includes(subjectEl.value.code) || unlocks.includes(subjectEl.value.code)) continue;

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
  for (const subjectCode of unlocks) {
    let subjectUnlocks = await getAllUnlocksForSubject(subjectCode, courseName);
    previousUnlocks.push(...subjectUnlocks);
  }

  return [...unlocks, ...previousUnlocks];
}

function createPopup() {
  const dialog = document.querySelector("dialog");
  const closePopupButton = document.querySelector("dialog  button");
  closePopupButton.addEventListener("click", function() {
    dialog.close(); 
  });
}

function openPopup(subject) {
  const dialog = document.getElementById("popup-dialog");

  const titleElement = dialog.querySelector(".title h1");
  titleElement.textContent = subject.name;

  const creditsElement = dialog.querySelector(".minitext");
  creditsElement.textContent = subject.credits_amount + " Créditos";

  const textElement = dialog.querySelectorAll("p.faq-conteudo");

  let prereqText = "";
  for (let key of Object.keys(subject.prerequisites)) {
    prereqText += "<p>" + subject.prerequisites[key] + "</p>";
  }
  textElement[2].innerHTML = prereqText;

  let coreqText = "";
  for (let key of Object.keys(subject.corequisites)) {
    coreqText += subject.corequisites[key] + ',';
  }
  textElement[1].textContent = coreqText;

  console.log(subject.unlocks);
  let unlocksText = "";
  for (let key of Object.keys(subject.unlocks)) {
    unlocksText += "<p>" + subject.unlocks[key] + "</p>";
  }
  textElement[0].innerHTML = unlocksText;

  dialog.showModal();
}
