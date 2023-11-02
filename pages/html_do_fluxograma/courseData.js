const courseName = 'Ciência da Computação';

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
      { name: 'Cálculo I', prereqs: ['Matemática'] },
      { name: 'Programação II', prereqs: ['Programação I','Matemática'] }
    ]
  },
  {
    period: 3,
    subjects: [
      { name: 'Estruturas de Dados', prereqs: ['Programação II','Matemática'] },
      { name: 'Física I', prereqs: ['Cálculo I'] }
    ]
  },
  {
    period: 4,
    subjects: [
      { name: 'Teoria dos Grafos', prereqs: ['Estruturas de Dados'] },
      { name: 'Física II', prereqs: ['Física I','Matemática'] }
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
      { name: 'Sistemas Operacionais', prereqs: ['Estruturas de Dados','Matemática'] }
    ]
  },
  {
    period: 8,
    subjects: [
      { name: 'Projeto Final', prereqs: ['Engenharia de Software','Compiladores','Teoria dos Grafos'] },
      { name: 'Ética em Computação', prereqs: [] }
    ]
  }
];
