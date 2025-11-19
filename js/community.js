// community.js

//  Get the logged-in username from sessionStorage
const storedName = sessionStorage.getItem("username");

// Fallback if nothing in storage yet
const currentUserName =
  storedName && storedName.trim() !== "" ? storedName.trim() : "AdminUser";

// Always show it with an @ in the UI
const currentUserDisplay = currentUserName.startsWith("@")
  ? currentUserName
  : "@" + currentUserName;

// ---- Helper: add Admin badge next to username ----
function addAdminBadge(usernameSpan) {
  const header = usernameSpan.parentElement;
  if (!header || header.querySelector(".post-badge-admin")) return;

  const badge = document.createElement("span");
  badge.className = "post-badge-admin";
  badge.textContent = "Admin";
  header.appendChild(badge);
}

// ---- Helper: create a post element (used for new posts) ----
function createPostElement({ username, title, caption, mediaUrl, mediaAlt }) {
  const article = document.createElement("article");
  article.className = "post";

  const isMine = username === currentUserDisplay;
  article.dataset.owner = isMine ? "me" : "other";

  if (!mediaUrl) {
    article.classList.add("no-media");
  }

  // HEADER
  const header = document.createElement("div");
  header.className = "post-header";

  const usernameSpan = document.createElement("span");
  usernameSpan.className = "post-username";
  usernameSpan.textContent = username;
  header.appendChild(usernameSpan);

  if (isMine) addAdminBadge(usernameSpan);
  article.appendChild(header);

  // MEDIA (image only for now)
  if (mediaUrl) {
    const img = document.createElement("img");
    img.src = mediaUrl;
    img.alt = mediaAlt || "User post image";
    article.appendChild(img);
  }

  // CONTENT
  const contentDiv = document.createElement("div");
  contentDiv.className = "content";

  const h2 = document.createElement("h2");
  h2.textContent = title;
  contentDiv.appendChild(h2);

  if (caption) {
    const cap = document.createElement("div");
    cap.className = "caption";

    const h3 = document.createElement("h3");
    h3.textContent = caption;

    cap.appendChild(h3);
    contentDiv.appendChild(cap);
  }

  // ACTION BUTTONS
  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("button");
  likeBtn.className = "like";
  likeBtn.textContent = "❤️ 0"; // keep same format as existing posts

  const viewsBtn = document.createElement("button");
  viewsBtn.className = "views";
  viewsBtn.textContent = "👁️ 0";

  actions.append(likeBtn, viewsBtn);
  contentDiv.appendChild(actions);

  // DELETE BUTTON (ONLY MY POSTS)
  if (isMine) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-post";
    delBtn.setAttribute("aria-label", "Delete post");
    delBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
    contentDiv.appendChild(delBtn);
  }

  article.appendChild(contentDiv);

  return article;
}

// ---- Feed filtering: All Posts / My Posts ----
function setFeedMode(mode) {
  const posts = document.querySelectorAll("#feed .post");

  posts.forEach((post) => {
    if (mode === "all") {
      post.classList.remove("hidden");
    } else {
      if (post.dataset.owner === "me") {
        post.classList.remove("hidden");
      } else {
        post.classList.add("hidden");
      }
    }
  });

  const tabButtons = document.querySelectorAll(".tab-btn");
  if (tabButtons.length >= 2) {
    const [allBtn, myBtn] = tabButtons;
    if (mode === "all") {
      allBtn.setAttribute("aria-pressed", "true");
      myBtn.setAttribute("aria-pressed", "false");
    } else {
      allBtn.setAttribute("aria-pressed", "false");
      myBtn.setAttribute("aria-pressed", "true");
    }
  }
}

// ---- Tag existing posts on load & add Admin badge to mine ----
document.addEventListener("DOMContentLoaded", () => {
  const posts = document.querySelectorAll("#feed .post");

  posts.forEach((post) => {
    const usernameSpan = post.querySelector(".post-username");
    if (!usernameSpan) return;

    const nameText = usernameSpan.textContent.trim();
    const isMine = nameText === currentUserDisplay;

    post.dataset.owner = isMine ? "me" : "other";

    if (isMine) {
      addAdminBadge(usernameSpan);
    }
  });

  setFeedMode("all");
});

