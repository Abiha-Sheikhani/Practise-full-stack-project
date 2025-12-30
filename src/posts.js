import client from "./config.js";

const postBtn = document.getElementById("postBtn");
const postTitle = document.getElementById("postTitle");
const postDesc = document.getElementById("postDesc");
const postImage = document.getElementById("postImage");
const postsContainer = document.getElementById("postsContainer");

// Fetch posts on load
window.addEventListener("DOMContentLoaded", fetchPosts);

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
    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data, error: uploadError } = await client.storage
      .from("posts-images") // bucket name
      .upload(fileName, imageFile);

    if (uploadError) {
      Swal.fire("Error", uploadError.message, "error");
      return;
    }

    // Get public URL
    const { publicUrl } = client.storage.from("posts-images").getPublicUrl(fileName);
    imageUrl = publicUrl;
  }

  // Insert post
  const { data: postData, error: insertError } = await client
    .from("posts")
    .insert([{ title, description: desc, image_url: imageUrl, status: "approved", created_at: new Date() }]);

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
  const { data: posts, error } = await client
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return console.error(error.message);

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.classList.add("card", "mb-3");
    postEl.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${post.description}</p>
        ${post.image_url ? `<img src="${post.image_url}" class="img-fluid mb-2" />` : ""}
        <small class="text-muted">Posted at: ${new Date(post.created_at).toLocaleString()}</small>
      </div>
    `;
    postsContainer.appendChild(postEl);
  });
}
