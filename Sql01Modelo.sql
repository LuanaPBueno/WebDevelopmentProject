CREATE TABLE Disciplinas (
    cod INT PRIMARY KEY,
    nome_da_disciplina VARCHAR(255),
    créditos INT );
CREATE TABLE PreRequisitos ( 
    id INT PRIMARY KEY, 
    disciplina_cod INT,
    pre_requisito_cod INT,
    FOREIGN KEY (disciplina_cod) REFERENCES Disciplinas(cod), 
    FOREIGN KEY (pre_requisito_cod) REFERENCES Disciplinas(cod) );
