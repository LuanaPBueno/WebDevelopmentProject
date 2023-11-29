import { 
  getCourseNames, 
  getCourse, 
  getOptativeSubjectsGroup, 
  getSubject, 
  getSubjectPrerequisitesFromCourse, 
  getSubjectUnlocksFromCourse 
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

  document.getElementById('course-title').textContent = courseName;

  const periodsContainer = document.querySelector('.periods');
  periodsContainer.replaceChildren(createLoadingDiv());
  let containerChildren = [];
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
    handleOptativeGroupClick(group.code);
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
  // Aqui vai a lógica para mudar a opacidade dos sujeitos
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


async function handleOptativeGroupClick(groupCode) {
  try {
    const optativeSubjects = await getOptativeSubjectsGroup(groupCode);
    if (optativeSubjects) {
      showOptativeSubjectsPopup(optativeSubjects.subjects);
    }
  } catch (error) {
    console.error("Erro ao buscar matérias optativas: ", error);
  }
}

function showOptativeSubjectsPopup(subjects) {
    const popup = document.createElement('div');
    popup.id = 'optative-subjects-popup';
    popup.innerHTML = '<h2>Escolha uma das matérias optativas:</h2>';
  
    const list = document.createElement('ul');
    subjects.forEach(subjectCode => {
      const listItem = document.createElement('li');
      listItem.textContent = subjectCode;
      list.appendChild(listItem);
    });
    popup.appendChild(list);
  
    // Estilizando o pop-up
    Object.assign(popup.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      zIndex: '1000',
    });
  
    // Adiciona o pop-up ao corpo do documento
    document.body.appendChild(popup);
  
    // Adicionando funcionalidade para fechar o pop-up
    popup.addEventListener('click', function(event) {
      if (event.target === popup) {
        popup.remove();
      }
    });
  }
  
  function createPopup() {
    const popup = document.createElement('dialog');
    popup.id = 'popup-dialog';
    popup.innerHTML = `
      <h1 class="title"></h1>
      <div class="content"></div>
    `;
  
    // Adicionar estilos e outros elementos necessários aqui
  
    document.body.appendChild(popup);
  }
  
  function openPopup(subjectName) {
    const popup = document.getElementById('popup-dialog');
    popup.querySelector('.title').textContent = subjectName;
  
    // Aqui pode adicionar mais lógica para preencher o conteúdo do pop-up com informações específicas
  
    popup.showModal(); // Mostra o pop-up como um diálogo modal
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