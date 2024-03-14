export default class Student {

  constructor(data) {

    Object.assign(this, data);
    this._uri = `/api/students/${this.id}`;
  }

  static async load(id){
    let res = await fetch(`/api/students/${id}`);
    let json = await res.json();
    return new Student(json);
  }

 async listCourse(){
    let res = await fetch(`${this._uri}/courses`);
    let json = await res.json();
    return json.courses;
  }

  async declare(deptCode){

    let body = {dept : deptCode};

    let res = await fetch(this._uri, {
      method : "PATCH",//POST , DELETE
      headers: {"Content-Type" : "application/json"},
      body: JSON.stringify(body) //text K - V
    });

    let json = await res.json();
    if(res.status !== 200){
      throw new Error(json.error)
    }

    this.dept = json.dept;

  }
}
