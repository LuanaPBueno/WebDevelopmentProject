
const courseName = 'Ciência da Computação';

const subjectData = {
  "Matemática": {
    period: 1,
    prereqs: [],
    coreqs: ["Programação I"],
    dependents: ["Cálculo I"],
  },
  "Programação I": {
    period: 1,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Programação II": {
    period: 2,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Cálculo I": {
    period: 2,
    prereqs: [],
    coreqs: [],
    dependents: ["Física I"],
  },
  "Estruturas de Dados": {
    period: 3,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Física I": {
    period: 3,
    prereqs: ["Cálculo I"],
    coreqs: [],
    dependents: ["Física II"],
  },
  "Teoria dos Grafos": {
    period: 4,
    prereqs: [],
    coreqs: [],
    dependents: [],
  }, 
  "Física II": {
    period: 4,
    prereqs: ["Física I"],
    coreqs: [],
    dependents: [],
  }, 
  "Banco de Dados": {
    period: 5,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Engenharia de Software": {
    period: 5,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Redes de Computadores": {
    period: 6,
    prereqs: [],
    coreqs: [],
    dependents: [],
  }, 
  "Inteligência Artificial": {
    period: 6,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Compiladores": {
    period: 7,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Sistemas Operacionais": {
    period: 7,
    prereqs: ["Inteligência Artificial"],
    coreqs: ["Compiladores"],
    dependents: ["Projeto Final"],
  },
  "Projeto Final": {
    period: 8,
    prereqs: [],
    coreqs: [],
    dependents: [],
  },
  "Ética em Computação": {
    period: 8,
    prereqs: [],
    coreqs: [],
    dependents: [],
  }
}

const courseData = [
  {
    period: 1,
    subjects: [
      { name: 'Matemática', prereqs: [] },
      { name: 'Programação I', prereqs: [] }
    ]
  },
  {
    period: 2,
    subjects: [
      { name: 'Cálculo I', prereqs: ['Matemática'], not_dependents: [] },
      { name: 'Programação II', prereqs: ['Programação I'] }
    ]
  },
  {
    period: 3,
    subjects: [
      { name: 'Estruturas de Dados', prereqs: ['Programação II'] },
      { name: 'Física I', prereqs: ['Cálculo I'] }
    ]
  },
  {
    period: 4,
    subjects: [
      { name: 'Teoria dos Grafos', prereqs: ['Estruturas de Dados'] },
      { name: 'Física II', prereqs: ['Física I'] }
    ]
  },
  {
    period: 5,
    subjects: [
      { name: 'Banco de Dados', prereqs: ['Estruturas de Dados'] },
      { name: 'Engenharia de Software', prereqs: [] }
    ]
  },
  {
    period: 6,
    subjects: [
      { name: 'Redes de Computadores', prereqs: [] },
      { name: 'Inteligência Artificial', prereqs: ['Estruturas de Dados'] }
    ]
  },
  {
    period: 7,
    subjects: [
      { name: 'Compiladores', prereqs: ['Teoria dos Grafos'] },
      { name: 'Sistemas Operacionais', prereqs: ['Estruturas de Dados'] }
    ]
  },
  {
    period: 8,
    subjects: [
      { name: 'Projeto Final', prereqs: ['Engenharia de Software'] },
      { name: 'Ética em Computação', prereqs: [] }
    ]
  }
];
