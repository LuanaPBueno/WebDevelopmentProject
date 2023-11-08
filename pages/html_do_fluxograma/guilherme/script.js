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
