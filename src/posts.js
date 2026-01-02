import client from "./config.js";
let editingPostId = null;
let oldImageUrl = null;

const postBtn = document.getElementById("postBtn");
const postTitle = document.getElementById("postTitle");
const postDesc = document.getElementById("postDesc");
const postImage = document.getElementById("postImage");
const postsContainer = document.getElementById("postsContainer");

// Fetch posts on load
window.addEventListener("DOMContentLoaded", fetchPosts);

// Check authentication
let currentUser = null;
async function checkAuth() {
  const { data: { user } } = await client.auth.getUser();
  console.log(user?.user_metadata?.username);
  
  if (!user) {
    window.location = "index.html";
  }
  
  currentUser = user;
  return user;
}

// Initialize
checkAuth().then(user => {
  if (user) {
    document.getElementById("sidebarUsername").textContent = 
      user.user_metadata.username || user.email;
    
    document.getElementById("sidebarAvatar").textContent =
      (user.user_metadata.username || user.email)[0].toUpperCase();
  }
});

// Add Post
postBtn.addEventListener("click", async () => {
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    window.location = "index.html";
    return;
  }

  const title = postTitle.value.trim();
  const desc = postDesc.value.trim();
  const imageFile = postImage.files[0];

  if (!title || !desc) {
    Swal.fire("Error", "Title and description required!", "error");
    return;
  }

  let imageUrl = null;

  // Upload image if exists
  if (imageFile) {
    const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, "_")}`;
    const { data, error: uploadError } = await client.storage
      .from("posts-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      Swal.fire("Error", uploadError.message, "error");
      return;
    }

    const { data: urlData } = client.storage.from("posts-images").getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  // Insert post
  const { data: postData, error: insertError } = await client
    .from("posts")
    .insert([{ 
      title, 
      description: desc, 
      image_url: imageUrl, 
      uid: user.id, 
      name_of_user: user?.user_metadata?.username || user.email 
    }]);

  if (insertError) {
    Swal.fire("Error", insertError.message, "error");
    return;
  }

  Swal.fire("Success", "Post created!", "success");

  // Clear form
  postTitle.value = "";
  postDesc.value = "";
  postImage.value = "";

  fetchPosts(); // refresh feed
});

// Fetch & Render posts
async function fetchPosts() {
  const { data: posts, error } = await client.from("posts").select("*");

  if (error) return console.error(error.message);

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.classList.add("card", "mb-4", "shadow-sm", "p-3");
    postEl.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center mb-3">
          <div class="avatar rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2" style="width:40px;height:40px;">
            ${post.name_of_user ? post.name_of_user[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h6 class="mb-0">${post.name_of_user || 'Unknown User'}</h6>
            <small class="text-muted">${new Date(post.created_at).toLocaleString()}</small>
          </div>
        </div>
        <h3>${post.title}</h3>
        <p class="card-text">${post.description}</p>
        ${post.image_url ? `<img src="${post.image_url}" class="img-fluid rounded mb-3" />` : ""}

        <!-- Likes and Comments Section -->
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div>
            <button class="btn btn-sm btn-outline-primary like-btn" data-id="${post.id}">👍 Like (<span class="like-count">0</span>)</button>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary comment-toggle-btn" data-id="${post.id}">💬 Comments</button>
          </div>
        </div>

        <!-- Comment Form (hidden initially) -->
        <div class="comment-section mt-2" style="display:none;">
          <input type="text" class="form-control mb-2 comment-input" placeholder="Write a comment...">
          <button class="btn btn-sm btn-primary comment-submit-btn mb-2" data-id="${post.id}">Post Comment</button>
          <div class="comment-list"></div>
        </div>
      </div>
    `;
    postsContainer.appendChild(postEl);
  });
}

// Likes & Comments functionality
postsContainer.addEventListener("click", async (e) => {
  // Like button
  if (e.target.classList.contains("like-btn")) {
    const postId = e.target.dataset.id;
    const countEl = e.target.querySelector(".like-count");
    countEl.textContent = parseInt(countEl.textContent) + 1;
  }

  // Toggle comment section
  if (e.target.classList.contains("comment-toggle-btn")) {
    const postCard = e.target.closest(".card-body");
    const commentSection = postCard.querySelector(".comment-section");
    commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
  }

  // Submit comment
  if (e.target.classList.contains("comment-submit-btn")) {
    const postCard = e.target.closest(".card-body");
    const input = postCard.querySelector(".comment-input");
    const commentText = input.value.trim();
    if (!commentText) return;

    const commentList = postCard.querySelector(".comment-list");
    const commentEl = document.createElement("div");
    commentEl.classList.add("border-top", "p-1");
    commentEl.textContent = commentText;
    commentList.appendChild(commentEl);
    input.value = "";
  }
});

// Profile functionality
const openProfile = document.getElementById("openProfile");
const closeProfile = document.getElementById("closeProfile");
const profilePanel = document.getElementById("profilePanel");

