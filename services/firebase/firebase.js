import { database } from "./firebase_config.js"
import { collection, doc, getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

/**
 * Retorna um objeto de curso de acordo com o nome passado por parâmetro
 * @param {string} course_name Nome do curso no site da PUC
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
export async function getCourse(course_name) {
  let docSnapshot = await getDoc(doc(database, "courses", course_name));
  if (!docSnapshot.exists()) return null;

  let course = docSnapshot.data();

  return {
    name: course_name,
    curriculum: course["curriculum"],
    free_electives_amount: course["free_electives_amount"],
    complementary_activities_amount: course["complementary_activities_amount"],
  };
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
 * "prerequisites" é um dicionário que funciona como uma lista de possibilidades de pré-requisitos,
 * cada possibilidade é uma lista de strings contendo o código de matérias que são pré-requisitos dessa matéria.
 * Considere utilizar a função "getSubjectPrerequisitesFromCourse" para receber os pré-requisitos em um curso específico
 * 
 * "corequisites" é um dicionário que funciona como uma lista de possibilidades de corequisitos,
 * cada possibilidade é uma lista de strings contendo o código de matérias que são corequisitos dessa matéria
 */
export async function getSubject(code) {
  let docSnapshot = await getDoc(doc(database, "subjects", code));
  if (!docSnapshot.exists()) return null;

  let subject = docSnapshot.data();

  return {
    code: code,
    name: subject["name"],
    prerequisites: subject["prerequisites"],
    corequisites: subject["corequisites"],
  };
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

async function registerSubjectUnlocks() {
  let subjects = await getDocs(collection(database, "subjects"));

  console.log("Iniciando relação entre matérias");

  for (const subjectCode of Object.keys(subjects)) {
    let subject = subjects[subjectCode];
    subject["unlocks"] = [];

    for (const possiblyUnlockableSubjectCode of Object.keys(subjects)) {
      let possiblyUnlockableSubject = subjects[possiblyUnlockableSubjectCode];

      if (possiblyUnlockableSubject.prerequisites.includes(possiblyUnlockableSubjectCode)) {
        subject["unlocks"].push(possiblyUnlockableSubjectCode);
      }
    }
  }

  console.log("Iniciando registro no firebas");

  for (const subjectCode of Object.keys(subjects)) {
    let subject = subjects[subjectCode];
    await setDoc(
      doc(database, "subjects", subjectCode),
      subject,
    );
  }
}

