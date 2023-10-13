import { database } from "./firebase_config.js"
import { collection, doc, getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

export async function getCourse(course_name) {
  let docSnapshot = await getDoc(doc(database, "courses", course_name));
  if (!docSnapshot.exists()) return null;

  let course = docSnapshot.data();

  return {
    name: course_name,
    curriculum: course["curriculum"],
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
  };
}
