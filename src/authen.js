import client from "./config.js";


// designinggggg codeeeeeeeeeee
 const signinForm = document.querySelector(".form.signin");
const signupForm = document.querySelector(".form.signup");
const cardBg1 = document.querySelector(".card-bg-1");
const cardBg2 = document.querySelector(".card-bg-2");

const toggleView = () => {
  const signinActive = signinForm.classList.contains("active");

  signinForm.classList.toggle("active", !signinActive);
  signupForm.classList.toggle("active", signinActive);

  [cardBg1, cardBg2].forEach((el) =>
    el.classList.toggle("signin", signinActive)
  );
  [cardBg1, cardBg2].forEach((el) =>
    el.classList.toggle("signup", !signinActive)
  );
};


// sign up codee --------------------------------

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const btn = document.getElementById("btn");

btn &&
  btn.addEventListener("click", async () => {
    try {
      if (!username.value || !email.value || !password.value) {
   Swal.fire({
        title: `please enter all fields!`,
        icon: "error",
        timer: 2000,
      });
        return;
      }

      const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: username.value,
          },
        },
      });

      if (error) {
        console.error(error.message);
        Swal.fire({
        title: `${error.message}`,
        icon: "error",
        timer: 2000,
      });
        return;
      }
else{
  console.log(data);
  
   console.log(data.user.user_metadata);

      Swal.fire({
        title: "Successfully Signed Up!\nRedirecting to Login Page",
        icon: "success",
        timer: 2000,
      });
     setTimeout(() => {
  toggleView();
}, 2000);

}
     
    } catch (err) {
      console.error(err);
    }
  });

//loginn functionalityyy

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
console.log(loginEmail,loginPassword);

loginBtn &&
  loginBtn.addEventListener("click", async () => {
    try {
      if (!loginEmail.value || !loginPassword.value) {
        alert("Please enter all fields!");
        return; // Stop further execution
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value,
      });

      if (error) {
        alert("Login failed!");
        console.log(error.message);
        return;
      }
 else {
        Swal.fire({
          title: "Successfully Logged in!\nRedirecting to post Page",
          icon: "success",
          draggable: true,
          timer: 2000,
        });
     window.location = "./post.html"
     console.log(data);
     
      }

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  });
