import client from "./config.js";

// signup functionalityy

const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");

const btn = document.getElementById("btn");
btn &&
  btn.addEventListener("click", async () => {
    try {
      if (!username.value || !email.value || !password.value) {
        alert("Plaease enter All Fields!");
      } else {
        const { data, error : authError
         } = await client.auth.signUp({
          email: email.value,
          password: password.value,
          options: {
            data: {
              username: username.value,
            },
            
          },
        });
   

        if (data) {
          console.log(data.user.user_metadata);
          
          userinfo = data.user.user_metadata;
          let { username, email } = userinfo;

          const { error } = await client
            .from("users-data")
            .insert({ name: username, email: email, role:'user' });

          if (error) {
            console.log("USER DATA ERROR", error);
          } else {
            Swal.fire({
              title: "Successfully Signup!\n Redirecting to Login Page",
              icon: "success",
              draggable: true,
              timer: 2000,
            });
          }
        }

        if (data) {
          console.log(data);

          Swal.fire({
            title: "Successfully Signup!\n Redirecting to Login Page",
            icon: "success",
            draggable: true,
            timer: 2000,
          });

          // setTimeout(() => {

          window.location.href = "login.html";
          // }, 2000)
        

  
    
        } 
      }
    } catch (error) {
      console.log(error);
    }

    
  });

//loginn functionalityyy

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

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

    // Admin check
    if (loginEmail.value === "abihajawed@gmail.com" && loginPassword.value === "abiha1234") {
      Swal.fire({
        title: "Successfully Logged in!\nWelcome Admin!",
        icon: "success",
        draggable: true,
        timer: 2000,
      });

      setTimeout(() => {
        window.location.href = "adminPage.html";
      }, 2000);

    } else {
      Swal.fire({
        title: "Successfully Logged in!\nRedirecting to post Page",
        icon: "success",
        draggable: true,
        timer: 2000,
      });

      setTimeout(() => {
        window.location.href = "create.html";
      }, 2000);
    }

    console.log(data);

  } catch (error) {
    console.log(error);
  }
});


