const courseName = 'Ciência da Computação';

const courseData = [
  
  // PRIMEIRO PERIODO
  {
    period: 1,
    subjects: 
    [
      { 
        name: 'Matemática', 
        prereqs: [] ,
        bibliografia: 'livro de mat 1',
        ementa: 'matematicas 1 e tals',
        codigo: 'MAT1000',
      },
  
      { 
        name: 'Programação I', 
        prereqs: [] ,
        bibliografia: 'livros de prog 1',
        ementa: 'prog 1 e tudo mais',
        codigo: 'INF1000',
      }
    ]
  },

  // SEGUNDO PERIODO
  {
    period: 2,
    subjects: 
    [
      { 
        name: 'Cálculo I', 
        prereqs: ['Matemática'] 
      },
      
      { 
        name: 'Programação II', 
        prereqs: ['Programação I','Matemática'] 
      }
    ]
  },

  // TERCEIRO PERIODO
  {
    period: 3,
    subjects: 
    [
      { 
        name: 'Estruturas de Dados', 
        prereqs: ['Programação II','Matemática'] 
      },
      { 
        name: 'Física I', 
        prereqs: ['Cálculo I'] 
      }
    ]
  },

  // QUARTO PERIODO
  {
    period: 4,
    subjects: 
    [
      { 
        name: 'Teoria dos Grafos', 
        prereqs: ['Estruturas de Dados'] 
      },
      
      { 
        name: 'Física II', 
        prereqs: ['Física I','Matemática'] 
      }
    ]
  },

  // QUINTO PERIODO
  {
    period: 5,
    subjects: 
    [
      { 
        name: 'Banco de Dados', 
        prereqs: ['Estruturas de Dados'] 
      },
      
      { 
        name: 'Engenharia de Software', 
        prereqs: [] 
      }
    ]
  },

  // SEXTO PERIODO
  {
    period: 6,
    subjects: 
    [
      { 
        name: 'Redes de Computadores', 
        prereqs: [] 
      },
      
      { 
        name: 'Inteligência Artificial', 
        prereqs: ['Estruturas de Dados'] 
      }
    ]
  },

  // SETIMO PERIODO
  {
    period: 7,
    subjects: 
    [
      { 
        name: 'Compiladores', 
        prereqs: ['Teoria dos Grafos'] 
      },
      
      { 
        name: 'Sistemas Operacionais', 
        prereqs: ['Estruturas de Dados','Matemática'] 
      }
    ]
  },

  // OITAVO PERIODO
  {
    period: 8,
    subjects: 
    [
      { 
        name: 'Projeto Final', 
        prereqs: ['Engenharia de Software','Compiladores','Teoria dos Grafos'] 
      },
      
      { 
        name: 'Ética em Computação', 
        prereqs: [] 
      }
    ]
  }
];
