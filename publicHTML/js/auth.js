// //  alert("hello");
//  const loginForm = document.getElementById("loginForm");
//  loginForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     const response = fetch(
//         "http://localhost:2000/auth/login",
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "accept": "/"
               
//             },
//             body: JSON.stringify({ email, password })
//         }
//     );

//     const data = await response.json();
    

//     console.log(data);
// });