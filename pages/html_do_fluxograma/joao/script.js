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

      subjectGlobalId++;
    });

    periodsContainer.appendChild(periodEl);
  });

  courseData.forEach((data) => {
    data.subjects.forEach((subjectData) => {
      const subjectEl = document.querySelector(`[data-id="${subjectIds[subjectData.name]}"]`);
      const prereqIds = subjectData.prereqs.map(name => subjectIds[name]).join(',');
      subjectEl.setAttribute('data-prereq', prereqIds);

      prereqCounts[subjectData.name] = subjectData.prereqs.length;

      subjectData.prereqs.forEach((prereq) => {
        unlockCounts[prereq] = (unlockCounts[prereq] || 0) + 1;
      });
    });
  });

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

    subject.addEventListener('click', function() {
      modal.showModal();
    });
    
  });
  const modal = document.querySelector("dialog")
  const buttonClose = document.querySelector("dialog  button")
  buttonClose.addEventListener("click", function(){
    modal.close();
  });
});
