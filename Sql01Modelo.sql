CREATE TABLE Disciplinas (
    id_disciplina INT PRIMARY KEY,
    nome_da_disciplina VARCHAR(255),
    créditos INT
    curso_da_disciplina VARCHAR(100),
    FOREIGN KEY (curso_da_disciplina) REFERENCES Cursos(nome_do_curso));


CREATE TABLE PreRequisitos ( 
    id_preRequisito INT PRIMARY KEY, 
    nome_da_disciplina_do_preRequisito VARCHAR(100),
    nome_da_disciplina_que_precisa_do_preRquisito VARCHAR(100),
    id_disciplina_que_precisa_do_preRequisito INT
    FOREIGN KEY (nome_da_disciplina_do_preRequisito) REFERENCES Disciplinas(nome_da_disciplina), 
    FOREIGN KEY (nome_da_disciplina_que_precisa_do_preRquisito) REFERENCES Disciplinas(nome_da_disciplina),
    FOREIGN KEY (id_disciplina_que_precisa_do_preRequisito) REFERENCES Disciplinas(id_disciplina)
    FOREIGN KEY (id_preRequisito) REFERENCES Disciplinas(id_disciplina));

CREATE TABLE Cursos(
    id_curso INT PRIMARY KEY,
    nome_do_curso VARCHAR(100)
);

