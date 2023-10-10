
document.addEventListener('DOMContentLoaded', () => {
  // Dynamically set the course name
  document.getElementById('course-title').textContent = courseName;

  // Generate HTML based on the data
  const periodsContainer = document.querySelector('.periods');
  let subjectGlobalId = 1;
  const subjectIds = {};

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

  // Assign prerequisites based on names
  courseData.forEach((data) => {
    data.subjects.forEach((subjectData) => {
      const subjectEl = document.querySelector(`[data-id="${subjectIds[subjectData.name]}"]`);
      const prereqIds = subjectData.prereqs.map(name => subjectIds[name]).join(',');
      subjectEl.setAttribute('data-prereq', prereqIds);
    });
  });

  // Add interactivity for highlighting prereqs and subjects that are prerequisites of other subjects
  const subjects = document.querySelectorAll('.subject');
  subjects.forEach(subject => {
    subject.addEventListener('mouseover', function() {
      // Highlight this subject if it is a prerequisite of any other subject
      const thisId = this.getAttribute('data-id');
      document.querySelectorAll(`[data-prereq*="${thisId}"]`).forEach(el => {
        el.classList.add('highlight');
      });

      // Highlight prerequisites of this subject
      const prereqs = this.getAttribute('data-prereq');
      if (prereqs) {
        prereqs.split(',').forEach(id => {
          document.querySelector(`[data-id="${id}"]`).classList.add('highlight-prereq');
        });
      }
    });

    subject.addEventListener('mouseout', function() {
      document.querySelectorAll('.highlight').forEach(el => {
        el.classList.remove('highlight');
      });
      document.querySelectorAll('.highlight-prereq').forEach(el => {
        el.classList.remove('highlight-prereq');
      });
    });
  });
});
