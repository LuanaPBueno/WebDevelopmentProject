import { database } from "./firebase_config.js"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

/**
 * Retorna um objeto de curso de acordo com o nome passado por parâmetro
 * @param {string} courseName string com nome do curso de acordo com o site da PUC
 * @returns Objeto de curso:
 * 
 * "name" é a string que representa o nome, por conveniência
 * 
 * "curriculum" é um dicionário que funciona como uma lista de períodos, cada período é um array de matérias
 * 
 * "free_electives_amount" é um int que representa a quantidade de créditos de matérias eletivas
 * 
 * "complementary_activities_amount" é um int que representa a quantidade de créditos de horas complementares
*/
export async function getCourse(courseName) {
  let docSnapshot = await getDoc(doc(database, "courses", courseName));
  if (!docSnapshot.exists()) return null;

  let course = docSnapshot.data();

  let curriculum = course["curriculum"];
  if (courseName === "Design" || courseName === "Estudos de Mídia") {
    await fixEquivalentGroups(curriculum, courseName);
  }

  return {
    name: courseName,
    curriculum: curriculum,
    free_electives_amount: course["free_electives_amount"],
    complementary_activities_amount: course["complementary_activities_amount"],
  };
}

/** Grupos de optativas equivalentes */
const specialOptativeSubjectGroups = [
  "COM0311", "COM0314",
  "DSG0001", "DSG0002", "DSG0003", "DSG0004", "DSG0005", "DSG0006", "DSG0010", "DSG0011", "DSG0012", "DSG0013", "DSG0014", "DSG0015",
];
/** Corrige os grupos de optativas que são equivalentes no currículo de um curso tratando cada uma caso a caso. */
async function fixEquivalentGroups(curriculum, courseName) {
  let periodNumber = 0;
  for (const period of Object.values(curriculum)) {
    let fixedPeriod = [];

    // Removendo grupos equivalentes
    for (const subjectCode of period) {
      if (!specialOptativeSubjectGroups.includes(subjectCode)) {
        fixedPeriod.push(subjectCode);
      }
    }

    // Adicionando os grupos artificiais
    switch (courseName) {
      case "Design":
        if (periodNumber >= 4 && periodNumber <= 7) {
          let artificialGroup = "DSGS00" + (periodNumber - 3).toString();
          fixedPeriod.push(artificialGroup);
        }
        break;

      case "Estudos de Mídia":
        if (periodNumber >= 3 && periodNumber <= 6) {
          let artificialGroup = "COMS001";
          for (let i = 0; i < 3; i++) fixedPeriod.push(artificialGroup);
        }
        break;
    }

    curriculum[periodNumber] = fixedPeriod;
    periodNumber++;
  }
}

export async function getCourses() {
  let docs = await getDocs(collection(database, "courses"));

  let courses = {};
  docs.forEach(course => {
    let courseData = course.data();
    courses[course.id] = {
      name: course.id,
      curriculum: courseData["curriculum"],
      free_electives_amount: courseData["free_electives_amount"],
      complementary_activities_amount: courseData["complementary_activities_amount"],
    };
  });

  return courses;
}

/** Retorna o nome dos cursos em um array de strings */
export async function getCourseNames() {
  let docs = await getDocs(collection(database, "courses"));

  let names = [];
  docs.forEach(course => {
    names.push(course.id);
  });

  return names;
}

