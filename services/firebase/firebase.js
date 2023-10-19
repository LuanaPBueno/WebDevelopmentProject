import { database } from "./firebase_config.js"
import { collection, doc, getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

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

export async function getCourseNames() {
  let docs = await getDocs(collection(database, "courses"));
  
  let names = [];
  docs.forEach(course => {
    names.push(course.id);
  });

  return names;
}

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

async function registerSubjects() {
  let subjects = [

  ];

  for (const subject of subjects) {
    await setDoc(
      doc(database, "subjects", subject["code"]),
      subject,
    );
  }
}
