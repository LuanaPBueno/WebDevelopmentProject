CREATE TABLE Disciplinas (
    curso VARCHAR(255),
    cod INT PRIMARY KEY,
    nome_da_disciplina VARCHAR(255),
    créditos INT,
    pre_requisito VARCHAR(255),
    co_requesito VARCHAR(255),
    ementa VARCHAR(255)
);