/**
 * Retorna uma matéria a partir do seu código passado como parâmetro
 * @param {string} code string com código da matéria
 * @returns Objeto de matéria:
 * 
 * "code" é o código da matéria, por conveniência
 * 
 * "name" é uma string com nome da matéria
 * 
 * "credits_amount" é um int com a quantidade de créditos da matéria
 * 
 * "prerequisites" é um dicionário que funciona como uma lista de possibilidades de pré-requisitos,
 * cada possibilidade é uma lista de strings contendo o código de matérias que são pré-requisitos dessa matéria.
 * Pré-requisitos que não sejam o código de uma matéria tem um '_' na frente.
 * Considere utilizar a função "getSubjectPrerequisitesFromCourse" para receber os pré-requisitos em um curso específico.
 * 
 * "corequisites" é um dicionário que funciona como uma lista de possibilidades de corequisitos,
 * cada possibilidade é uma lista de strings contendo o código de matérias que são corequisitos dessa matéria
 * 
 * "unlocks" é um array de strings contendo o código de matérias desbloqueadas assim que a matéria é concluída.
 * Considere utiilizar a função "getSubjectUnlocksFromCourse" para receber as matérias desbloqueadas em um curso específico.
*/
export async function getSubject(code) {
  let docSnapshot = await getDoc(doc(database, "subjects", code));
  if (!docSnapshot.exists()) return null;

  let subject = docSnapshot.data();

  return {
    code: code,
    name: subject["name"],
    credits_amount: subject["credits_amount"],
    prerequisites: subject["prerequisites"],
    corequisites: subject["corequisites"],
    unlocks: subject["unlocks"],
  };
}

/**
 * Retorna um dicionário que funciona como uma lista de possibilidades de pré-requisitos,
 * e que fazem parte do curso com nome courseName
 * @param {string} subjectCode string com código da matéria
 * @param {string} courseName string com nome do curso de acordo com o site da PUC
 * @returns
 * dicionário que funciona como uma lista de possibilidades de pré-requisitos,
 * cada possibilidade é uma lista de strings contendo o código de matérias que são pré-requisitos dessa matéria.
 * 
 * Essa função não inclui pré-requisitos que não sejam matérias.
 * 
 * Como só fazem parte da lista pré-requisitos que não são matérias e matérias presentes no curso,
 * é possível que uma matéria tenha pré-requisitos, mas nenhum deles faça parte do curso.
 * Nesse caso, a função retorna esse dicionário: { 0: "A matéria contém pré-requisitos, mas nenhum deles faz parte do curso." }
*/
export async function getSubjectPrerequisitesFromCourse(subjectCode, courseName) {
  let prerequisitesInCourse = {};
  let prerequisites = (await getSubject(subjectCode)).prerequisites;
  let courseSubjects = await getAllSubjectsFromCourse(courseName);

  if (Object.values(prerequisites).length == 0) return {};

  let prerequisiteNumber = 0;
  for (const prerequisite of Object.values(prerequisites)) {
    let shouldIncludePrerequisite = true;

    // Verificação se todas as matérias do pré-requisito fazem parte do curso
    for (const subjectCode of prerequisite) {
      if (subjectCode.includes("_")) shouldIncludePrerequisite = false;

      let subjectInCurriculum = false;
      if (courseSubjects.includes(subjectCode))  subjectInCurriculum = true;

      if (!subjectInCurriculum) shouldIncludePrerequisite = false;
    }

    if (!shouldIncludePrerequisite) continue;
    prerequisitesInCourse[prerequisiteNumber] = prerequisite;
    prerequisiteNumber++;
  }

  if (Object.values(prerequisitesInCourse).length == 0) {
    return { 0: "A matéria contém pré-requisitos, mas nenhum deles faz parte do curso." }
  }

  return prerequisitesInCourse;
}

/**
 * Retorna um array com os códigos de todas as matérias desbloqueadas quando a matéria é concluída,
 * e que fazem parte do curso com nome courseName
 * @param {string} subjectCode string com código da matéria
 * @param {string} courseName string com nome do curso de acordo com o site da PUC
 * @returns {Array<string>} array de strings contendo o código das matérias desbloqueadas
*/
export async function getSubjectUnlocksFromCourse(subjectCode, courseName) {
  let unlocks = [];
  let subject = await getSubject(subjectCode);

  let docSnapshot = await getDoc(doc(database, "courses", courseName));
  let courseData = docSnapshot.data();
  let courseSubjects = courseData["all_subjects"];

  for (const subjectCode of subject.unlocks) {
    courseSubjects.forEach(courseSubjectCode => {
      if (subjectCode === courseSubjectCode) {
        unlocks.push(subjectCode);
      }
    });
  }

  return unlocks;
}