// ---- Modal / Create Post / Likes / Auto-open flag ----
(function () {
  const feed = document.getElementById("feed");
  const modal = document.getElementById("newPostModal");

  // If this page doesn't have feed/modal (e.g., other pages), skip popup wiring
  if (!feed || !modal) return;

  const overlay = modal.querySelector(".modal__overlay");
  const closeBtn = modal.querySelector(".modal__close");
  const cancelBtn = document.getElementById("np-cancel");
  const submitBtn = document.getElementById("np-submit");

  const fileInput = document.getElementById("np-file");
  const preview = document.getElementById("np-preview");
  const filename = document.getElementById("np-filename");
  const titleInput = document.getElementById("np-title-input");
  const captionInput = document.getElementById("np-caption");

  // ---- Modal open/close helpers ----
  function openCreateModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => titleInput.focus(), 0);
    document.addEventListener("keydown", escClose);
  }

  function closeCreateModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", escClose);
  }

  function escClose(e) {
    if (e.key === "Escape") {
      closeCreateModal();
    }
  }

  // Expose for FAB onclick
  window.openCreateModal = openCreateModal;

  // ---- Close behavior ----
  overlay.addEventListener("click", closeCreateModal);
  closeBtn.addEventListener("click", closeCreateModal);
  cancelBtn.addEventListener("click", closeCreateModal);

  // ---- Media preview (optional) ----
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];

    preview.style.backgroundImage = "";
    preview.classList.remove("has-media");
    filename.textContent = "";
    if (preview.dataset.blobUrl) {
      URL.revokeObjectURL(preview.dataset.blobUrl);
      delete preview.dataset.blobUrl;
    }

    if (!file) return;

    filename.textContent = file.name;

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      preview.style.backgroundImage = `url("${url}")`;
      preview.classList.add("has-media");
      preview.dataset.blobUrl = url;
    }
  });

  // ---- Create & prepend a post ----
  submitBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const caption = captionInput.value.trim();
    const file = fileInput.files?.[0] || null;

    if (!title) {
      titleInput.focus();
      return;
    }

    let mediaUrl = "";
    let mediaAlt = "";

    if (file && file.type.startsWith("image/")) {
      mediaUrl = preview.dataset.blobUrl || URL.createObjectURL(file);
      mediaAlt = file.name;
    }

    const post = createPostElement({
      username: currentUserDisplay,
      title,
      caption,
      mediaUrl,
      mediaAlt,
    });

    feed.prepend(post);

    // Reset modal state
    if (preview.dataset.blobUrl) {
      URL.revokeObjectURL(preview.dataset.blobUrl);
      delete preview.dataset.blobUrl;
    }
    fileInput.value = "";
    titleInput.value = "";
    captionInput.value = "";
    filename.textContent = "";
    preview.style.backgroundImage = "";
    preview.classList.remove("has-media");

    closeCreateModal();
  });

  // LIKE / UNLIKE logic (works for existing + new posts)
  feed.addEventListener("click", (e) => {
    const btn = e.target.closest(".like");
    if (!btn) return;

    const text = btn.textContent.trim(); // "❤️ 12"
    const parts = text.split(" ");
    let count = parseInt(parts[1], 10);
    if (Number.isNaN(count)) count = 0;

    if (btn.classList.contains("liked")) {
      // UNLIKE
      btn.classList.remove("liked");
      btn.textContent = `❤️ ${Math.max(0, count - 1)}`;
    } else {
      // LIKE
      btn.classList.add("liked");
      btn.textContent = `❤️ ${count + 1}`;
    }
  });

  // ---- Auto-open if we came here via "Create a Post" ----
  const makeAPostFlag = sessionStorage.getItem("makeAPostFlag");
  if (makeAPostFlag === "true") {
    sessionStorage.removeItem("makeAPostFlag");
    openCreateModal();
  }
})();

// ---- DELETE POST FUNCTIONALITY (only posts with delete button → your posts) ----
document.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".delete-post");
  if (!deleteBtn) return;

  const postElement = deleteBtn.closest(".post");
  if (!postElement) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this post?"
  );

  if (confirmDelete) {
    postElement.remove();
  }
});

// ---- Navbar navigation logic (runs on any page) ----
function wireNavButton(id, target, extra) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof extra === "function") extra();
    window.location.href = target;
  });
}

// Normal nav
wireNavButton("mealTrackingBtn", "mealTracking.html");
wireNavButton("trackAWorkoutBtn", "workout.html");
wireNavButton("communityPageBtn", "community.html");
wireNavButton("dashboardBtn", "dashboard.html");

// Special: Create a Post → set flag then go to community
wireNavButton("createAPostBtn", "community.html", () => {
  sessionStorage.setItem("makeAPostFlag", "true");
});

// ---- Tab button click handlers (All Posts / My Posts) ----
const tabButtons = document.querySelectorAll(".tab-btn");
if (tabButtons.length >= 2) {
  tabButtons[0].addEventListener("click", () => setFeedMode("all"));
  tabButtons[1].addEventListener("click", () => setFeedMode("mine"));
}
