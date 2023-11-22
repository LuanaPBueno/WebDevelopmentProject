document.addEventListener('DOMContentLoaded', () => {
  let highlightMostPrerequisites = false;
  let highlightMostUnlocking = false;

  const subjectIds = {};
  const prereqCounts = {};
  const unlockCounts = {};

  document.getElementById('course-title').textContent = courseName;

  const periodsContainer = document.querySelector('.periods');
  let subjectGlobalId = 1;

  courseData.forEach((data) => {
    const periodEl = document.createElement('div');
    periodEl.className = 'period';
    periodEl.id = `period-${data.period}`;

    const titleEl = document.createElement('h3');
    titleEl.textContent = `${data.period}º Período`;
    periodEl.appendChild(titleEl);

    data.subjects.forEach((subjectData) => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject';
      subjectEl.setAttribute('data-id', subjectGlobalId);
      subjectIds[subjectData.name] = subjectGlobalId;
      subjectEl.textContent = subjectData.name;
      periodEl.appendChild(subjectEl);

      prereqCounts[subjectData.name] = subjectData.prereqs.length;

      subjectGlobalId++;
    });

    periodsContainer.appendChild(periodEl);
  });

  courseData.forEach((data) => {
    data.subjects.forEach((subjectData) => {
      const subjectEl = document.querySelector(`[data-id="${subjectIds[subjectData.name]}"]`);
      const prereqIds = subjectData.prereqs.map(name => subjectIds[name]).join(',');
      subjectEl.setAttribute('data-prereq', prereqIds);

      subjectData.prereqs.forEach((prereq) => {
        unlockCounts[prereq] = (unlockCounts[prereq] || 0) + 1;
      });
    });
  });

  function setSubjectBackground() {
    const mostPrereqsCount = Math.max(...Object.values(prereqCounts));

    Object.entries(prereqCounts).forEach(([subjectName, count]) => {
      const el = document.querySelector(`[data-id="${subjectIds[subjectName]}"]`);
      const intensity = count / mostPrereqsCount;
      const redValue = Math.floor(255 * intensity);
      const colorValue = 255 - redValue;
      el.style.backgroundColor = `rgb(255, ${colorValue}, ${colorValue})`;
      el.classList.add('highlight-most-prereq');
    });
  }

  function resetSubjectBackground() {
    document.querySelectorAll('.subject').forEach(el => {
      el.style.backgroundColor = '';
      el.classList.remove('highlight-most-prereq', 'highlight-most-unlocking');
    });
  }

  function toggleHighlightMostPrerequisites() {
    highlightMostPrerequisites = !highlightMostPrerequisites;
    if (highlightMostPrerequisites) {
      setSubjectBackground();
    } else {
      resetSubjectBackground();
    }
  }

  function toggleHighlightMostUnlocking() {
    highlightMostUnlocking = !highlightMostUnlocking;
    if (highlightMostUnlocking) {
      // Aqui é definido o destaque para as disciplinas que desbloqueiam outras.
      const sortedUnlockCounts = Object.entries(unlockCounts).sort((a, b) => b[1] - a[1]);
      sortedUnlockCounts.forEach(([subjectName], index) => {
        const el = document.querySelector(`[data-id="${subjectIds[subjectName]}"]`);
        el.style.backgroundColor = index === 0 ? 'blue' : (index === 1 ? 'lightblue' : 'lightsteelblue');
        el.classList.add('highlight-most-unlocking');
      });
    } else {
      resetSubjectBackground();
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

  document.querySelectorAll('.subject').forEach(subject => {
    subject.addEventListener('mouseover', function() {
      const prereqs = this.getAttribute('data-prereq');
      if (prereqs) {
        prereqs.split(',').forEach(id => {
          const highlightEl = document.querySelector(`[data-id="${id}"]`);
          highlightEl.style.backgroundColor = 'lightyellow';
        });
      }
    });

    subject.addEventListener('mouseout', function() {
      if (!highlightMostPrerequisites && !highlightMostUnlocking) {
        resetSubjectBackground();
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const dropdownContent = document.getElementById('dropdown-content');

  // Supondo que courseData.js tenha uma estrutura onde você pode obter os nomes dos cursos
  const cursos = ['Ciência da Computação']; // Adicione mais cursos conforme disponíveis

  cursos.forEach(curso => {
    const link = document.createElement('a');
    link.textContent = curso;
    link.href = "#"; // Modifique conforme necessário para fazer a ação correta ao clicar
    dropdownContent.appendChild(link);
  });
});
// Adicione isso no seu script.js
document.addEventListener('DOMContentLoaded', function() {
  // Inicialize as cores dos botões
  const colors = ['white', 'blue'];
  let index1 = 0, index2 = 0, index3 = 0;

  function updateButtonColor(button, index) {
    button.style.backgroundColor = colors[index];
  }

  // Event listeners para os botões
  const btn1 = document.getElementById('btn1');
  btn1.addEventListener('click', function() {
    if (index2 != 1 && index3 != 1) {
      index1 = 1 - index1;
      updateButtonColor(btn1, index1);
    }
  });

  const btn2 = document.getElementById('btn2');
  btn2.addEventListener('click', function() {
    if (index1 != 1 && index3 != 1) {
      index2 = 1 - index2;
      updateButtonColor(btn2, index2);
    }
  });

  const btn3 = document.getElementById('btn3');
  btn3.addEventListener('click', function() {
    if (index1 != 1 && index2 != 1) {
      index3 = 1 - index3;
      updateButtonColor(btn3, index3);
    }
  });
  const modal = document.querySelector("dialog");
  const buttonClose = modal.querySelector("dialog button");

  document.querySelectorAll('.subject').forEach(subject => {
    subject.addEventListener('click', function() {
      const subjectName = this.textContent;
      const subjectData = courseData.find(period => 
        period.subjects.some(subject => subject.name === subjectName)).subjects
        .find(subject => subject.name === subjectName);

      if (subjectData) {
        modal.querySelector(".title h1").textContent = `${subjectData.name} - ${subjectData.codigo || ''}`;
        modal.querySelector(".lista-item .bibliografia").textContent = subjectData.bibliografia || '';
        modal.querySelector(".lista-item .ementa").textContent = subjectData.ementa || '';
        modal.querySelector(".lista-item .prerequisitos").textContent = `Pré-requisitos: ${subjectData.prereqs.join(', ') || 'Nenhum'}`;

        modal.showModal();
      }
    });
  });

  buttonClose.addEventListener("click", () => {
    modal.close();
  });
});

