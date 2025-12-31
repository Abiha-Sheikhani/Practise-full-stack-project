import client from "./config.js";

const postBtn = document.getElementById("postBtn");
const postTitle = document.getElementById("postTitle");
const postDesc = document.getElementById("postDesc");
const postImage = document.getElementById("postImage");
const postsContainer = document.getElementById("postsContainer");

// Fetch posts on load
window.addEventListener("DOMContentLoaded", fetchPosts);
const { data: { user } } = await client.auth.getUser()
console.log(user?.user_metadata?.username );
if(!user){
  window.location = "index.html"
}

// Add Post
postBtn.addEventListener("click", async () => {
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
    .insert([{ title, description: desc, image_url: imageUrl , uid : user.id , name_of_user: user?.user_metadata?.username }]);

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
            ${post.name_of_user[0].toUpperCase()}
          </div>
          <div>
            <h6 class="mb-0">${post.name_of_user}</h6>
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

    // Here you can insert into a 'likes' table for full functionality
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
    const postId = e.target.dataset.id;
    const postCard = e.target.closest(".card-body");
    const input = postCard.querySelector(".comment-input");
    const commentText = input.value.trim();
    if (!commentText) return;

    // Here you can insert into a 'comments' table for full functionality
    const commentList = postCard.querySelector(".comment-list");
    const commentEl = document.createElement("div");
    commentEl.classList.add("border-top", "p-1");
    commentEl.textContent = commentText;
    commentList.appendChild(commentEl);
    input.value = "";
  }
});


// in thissss we are doinggg user  alll profilee functionalityyyyyyyy 