openProfile.addEventListener("click", async () => {
  profilePanel.classList.add("active");
  await loadProfile();
});

closeProfile.addEventListener("click", () => {
  profilePanel.classList.remove("active");
});

// Load profile data
async function loadProfile() {
  const { data: { user } } = await client.auth.getUser();

  document.getElementById("profileName").textContent =
    user.user_metadata.username || user.email;

  document.getElementById("profileEmail").textContent = user.email;

  loadMyPosts(user.id);
}

// Load user's posts
async function loadMyPosts(uid) {
  const container = document.getElementById("myPosts");
  container.innerHTML = "";

  const { data: posts, error } = await client
    .from("posts")
    .select("*")
    .eq("uid", uid)
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = "Error loading posts";
    return;
  }

  if (posts.length === 0) {
    container.innerHTML = "<small>No posts yet</small>";
    return;
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "card mb-3 shadow-sm p-3";

    div.innerHTML = `
      <div class="d-flex align-items-center mb-2">
        <div class="avatar" style="width:30px;height:30px;border-radius:50%;background:#007bff;color:white;display:flex;align-items:center;justify-content:center;">
          ${post.name_of_user ? post.name_of_user[0].toUpperCase() : 'U'}
        </div>
        <div class="ms-2">
          <strong>${post.name_of_user || 'Unknown User'}</strong><br/>
          <small class="text-muted">
            ${new Date(post.created_at).toLocaleString()}
          </small>
        </div>
      </div>

      <h6 class="fw-bold">${post.title}</h6>
      <p class="mb-2">${post.description}</p>

      ${
        post.image_url
          ? `<img src="${post.image_url}" class="img-fluid rounded mb-2"/>`
          : ""
      }
      <div class="d-flex gap-2 mt-2">
        <button class="btn btn-sm btn-outline-warning edit-post" data-id="${post.id}">
          Edit
        </button>
        <button class="btn btn-sm btn-outline-danger delete-post" data-id="${post.id}">
          Delete
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

// Scroll to profile section
document.getElementById("openProfile")?.addEventListener("click", () => {
  const profileSection = document.getElementById("profileSection");
  if (profileSection) {
    profileSection.scrollIntoView({
      behavior: "smooth",
    });
  }
});

// Logout functionality
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    Swal.fire("Error", error.message, "error");
    return;
  }

  Swal.fire({
    title: "Logged out",
    icon: "success",
    timer: 1200,
    showConfirmButton: false,
  });

  setTimeout(() => {
    window.location = "index.html";
  }, 1200);
});

// Edit and delete functionality
document.getElementById("myPosts").addEventListener("click", async (e) => {
  const postId = e.target.dataset.id;

  // DELETE
  if (e.target.classList.contains("delete-post")) {
    const confirm = await Swal.fire({
      title: "Delete post?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    const { error } = await client
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }

    Swal.fire("Deleted", "Post removed", "success");
    
    const { data: { user } } = await client.auth.getUser();
    loadMyPosts(user.id);
    fetchPosts();
  }

  // EDIT
  if (e.target.classList.contains("edit-post")) {
    editingPostId = e.target.dataset.id;

    const { data, error } = await client
      .from("posts")
      .select("*")
      .eq("id", editingPostId)
      .single();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }

    document.getElementById("editTitle").value = data.title;
    document.getElementById("editDesc").value = data.description;

    oldImageUrl = data.image_url;

    if (data.image_url) {
      const preview = document.getElementById("editPreview");
      preview.src = data.image_url;
      preview.classList.remove("d-none");
    }

    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById("editPostModal"));
    editModal.show();
  }
});

// Edit image preview
document.getElementById("editImage")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById("editPreview");
  preview.src = URL.createObjectURL(file);
  preview.classList.remove("d-none");
});

// Save edit
document.getElementById("saveEditBtn")?.addEventListener("click", async () => {
  const title = document.getElementById("editTitle").value.trim();
  const desc = document.getElementById("editDesc").value.trim();
  const imageFile = document.getElementById("editImage").files[0];

  if (!title || !desc) {
    Swal.fire("Error", "Title and description required", "error");
    return;
  }

  let imageUrl = oldImageUrl;

  // Upload new image if selected
  if (imageFile) {
    const fileName = `${Date.now()}_${imageFile.name}`;

    const { error: uploadError } = await client.storage
      .from("posts-images")
      .upload(fileName, imageFile);

    if (uploadError) {
      Swal.fire("Error", uploadError.message, "error");
      return;
    }

    const { data } = client.storage
      .from("posts-images")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await client
    .from("posts")
    .update({
      title,
      description: desc,
      image_url: imageUrl,
    })
    .eq("id", editingPostId);

  if (error) {
    Swal.fire("Error", error.message, "error");
    return;
  }

  Swal.fire("Updated", "Post updated successfully", "success");

  const { data: { user } } = await client.auth.getUser();
  loadMyPosts(user.id);
  fetchPosts();

  // Hide modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("editPostModal"));
  if (modal) {
    modal.hide();
  }
});