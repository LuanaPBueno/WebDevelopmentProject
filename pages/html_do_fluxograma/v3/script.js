
document.addEventListener('DOMContentLoaded', () => {
  let highlightMostPrerequisites = true;
  let highlightMostUnlocking = true;

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

  function toggleHighlightMostUnlocking() {
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