/**
 * Retorna um grupo de optativas de acordo com seu código passado por parâmetro
 * @param {string} code string com código do grupo
 * @returns Objeto de grupo de matérias optativas:
 * 
 * "code" é o código do grupo, por conveniência
 * 
 * "name" é uma string com o nome da matéria
 * 
 * "subjects" é um array de strings, onde cada string é o código de uma das matérias que compõem o grupo
*/
export async function getOptativeSubjectsGroup(code) {
  let docSnapshot = await getDoc(doc(database, "optative_subjects_groups", code));
  if (!docSnapshot.exists()) return null;

  let group = docSnapshot.data();

  return {
    code: code,
    name: group["name"],
    subjects: group["subjects"],
  }
}

/**
 * Retorna true caso o código seja um grupo de matérias optativas no banco de dados
 * @param {string} code string com código da matéria
 * @returns {boolean} boolean se o código é de um grupo de optativas ou não
*/
export async function isCodeFromOptativeSubjectsGroup(code) {
  let docSnapshot = await getDoc(doc(database, "optative_subjects_groups", code));
  return docSnapshot.exists();
}

async function getAllSubjectsFromCourse(courseName) {
  let docSnapshot = await getDoc(doc(database, "courses", courseName));
  let courseData = docSnapshot.data();
  return courseData["all_subjects"];
}

async function registerSubjects(subjects) {
  let i = 0;
  for (const subject of subjects) {
    console.log(i/subjects.length * 100);
    await setDoc(
      doc(database, "subjects", subject["code"]),
      subject,
    );
    i++;
  }
}

async function registerOptativeGroup(groupData) {
  await setDoc(
    doc(database, "optative_subjects_groups", groupData["code"]),
    groupData,
  );
}

async function registerSubjectUnlocks() {
  let subjects = await getDocs(collection(database, "subjects"));
  let updatedData = {};

  console.log("Iniciando relação entre matérias");

  subjects.forEach(subject => {
    updatedData[subject.id] = subject.data();
    updatedData[subject.id]["unlocks"] = [];

    subjects.forEach(possiblyUnlockableSubjectCode => {
      let possiblyUnlockableSubject = possiblyUnlockableSubjectCode.data();

      for (const prerequisiteKey of Object.keys(possiblyUnlockableSubject["prerequisites"])) {
        let prerequisite = possiblyUnlockableSubject["prerequisites"][prerequisiteKey];
        if (prerequisite.includes(subject.id)) {
          console.log(possiblyUnlockableSubjectCode.id);
          updatedData[subject.id]["unlocks"].push(possiblyUnlockableSubjectCode.id);
          break;
        }
      }
    });
  });

  console.log("Iniciando registro no firebase");

  subjects.forEach(async subject => {
    await updateDoc(
      doc(database, "subjects", subject.id),
      {"unlocks": updatedData[subject.id]["unlocks"]},
    );
  });

  console.log("Registro finalizado com sucesso");
}

async function createAllSubjectFields() {
  let courses = await getDocs(collection(database, "courses"));

  courses.forEach(async course => {
    let data = course.data();
    let all_subjects = [];

    for (const period of Object.values(data["curriculum"])) {
      for (const courseCode of period) {
        if (getSubject(courseCode) != null) {
          if (!all_subjects.includes(courseCode)) all_subjects.push(courseCode);

        } else {
          let group = await getOptativeSubjectsGroup(courseCode);

          if (group == null) continue;

          for (const subjectCode of group.subjects) {
            if (!all_subjects.includes(subjectCode)) all_subjects.push(subjectCode);
          }
        }
      }
    }
    console.log(course.id);
    console.log(all_subjects);

    await updateDoc(
      doc(database, "courses", course.id),
      {"all_subjects": all_subjects},
    );
  });
}
