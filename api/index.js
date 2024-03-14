import bodyParser from "body-parser";
import express from "express";

const api = express.Router();
api.use(bodyParser.json());

api.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
//GET: /api/
api.get("/", (req, res) => {
  res.json({ message: "Hello, world!", num: 193 });
});

//GET: /api/text
api.get("/text", (req, res) => {
  res.send("Hello, world!");
});

const NAMES = [
  ["Michael", "Chang"], ["Neel", "Kishnani"], ["Kashif", "Nazir"]
];
const STUDENTS = Object.fromEntries(NAMES.map(([givenName, surname]) => {
  let id = (givenName[0] + surname).toLowerCase();
  return [id, { id, givenName, surname, dept: null, unitsCompleted: 0, isAlum: false }];
}));

api.get("/students", (req, res) => {
  let students = Object.values(STUDENTS);
  let query = req.query.filter;
  if (query) {
    query = query.toLowerCase();
    students = students.filter(s => `${s.givenName} ${s.surname}`.toLowerCase().includes(query));
  }
  res.json({ students: students.map(({ id, givenName, surname }) => ({ id, givenName, surname })) });
});

api.use("/students/:id", (req, res, next) => {
  let id = req.params.id;
  let student = STUDENTS[id];
  if (!student) {
    res.status(404).json({ error: `Can't find student ${id}` });
    return;
  }
  next();
});

api.get("/students/:id", (req, res) => {
  let student = STUDENTS[req.params.id];
  res.json(student);
});

api.patch("/students/:id", (req, res) => {
  let student = STUDENTS[req.params.id];
  if ("dept" in req.body) {
    if (student.dept && student.dept !== req.body.dept) {
      res.status(400).json({ error: `${student.id} already declared ${student.dept}` });
      return;
    }
    student.dept = req.body.dept.toUpperCase();
  }
  if ("unitsCompleted" in req.body) {
    student.unitsCompleted = req.body.unitsCompleted;
  }
  res.json(student);
});

api.get("/students/:id/courses", (req, res) => {
  res.json({ courses: [
    { code: "CS107", units: 5 }, { code: "CS193X", units: 3 }
  ] });
});

api.post("/students/:id/graduate", (req, res) => {
  let student = STUDENTS[req.params.id];
  if (student.isAlum) res.status(400).json({ error: `${student.id} already graduated` });
  else if (!student.dept) res.status(400).json({ error: `${student.id} hasn't declared yet` });
  else if (student.unitsCompleted < 180) res.status(400).json({ error: `${student.id} doesn't have enough units` });
  else {
    student.isAlum = true;
    res.json({ success: true });
  }
});

api.get("/protected", (req, res) => {
  res.status(403).json({ error: "You aren't allowed" });
});

export default (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);
};
