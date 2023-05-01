const APP_ID = "realm-workshop-ykxiv";
const ATLAS_SERVICE = "mongodb-atlas";
const app = new Realm.App({ id: APP_ID });

let user_id = null;
let mongodb = null;
let coll = null;

console.log("banana! banana!");

function getUser() {
  return document.getElementById("username").value;
}

function getPass() {
  return document.getElementById("password").value;
}

//   function logOut() {
//     document.body.classList.toggle("logged-in", false);
//   }

//   document
//     .getElementById("login-page")
//     .addEventListener("input", () =>
//       document.body.classList.toggle("error", false)
//     );

//   document
//     .getElementById("loginButton")
//     .addEventListener("click", () => tryLogin());

//   document
//     .getElementById("logoutButton")
//     .addEventListener("click", () => logOut());

// Function executed by the LOGIN button.
const login = async () => {
  const credentials = Realm.Credentials.emailPassword(getUser(), getPass());
  console.log(credentials);
  try {
    const user = await app.logIn(credentials);
    // $() is jQuery syntax for selecting something... empty is a jQuery method too
    $("#userid").empty().append(user.id); // update the user div with the user ID
    $("#emailLogged").empty().append(getUser); // update the email address section with the email address

    // hide login
    document.getElementById("login-page").classList.toggle("hidden", true);
    document.getElementById("user").classList.toggle("hidden", false);
    user_id = user.id;
    mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    coll = mongodb.db("test").collection("todos");
  } catch (err) {
    console.error("Failed to log in", err);
  }
};

// Function executed by the ADD button.
const insert_todo = async () => {
  console.log("INSERT");
  const task = document.getElementById("taskInput").value;
  const userEmail = getUser();
  await coll.insertOne({ task, status: false, owner_id: user_id, userEmail });
  find_todos();
};

const toggle_todo = async () => {
  console.log("TOGGLE");
  const task = document.getElementById("taskInput").value;
  const todo = await coll.findOne({ task, owner_id: user_id });
  await coll.updateOne(
    { _id: todo._id, owner_id: user_id },
    { $set: { status: !todo.status } }
  );
  find_todos();
};

const delete_todo = async () => {
  console.log("DELETE");
  const task = document.getElementById("taskInput").value;
  await coll.deleteOne({ task, owner_id: user_id });
  find_todos();
};

// Function executed by the "FIND" button.
const find_todos = async () => {
  if (mongodb == null || coll == null) {
    $("#userid").empty().append("Need to login first.");
    console.error("Need to log in first", err);
    return;
  }

  // Retrieve todos
  const todos = await coll.find(
    {},
    {
      projection: {
        _id: 0,
        task: 1,
        status: 1
      }
    }
  );

  console.log(todos);

  // Access the todos div and clear it.
  let todos_div = $("#todos");
  todos_div.empty();

  // Loop through the todos and display them in the todos div.
  for (const todo of todos) {
    let p = document.createElement("p");
    p.append(todo.task);
    p.append(" => ");
    p.append(todo.status ? "Done!" : "TODO!");
    todos_div.append(p);
  }
};
