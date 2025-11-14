// community.js
(function () {
  const feed = document.getElementById("feed");
  const modal = document.getElementById("newPostModal");

  // If this page doesn't have feed/modal (e.g., dashboard/workout), skip popup wiring
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

    // TODO: later, replace with real logged-in username
    const currentUsername = "AdminUser";

    // Outer post element
    const article = document.createElement("article");
    article.className = "post";
    article.dataset.username = currentUsername;

    // 👇 NEW: mark posts with no media
    if (!file) {
      article.classList.add("no-media");
    }

    // ----- Username header bar -----
    const header = document.createElement("div");
    header.className = "post-header";

    const usernameSpan = document.createElement("span");
    usernameSpan.className = "post-username";
    usernameSpan.textContent = `@${currentUsername}`;

    header.appendChild(usernameSpan);
    article.appendChild(header);

    // ----- Optional media (image / video) -----
    if (file) {
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = preview.dataset.blobUrl || URL.createObjectURL(file);
        img.alt = "User post image";
        article.appendChild(img);
      } else if (file.type.startsWith("video/")) {
        const vid = document.createElement("video");
        vid.controls = true;
        vid.src = URL.createObjectURL(file);
        article.appendChild(vid);
      }
    }

    // ----- Right-side content (title, caption, actions) -----
    const content = document.createElement("div");
    content.className = "content";

    const h2 = document.createElement("h2");
    h2.textContent = title;

    const captionDiv = document.createElement("div");
    captionDiv.className = "caption";
    if (caption) {
      const h3 = document.createElement("h3");
      h3.textContent = caption;
      captionDiv.appendChild(h3);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "like";
    likeBtn.textContent = "❤️ 0";

    const views = document.createElement("button");
    views.className = "views";
    views.textContent = "👁️ 0";

    actions.append(likeBtn, views);

    content.append(h2, captionDiv, actions);
    article.appendChild(content);

    // ----- Add NEW post at the TOP of the feed -----
    feed.prepend(article);

    // ----- Reset modal state -----
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

  // LIKE / UNLIKE logic
  feed.addEventListener("click", (e) => {
    const btn = e.target.closest(".like");
    if (!btn) return;

    // Extract number: "❤️ 12" → 12
    const text = btn.textContent.trim();
    const parts = text.split(" ");
    const count = parseInt(parts[1], 10);

    if (btn.classList.contains("liked")) {
      // UNLIKE
      btn.classList.remove("liked");
      btn.textContent = `❤️ ${count - 1}`;
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

// ---- Navbar navigation logic (runs on any page) ----
function wireNavButton(id, target, extra) {
  const el = document.getElementById(id);
  if (!el) return; // page might not have this ID

  el.addEventListener("click", (e) => {
    e.preventDefault(); // stop default <a> navigation
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

const tabButtons = document.querySelectorAll(".tab-btn");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // clear previous selection
    tabButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));

    // mark this one as selected
    btn.setAttribute("aria-pressed", "true");
  });
});
