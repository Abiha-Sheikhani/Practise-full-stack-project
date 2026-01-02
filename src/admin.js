import client from "./config.js";

// Check if user is admin
// const { data: { user } } = await client.auth.getUser();
// if (!user) {
//   window.location = "index.html";
// }

// // Get user role
// const { data: adminProfile } = await client
//   .from("users-data")
//   .select("role")
//   .eq("id", user.id)
//   .single();

// if (!adminProfile || adminProfile.role !== "admin") {
//   Swal.fire("Access Denied", "Admins only", "error");
//   setTimeout(() => {
//     window.location = "index.html";
//   }, 1500);
// }
async function checkRole() {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    location.href = "./index.html";
    return;
  }

  //   check role (fetch db)
  const { data, error } = await client
    .from("users-data")
    .select("*")
    .eq("uid", user.id)
    .single();
  if (data.role != "admin") {
    alert("access denied");
    return (location.href = "./index.html");
  }
}

checkRole();

/* ================= STATS ================= */
async function loadStats() {
  // Total users
  const { count: usersCount } = await client
    .from("users-data")
    .select("*", { count: "exact", head: true });

  // Total posts
  const { count: postsCount } = await client
    .from("posts")
    .select("*", { count: "exact", head: true });

  document.getElementById("totalUsers").textContent = usersCount || 0;
  document.getElementById("totalPosts").textContent = postsCount || 0;
}

/* ================= USERS ================= */
async function loadUsers() {
  const { data: users } = await client
    .from("users-data")
    .select("*")
console.log(users);

  const tbody = document.getElementById("usersTable");
  tbody.innerHTML = "";
  
  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
      </tr>
    `;
  });
}

/* ================= POSTS ================= */
async function loadPosts() {
  const { data: posts } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  posts.forEach(post => {
    container.innerHTML += `
      <div class="col-md-6">
        <div class="card post-card shadow-sm mb-4">
          ${post.image_url ? `<img src="${post.image_url}" class="card-img-top">` : ""}
          <div class="card-body">
            <h6 class="fw-bold">${post.title}</h6>
            <p>${post.description}</p>
            <small class="text-muted">By: ${post.name_of_user || "Unknown"}</small>
            <div class="mt-3">
              <button class="btn btn-sm btn-danger delete-post-btn" data-id="${post.id}">
                Delete Post
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Add delete functionality
  document.querySelectorAll(".delete-post-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;
      
      const confirm = await Swal.fire({
        title: "Delete this post?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33"
      });

      if (!confirm.isConfirmed) return;

      // Delete from posts table
      const { error } = await client
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) {
        Swal.fire("Error", error.message, "error");
        return;
      }

      Swal.fire("Deleted", "Post removed", "success");
      loadPosts(); // Refresh posts
      loadStats(); // Update stats
    });
  });
}

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await client.auth.signOut();
  window.location = "index.html";
});

/* ================= INIT ================= */
loadStats();
loadUsers();
loadPosts();