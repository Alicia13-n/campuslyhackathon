// =========================================================
// STORAGE HELPERS & INITIAL DATA
// =========================================================

const STORAGE_KEYS = {
  posts: "campuslyPosts",
  messages: "campuslyMessages",
  profile: "campuslyProfile",
  notifications: "campuslyNotifications"
};

const DEFAULT_POSTS = [
  {
    id: "post-alicia-1",
    author: "Alicia Nair",
    initials: "A",
    avatar: "images/alicia.png",
    avatarClass: "",
    course: "Computer Science",
    time: "3h ago",
    timestamp: Date.now() - 3 * 3600 * 1000,
    category: "Clubs",
    following: true,
    text: "The coding club workshop today was actually fire! 🔥\nLearnt so much about web dev and met some really cool people.\n\nShoutout to everyone who came!",
    customCardsHtml:
      '<div class="pics">' +
        '<div class="post-image image-one"><span>BUILD<small>CREATE · BELONG</small></span></div>' +
        '<div class="post-image image-two"><span>Good Developers<small>Better People</small></span></div>' +
      '</div>',
    photoUrl: "",
    poll: null,
    event: null,
    likes: 128,
    liked: false,
    comments: 12,
    saved: false
  },
  {
    id: "post-rahul-1",
    author: "Rahul Mehta",
    initials: "R",
    avatar: "images/rahul.png",
    avatarClass: "rahul",
    course: "Mechanical Engineering",
    time: "5h ago",
    timestamp: Date.now() - 5 * 3600 * 1000,
    category: "Academic",
    following: true,
    text: "Anyone know when the midsem results are supposed to be out?\nThe portal still says “Processing” 😭",
    customCardsHtml: "",
    photoUrl: "",
    poll: null,
    event: null,
    likes: 48,
    liked: false,
    comments: 23,
    saved: false
  }
];

const DEFAULT_CONVERSATIONS = [
  {
    name: "Alicia Nair",
    avatar: "images/alicia.png",
    initials: "A",
    time: "2m",
    preview: "Are you going to the club meeting today?",
    unread: 2,
    status: "Online now",
    messages: [
      { from: "them", text: "Hey! Are you going to the club meeting today?", time: "2:41 PM" },
      { from: "me", text: "Yeah, probably. You?", time: "2:43 PM" },
      { from: "them", text: "Definitely 😂 I heard they are showing some new projects.", time: "2:44 PM" }
    ]
  },
  {
    name: "Rahul Mehta",
    avatar: "images/rahul.png",
    initials: "R",
    time: "18m",
    preview: "Bro, did you check the results portal?",
    unread: 1,
    status: "Active 8m ago",
    messages: [
      { from: "them", text: "Bro, did you check the results portal?", time: "2:25 PM" },
      { from: "me", text: "Not yet 😭 still processing on my side.", time: "2:28 PM" }
    ]
  },
  {
    name: "Priya Menon",
    initials: "P",
    time: "1h",
    preview: "Can you send me the notes from class?",
    unread: 0,
    status: "Active 32m ago",
    messages: [
      { from: "them", text: "Can you send me the notes from class?", time: "1:39 PM" },
      { from: "me", text: "Sure, I'll send them after I organise the pages.", time: "1:42 PM" }
    ]
  },
  {
    name: "Arjun Iyer",
    initials: "A",
    time: "Yesterday",
    preview: "Good luck with the project!",
    unread: 0,
    status: "Active yesterday",
    messages: [
      { from: "them", text: "Good luck with the project!", time: "Yesterday" },
      { from: "me", text: "Thanks bro 🙌", time: "Yesterday" }
    ]
  },
  {
    name: "Sneha Kapoor",
    initials: "S",
    time: "Yesterday",
    preview: "Are you joining the photography event?",
    unread: 0,
    status: "Active yesterday",
    messages: [
      { from: "them", text: "Are you joining the photography event?", time: "Yesterday" }
    ]
  }
];

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}

function formatMultilineText(text) {
  return escapeHTML(text).replace(/\n/g, "<br>");
}

function loadPosts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || "null");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Could not parse saved posts:", err);
  }
  return DEFAULT_POSTS.map(function (item) {
    return Object.assign({}, item);
  });
}

let postsData = loadPosts();

function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(postsData));
  } catch (err) {
    // Fallback if a large data-URL image hits localStorage quota limits
    const lightweight = postsData.map(function (post) {
      if (post.photoUrl && post.photoUrl.startsWith("data:")) {
        return Object.assign({}, post, { photoUrl: "" });
      }
      return post;
    });
    try {
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(lightweight));
    } catch (innerErr) {
      console.warn("Unable to persist posts to localStorage:", innerErr);
    }
  }
}

function getSavedProfile() {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || "null") || {
        name: "Bandile Dlamini",
        course: "Computer Science",
        bio: "Computer Science student • Building Campusly • Always learning."
      }
    );
  } catch (err) {
    return {
      name: "Bandile Dlamini",
      course: "Computer Science",
      bio: "Computer Science student • Building Campusly • Always learning."
    };
  }
}

function getCurrentFirstName() {
  const fullName = getSavedProfile().name || "Bandile Dlamini";
  return fullName.trim().split(/\s+/)[0] || "Bandile";
}

function syncCurrentUserUI() {
  const profile = getSavedProfile();
  const firstName = getCurrentFirstName();
  const initial = (firstName[0] || "B").toUpperCase();

  document.querySelectorAll(".avatar.me").forEach(function (el) {
    if (!el.querySelector("img")) {
      el.textContent = initial;
    }
  });

  const topUser = document.querySelector(".top .user");
  if (topUser) {
    Array.from(topUser.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        node.textContent = " " + firstName + " ";
      }
    });
  }

  const postInput = document.getElementById("postInput");
  if (postInput) {
    postInput.placeholder = "What's on your mind, " + firstName + "?";
  }

  if (profile && profile.name && !postInput) {
    // Keep profile in scope for future profile UI syncs
  }
}


// =========================================================
// AUTHENTICATION
// =========================================================

const authScreen = document.getElementById("authScreen");
const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

if (showRegister) {
  showRegister.addEventListener("click", function () {
    if (loginCard) loginCard.classList.add("hidden");
    if (registerCard) registerCard.classList.remove("hidden");
  });
}

if (showLogin) {
  showLogin.addEventListener("click", function () {
    if (registerCard) registerCard.classList.add("hidden");
    if (loginCard) loginCard.classList.remove("hidden");
  });
}


// =========================================================
// DEMO ACCOUNT
// =========================================================

const demoBtn = document.getElementById("demoBtn");

if (demoBtn) {
  demoBtn.addEventListener("click", function () {
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const error = document.getElementById("loginError");

    if (email) email.value = "demo@campusly.com";
    if (password) password.value = "campusly123";
    if (error) error.textContent = "";
    if (authScreen) authScreen.style.display = "none";
  });
}


// =========================================================
// LOGIN VALIDATION
// =========================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const error = document.getElementById("loginError");

    if (!email || !password || !email.value.trim() || !password.value.trim()) {
      if (error) error.textContent = "Fill details first!";
      return;
    }

    if (error) error.textContent = "";
    if (authScreen) authScreen.style.display = "none";
  });
}


// =========================================================
// REGISTER VALIDATION
// =========================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("regName");
    const course = document.getElementById("regCourse");
    const email = document.getElementById("regEmail");
    const password = document.getElementById("regPassword");
    const confirm = document.getElementById("regConfirm");
    const terms = document.getElementById("terms");
    const error = document.getElementById("registerError");

    if (!name || !course || !email || !password || !confirm) return;

    if (
      !name.value.trim() ||
      !course.value.trim() ||
      !email.value.trim() ||
      !password.value.trim() ||
      !confirm.value.trim()
    ) {
      if (error) error.textContent = "Please fill in all details.";
      return;
    }

    if (password.value.length < 6) {
      if (error) error.textContent = "Password must be at least 6 characters.";
      return;
    }

    if (password.value !== confirm.value) {
      if (error) error.textContent = "Passwords do not match.";
      return;
    }

    if (terms && !terms.checked) {
      if (error) error.textContent = "Please accept the community guidelines.";
      return;
    }

    const existing = getSavedProfile();
    localStorage.setItem(
      STORAGE_KEYS.profile,
      JSON.stringify({
        name: name.value.trim(),
        course: course.value.trim(),
        bio: existing.bio
      })
    );
    syncCurrentUserUI();

    if (error) error.textContent = "";
    if (authScreen) authScreen.style.display = "none";
  });
}


// =========================================================
// FORGOT PASSWORD & SHOW / HIDE PASSWORD & LOGOUT
// =========================================================

const forgotBtn = document.getElementById("forgotBtn");
if (forgotBtn) {
  forgotBtn.addEventListener("click", function () {
    alert("Password reset link would be sent to your email.");
  });
}

document.querySelectorAll(".show-pass").forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.dataset.target;
    const target = document.getElementById(targetId);
    if (!target) return;

    if (target.type === "password") {
      target.type = "text";
      button.textContent = "Hide";
    } else {
      target.type = "password";
      button.textContent = "Show";
    }
  });
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    if (authScreen) authScreen.style.display = "";
    if (loginCard) loginCard.classList.remove("hidden");
    if (registerCard) registerCard.classList.add("hidden");
  });
}


// =========================================================
// UNIFIED POST FILTERING (SEARCH + TABS + CATEGORY + SAVED)
// =========================================================

const filterState = {
  search: "",
  tab: "For You",
  category: "All Posts",
  savedOnly: false
};

const postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("filter");
const tabButtons = Array.from(document.querySelectorAll(".tab"));

function applyPostFilters() {
  if (!postsContainer) return;

  const query = filterState.search.toLowerCase().trim();
  const postEls = Array.from(postsContainer.querySelectorAll(".post"));

  const orderedEls =
    filterState.tab === "Latest"
      ? postEls.slice().sort(function (a, b) {
          return (Number(b.dataset.ts) || 0) - (Number(a.dataset.ts) || 0);
        })
      : postEls.slice().sort(function (a, b) {
          return (Number(a.dataset.order) || 0) - (Number(b.dataset.order) || 0);
        });

  orderedEls.forEach(function (el) {
    postsContainer.appendChild(el);
  });

  let visibleCount = 0;

  orderedEls.forEach(function (postEl) {
    const postCat = postEl.dataset.cat || "Academic";
    const isFollowing = postEl.dataset.following === "true";
    const isSaved = postEl.dataset.saved === "true";
    const textContent = postEl.textContent.toLowerCase();

    const matchesSearch = !query || textContent.includes(query);
    const matchesCategory =
      filterState.category === "All Posts" || postCat === filterState.category;
    const matchesTab = filterState.tab !== "Following" || isFollowing;
    const matchesSaved = !filterState.savedOnly || isSaved;

    const isHiddenByModerator = postEl.dataset.moderation === "hidden";
    const shouldShow = matchesSearch && matchesCategory && matchesTab && matchesSaved && !isHiddenByModerator;
    postEl.style.display = shouldShow ? "" : "none";
    if (shouldShow) visibleCount++;
  });

  let emptyEl = postsContainer.querySelector(".empty-feed-state");
  if (visibleCount === 0) {
    if (!emptyEl) {
      emptyEl = document.createElement("div");
      emptyEl.className = "panel empty-feed-state";
      emptyEl.style.textAlign = "center";
      emptyEl.style.padding = "32px 20px";
      emptyEl.style.color = "#9da8bd";
      postsContainer.appendChild(emptyEl);
    }
    emptyEl.textContent = filterState.savedOnly
      ? "No saved posts match your current filter."
      : "No posts match your search or filter.";
  } else if (emptyEl) {
    emptyEl.remove();
  }
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    filterState.search = searchInput.value;
    applyPostFilters();
  });
}

document.addEventListener("keydown", function (event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    if (searchInput) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  }
});

tabButtons.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabButtons.forEach(function (t) {
      t.classList.remove("active");
    });
    tab.classList.add("active");
    filterState.tab = tab.textContent.trim();
    if (filterState.tab !== "For You") {
      filterState.savedOnly = false;
    }
    applyPostFilters();
  });
});

if (categorySelect) {
  categorySelect.addEventListener("change", function () {
    filterState.category = categorySelect.value;
    applyPostFilters();
  });
}


// =========================================================
// POST COMPOSER (TEXT + PHOTO + POLL + EVENT)
// =========================================================

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const photoBtn = document.getElementById("photoBtn");
const photoInput = document.getElementById("photoInput");
const pollBtn = document.getElementById("pollBtn");
const eventBtn = document.getElementById("eventBtn");
const feelingBtn = document.getElementById("feelingBtn");
const focusPost = document.getElementById("focusPost");
const postCategorySelect = document.getElementById("postCategory");

const composerDraft = {
  photoUrl: "",
  photoName: "",
  poll: null,
  event: null,
  category: "Academic"
};

if (postCategorySelect) {
  postCategorySelect.addEventListener("change", function () {
    composerDraft.category = postCategorySelect.value;
  });
}

const composeBox = document.querySelector(".compose");
const attachmentBar = document.createElement("div");
attachmentBar.className = "composer-attachments";
attachmentBar.style.cssText =
  "display:none;margin-top:12px;padding:10px 14px;background:#182236;border:1px solid #2d3a54;border-radius:10px;font-size:13px;color:#c5cedc;";
if (composeBox) {
  composeBox.insertBefore(attachmentBar, composeBox.querySelector(".compose-row"));
}

function renderAttachmentPreview() {
  if (!composeBox) return;
  const parts = [];

  if (composerDraft.photoUrl) {
    parts.push(
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
        '<span>📷 Photo: <b>' + escapeHTML(composerDraft.photoName || "Uploaded image") + '</b></span>' +
        '<button type="button" id="clearPhotoDraft" style="background:none;border:0;color:#ff7188;cursor:pointer;font-size:12px;">Remove</button>' +
      '</div>'
    );
  }

  if (composerDraft.poll) {
    parts.push(
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:' +
        (parts.length ? "8px" : "0") +
        ';">' +
        '<span>📊 Poll: <b>' +
        escapeHTML(composerDraft.poll.question) +
        '</b> (' +
        composerDraft.poll.options.length +
        ' options)</span>' +
        '<button type="button" id="clearPollDraft" style="background:none;border:0;color:#ff7188;cursor:pointer;font-size:12px;">Remove</button>' +
      '</div>'
    );
  }

  if (composerDraft.event) {
    parts.push(
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:' +
        (parts.length ? "8px" : "0") +
        ';">' +
        '<span>📅 Event: <b>' +
        escapeHTML(composerDraft.event.title) +
        '</b> · ' +
        escapeHTML(composerDraft.event.date) +
        '</span>' +
        '<button type="button" id="clearEventDraft" style="background:none;border:0;color:#ff7188;cursor:pointer;font-size:12px;">Remove</button>' +
      '</div>'
    );
  }

  if (!parts.length) {
    attachmentBar.style.display = "none";
    attachmentBar.innerHTML = "";
    return;
  }

  attachmentBar.style.display = "block";
  attachmentBar.innerHTML = parts.join("");

  const clearPhoto = document.getElementById("clearPhotoDraft");
  if (clearPhoto) {
    clearPhoto.addEventListener("click", function () {
      composerDraft.photoUrl = "";
      composerDraft.photoName = "";
      if (photoInput) photoInput.value = "";
      renderAttachmentPreview();
    });
  }

  const clearPoll = document.getElementById("clearPollDraft");
  if (clearPoll) {
    clearPoll.addEventListener("click", function () {
      composerDraft.poll = null;
      renderAttachmentPreview();
    });
  }

  const clearEvent = document.getElementById("clearEventDraft");
  if (clearEvent) {
    clearEvent.addEventListener("click", function () {
      composerDraft.event = null;
      renderAttachmentPreview();
    });
  }
}

if (photoBtn && photoInput) {
  photoBtn.addEventListener("click", function () {
    photoInput.click();
  });

  photoInput.addEventListener("change", function () {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    composerDraft.photoName = file.name;
    const reader = new FileReader();
    reader.onload = function (evt) {
      composerDraft.photoUrl = String(evt.target && evt.target.result ? evt.target.result : "");
      renderAttachmentPreview();
    };
    reader.readAsDataURL(file);
  });
}

if (pollBtn) {
  pollBtn.addEventListener("click", function () {
    const question = prompt("What is your poll question?");
    if (!question || !question.trim()) return;

    const rawOptions = prompt("Enter 2 to 4 poll options separated by commas:", "Yes, No, Maybe");
    if (!rawOptions) return;

    const options = rawOptions
      .split(",")
      .map(function (opt) {
        return opt.trim();
      })
      .filter(Boolean)
      .slice(0, 4);

    if (options.length < 2) {
      alert("Please enter at least two options separated by commas.");
      return;
    }

    composerDraft.poll = {
      question: question.trim(),
      options: options,
      votes: options.map(function () {
        return 0;
      }),
      votedIndex: null
    };
    renderAttachmentPreview();
    if (postInput) postInput.focus();
  });
}

if (eventBtn) {
  eventBtn.addEventListener("click", function () {
    const title = prompt("What is the event name?");
    if (!title || !title.trim()) return;

    const date = prompt("When is it? (e.g., Nov 28, 2026 · 4:00 PM)", "This Friday · 3:00 PM");
    if (date === null) return;

    const location = prompt("Where is it taking place?", "Main Auditorium");
    if (location === null) return;

    composerDraft.event = {
      title: title.trim(),
      date: date.trim() || "TBA",
      location: location.trim() || "Campus"
    };
    composerDraft.category = "Events";
    if (postCategorySelect) postCategorySelect.value = "Events";
    renderAttachmentPreview();
    if (postInput) postInput.focus();
  });
}

if (feelingBtn) {
  feelingBtn.addEventListener("click", function () {
    const feeling = prompt("How are you feeling?");
    if (!feeling || !feeling.trim()) return;
    if (postInput) {
      const current = postInput.value.trim();
      postInput.value = current
        ? current + " — 😊 Feeling " + feeling.trim()
        : "😊 Feeling " + feeling.trim();
      postInput.focus();
    }
  });
}

if (focusPost) {
  focusPost.addEventListener("click", function () {
    if (postInput) {
      postInput.focus();
      postInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function buildPostElement(post, index) {
  const article = document.createElement("article");
  article.className = "post";
  article.dataset.id = post.id;
  article.dataset.cat = post.category || "Academic";
  article.dataset.following = post.following ? "true" : "false";
  article.dataset.saved = post.saved ? "true" : "false";
  article.dataset.moderation = post.moderationStatus || "visible";
  article.dataset.ts = String(post.timestamp || Date.now());
  article.dataset.order = String(index);

  const avatarHtml = post.avatar
    ? '<img class="post-avatar ' +
      escapeHTML(post.avatarClass || "") +
      ' profile-link" data-profile="' +
      escapeHTML(post.author) +
      '" src="' +
      escapeHTML(post.avatar) +
      '" alt="' +
      escapeHTML(post.author) +
      '">'
    : '<span class="avatar me profile-link" data-profile="' +
      escapeHTML(post.author) +
      '" style="width:50px;height:50px;min-width:50px;font-size:18px;">' +
      escapeHTML(post.initials || (post.author[0] || "U").toUpperCase()) +
      "</span>";

  let attachmentsHtml = post.customCardsHtml || "";

  if (post.photoUrl) {
    attachmentsHtml +=
      '<div class="uploaded-photo"><img src="' +
      escapeHTML(post.photoUrl) +
      '" alt="Uploaded post photo"></div>';
  }

  if (post.poll && Array.isArray(post.poll.options)) {
    const totalVotes = (post.poll.votes || []).reduce(function (acc, n) {
      return acc + (Number(n) || 0);
    }, 0);

    const optionsHtml = post.poll.options
      .map(function (opt, optIdx) {
        const count = Number(post.poll.votes[optIdx]) || 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isChosen = post.poll.votedIndex === optIdx;
        return (
          '<button type="button" class="poll-option' +
          (isChosen ? " voted" : "") +
          '" data-poll-index="' +
          optIdx +
          '">' +
          "<span>" +
          escapeHTML(opt) +
          (isChosen ? " ✓" : "") +
          "</span>" +
          "<span>" +
          pct +
          "% (" +
          count +
          ")</span>" +
          "</button>"
        );
      })
      .join("");

    attachmentsHtml +=
      '<div class="poll-box">' +
      '<div style="font-size:14px;font-weight:700;color:#e8ebf4;">' +
      escapeHTML(post.poll.question) +
      "</div>" +
      optionsHtml +
      "</div>";
  }

  if (post.event) {
    attachmentsHtml +=
      '<div class="event-post">' +
      '<div class="event-post-icon">📅</div>' +
      "<div>" +
      "<small>CAMPUS EVENT</small>" +
      "<h3>" +
      escapeHTML(post.event.title) +
      "</h3>" +
      "<p>" +
      escapeHTML(post.event.date) +
      " · " +
      escapeHTML(post.event.location) +
      "</p>" +
      "</div>" +
      "</div>";
  }

  article.innerHTML =
    '<div class="head">' +
      avatarHtml +
      "<div>" +
        '<b class="profile-link" data-profile="' +
        escapeHTML(post.author) +
        '">' +
        escapeHTML(post.author) +
        "</b>" +
        "<small>" +
        escapeHTML(post.time || "Just now") +
        " · " +
        escapeHTML(post.course || "Computer Science") +
        "</small>" +
      "</div>" +
      '<button class="more" type="button" aria-label="More options"><i class="fa-solid fa-ellipsis"></i></button>' +
    "</div>" +
    (post.text ? "<p>" + formatMultilineText(post.text) + "</p>" : "") +
    attachmentsHtml +
    '<div class="post-actions">' +
      '<button type="button" class="like' +
      (post.liked ? " liked on" : "") +
      '"><i class="fa-solid fa-heart"></i> <span>' +
      Number(post.likes || 0) +
      "</span></button>" +
      '<button type="button" class="comment"><i class="fa-regular fa-comment"></i> <span>' +
      Number(post.comments || 0) +
      "</span></button>" +
      '<button type="button" class="share"><i class="fa-solid fa-share"></i> <span>Share</span></button>' +
      '<button type="button" class="save' +
      (post.saved ? " saved" : "") +
      '"><i class="' +
      (post.saved ? "fa-solid" : "fa-regular") +
      ' fa-bookmark"></i></button>' +
    "</div>";

  // Multi-reaction summary and picker (persisted per demo account).
  const reactionUsers = post.reactionUsers || {};
  const reactionCounts = Object.values(reactionUsers).reduce(function(acc, key) {
    acc[key] = (acc[key] || 0) + 1; return acc;
  }, {});
  const reactionDefs = [
    ["like","👍","Like"],["love","❤️","Love"],["haha","😂","Haha"],
    ["wow","😮","Wow"],["sad","😢","Sad"],["angry","😡","Angry"]
  ];
  const currentEmail = (JSON.parse(localStorage.getItem("campuslySession") || "null") || {}).email || "guest@campusly.local";
  const myReaction = reactionUsers[currentEmail] || "";
  const reactionWrap = document.createElement("div");
  reactionWrap.className = "post-reaction-area";
  const summary = reactionDefs.filter(function(def){return reactionCounts[def[0]];}).map(function(def){
    return '<button type="button" class="reaction-count-chip" data-reaction-view="'+def[0]+'" title="See who reacted with '+def[2]+'">'+def[1]+' '+reactionCounts[def[0]]+'</button>';
  }).join("");
  reactionWrap.innerHTML =
    '<div class="reaction-summary">'+(summary || '<span class="reaction-empty">Be the first to react</span>')+'</div>'+
    '<div class="reaction-picker" hidden>'+reactionDefs.map(function(def){
      return '<button type="button" class="reaction-choice '+(myReaction===def[0]?'selected':'')+'" data-reaction="'+def[0]+'" aria-label="'+def[2]+'" title="'+def[2]+'">'+def[1]+'</button>';
    }).join("")+'</div>'+
    '<button type="button" class="reaction-trigger '+(myReaction?'has-reaction':'')+'" aria-expanded="false"><span>'+(myReaction?(reactionDefs.find(d=>d[0]===myReaction)||[])[1]:"☺")+'</span> '+(myReaction?"Reacted":"React")+' · '+Object.values(reactionCounts).reduce((n,v)=>n+v,0)+'</button>';
  article.querySelector(".post-actions")?.insertAdjacentElement("afterend", reactionWrap);

  return article;
}

function renderPosts() {
  if (!postsContainer) return;
  postsContainer.innerHTML = "";
  postsData.forEach(function (post, idx) {
    postsContainer.appendChild(buildPostElement(post, idx));
  });
  setupPostButtons(postsContainer);
  if (typeof bindProfileTriggers === "function") {
    bindProfileTriggers(postsContainer);
  }
  applyPostFilters();
}

document.addEventListener("campusly:posts-updated", function(event) {
  if (Array.isArray(event.detail)) {
    postsData = event.detail;
    renderPosts();
  }
});

if (postBtn && postInput) {
  postBtn.addEventListener("click", function () {
    const adminSettings = JSON.parse(localStorage.getItem("campuslyAdminSettings") || "{}");
    if (adminSettings.posts === false) { alert("Posting is temporarily disabled by Campusly administrators."); return; }
    const text = postInput.value.trim();
    const hasAttachment = Boolean(
      composerDraft.photoUrl || composerDraft.poll || composerDraft.event
    );

    if (!text && !hasAttachment) {
      alert("Write something or attach a photo, poll, or event first!");
      return;
    }

    const profile = getSavedProfile();
    const firstName = getCurrentFirstName();
    const selectedCategory =
      postCategorySelect && postCategorySelect.value
        ? postCategorySelect.value
        : composerDraft.category || "Academic";

    const newPost = {
      id: "post-" + Date.now(),
      author: firstName,
      initials: (firstName[0] || "B").toUpperCase(),
      avatar: "",
      avatarClass: "",
      course: profile.course || "Computer Science",
      time: "Just now",
      timestamp: Date.now(),
      category: selectedCategory,
      following: true,
      text: text,
      customCardsHtml: "",
      photoUrl: composerDraft.photoUrl,
      poll: composerDraft.poll ? JSON.parse(JSON.stringify(composerDraft.poll)) : null,
      event: composerDraft.event ? Object.assign({}, composerDraft.event) : null,
      likes: 0,
      liked: false,
      comments: 0,
      saved: false
    };

    postsData.unshift(newPost);
    savePosts();

    postInput.value = "";
    composerDraft.photoUrl = "";
    composerDraft.photoName = "";
    composerDraft.poll = null;
    composerDraft.event = null;
    composerDraft.category = "Academic";
    if (postCategorySelect) postCategorySelect.value = "Academic";
    if (photoInput) photoInput.value = "";
    renderAttachmentPreview();
    renderPosts();
  });
}


// =========================================================
// POST INTERACTIONS (LIKE, COMMENT, SHARE, SAVE, POLLS)
// =========================================================

function setupPostButtons(container) {
  const root = container || document;
  if (!root.dataset.reactionsReady) {
    root.dataset.reactionsReady = "true";
    root.addEventListener("click", function(event) {
      if (!event.target.closest(".post-reaction-area")) {
        root.querySelectorAll(".reaction-picker").forEach(p => {p.hidden = true;});
        root.querySelectorAll(".reaction-trigger").forEach(t => t.setAttribute("aria-expanded","false"));
      }
      const trigger = event.target.closest(".reaction-trigger");
      if (trigger) {
        const area = trigger.closest(".post-reaction-area");
        const picker = area && area.querySelector(".reaction-picker");
        if (!picker) return;
        const opening = picker.hidden;
        root.querySelectorAll(".reaction-picker").forEach(p => {p.hidden = true;});
        picker.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
        return;
      }
      const countChip = event.target.closest(".reaction-count-chip");
      if (countChip) {
        const postEl = countChip.closest(".post");
        const post = postsData.find(p => p.id === postEl?.dataset.id);
        if (!post) return;
        const key = countChip.dataset.reactionView;
        const names = Object.entries(post.reactionUsers || {}).filter(entry => entry[1] === key).map(entry => entry[0]);
        alert("Students who reacted: " + (names.length ? names.join("\\n") : "No reactions yet."));
        return;
      }
      const choice = event.target.closest(".reaction-choice");
      if (!choice) return;
      const postEl = choice.closest(".post");
      const post = postsData.find(p => p.id === postEl?.dataset.id);
      if (!post) return;
      const session = JSON.parse(localStorage.getItem("campuslySession") || "null") || {};
      const identity = session.email || "guest@campusly.local";
      post.reactionUsers = post.reactionUsers || {};
      const selected = choice.dataset.reaction;
      if (post.reactionUsers[identity] === selected) delete post.reactionUsers[identity];
      else post.reactionUsers[identity] = selected;
      savePosts();
      renderPosts();
    });
  }

  root.querySelectorAll(".post").forEach(function (postEl) {
    const postId = postEl.dataset.id;
    const postObj = postsData.find(function (p) {
      return p.id === postId;
    });

    const likeBtn = postEl.querySelector(".like");
    if (likeBtn && !likeBtn.dataset.ready) {
      likeBtn.dataset.ready = "true";
      likeBtn.addEventListener("click", function () {
        const countEl = likeBtn.querySelector("span");
        let current = countEl ? parseInt(countEl.textContent, 10) || 0 : 0;
        const nowLiked = !likeBtn.classList.contains("liked");

        likeBtn.classList.toggle("liked", nowLiked);
        likeBtn.classList.toggle("on", nowLiked);
        current = nowLiked ? current + 1 : Math.max(0, current - 1);
        if (countEl) countEl.textContent = String(current);

        if (postObj) {
          postObj.liked = nowLiked;
          postObj.likes = current;
          savePosts();
        }
      });
    }

    const commentBtn = postEl.querySelector(".comment");
    if (commentBtn && !commentBtn.dataset.ready) {
      commentBtn.dataset.ready = "true";
      commentBtn.addEventListener("click", function () {
        const adminSettings = JSON.parse(localStorage.getItem("campuslyAdminSettings") || "{}");
        if (adminSettings.comments === false) { alert("Comments are temporarily disabled by Campusly administrators."); return; }
        const reply = prompt("Write a comment:");
        if (!reply || !reply.trim()) return;

        const countEl = commentBtn.querySelector("span");
        let current = countEl ? parseInt(countEl.textContent, 10) || 0 : 0;
        current += 1;
        if (countEl) countEl.textContent = String(current);

        if (postObj) {
          postObj.comments = current;
          savePosts();
        }
        alert("Comment added!");
      });
    }

    const shareBtn = postEl.querySelector(".share");
    if (shareBtn && !shareBtn.dataset.ready) {
      shareBtn.dataset.ready = "true";
      shareBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).catch(function () {});
        }
        alert("Post link ready to share!");
      });
    }

    const saveBtn = postEl.querySelector(".save");
    if (saveBtn && !saveBtn.dataset.ready) {
      saveBtn.dataset.ready = "true";
      saveBtn.addEventListener("click", function () {
        const isSaved = !saveBtn.classList.contains("saved");
        saveBtn.classList.toggle("saved", isSaved);
        postEl.dataset.saved = isSaved ? "true" : "false";

        const icon = saveBtn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-solid", isSaved);
          icon.classList.toggle("fa-regular", !isSaved);
        }

        if (postObj) {
          postObj.saved = isSaved;
          savePosts();
        }
        applyPostFilters();
      });
    }

    postEl.querySelectorAll(".poll-option").forEach(function (optBtn) {
      if (optBtn.dataset.ready) return;
      optBtn.dataset.ready = "true";
      optBtn.addEventListener("click", function () {
        if (!postObj || !postObj.poll) return;
        const idx = Number(optBtn.dataset.pollIndex);
        if (Number.isNaN(idx)) return;

        if (postObj.poll.votedIndex !== null && postObj.poll.votedIndex !== undefined) {
          const prev = postObj.poll.votedIndex;
          postObj.poll.votes[prev] = Math.max(0, (postObj.poll.votes[prev] || 0) - 1);
        }

        if (postObj.poll.votedIndex === idx) {
          postObj.poll.votedIndex = null;
        } else {
          postObj.poll.votes[idx] = (postObj.poll.votes[idx] || 0) + 1;
          postObj.poll.votedIndex = idx;
        }

        savePosts();
        renderPosts();
      });
    });
  });
}


// =========================================================
// SIDEBAR NAVIGATION, EVENTS, CLUBS & FRIENDS
// =========================================================

const navButtons = Array.from(document.querySelectorAll(".nav"));
const eventsModal = document.getElementById("eventsModal");
const closeEvents = document.getElementById("closeEvents");
const clubsModal = document.getElementById("clubsModal");
const closeClubs = document.getElementById("closeClubs");
const messagesModal = document.getElementById("messagesModal");

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    navButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    const label = button.textContent.trim();

    if (label.startsWith("Home")) {
      filterState.savedOnly = false;
      filterState.category = "All Posts";
      if (categorySelect) categorySelect.value = "All Posts";
      applyPostFilters();
    } else if (label.startsWith("Events")) {
      if (eventsModal) eventsModal.style.display = "flex";
    } else if (label.startsWith("Clubs")) {
      if (clubsModal) clubsModal.style.display = "flex";
    } else if (label.startsWith("Messages")) {
      if (messagesModal) {
        messagesModal.classList.add("open");
        messagesModal.setAttribute("aria-hidden", "false");
      }
    } else if (label.startsWith("Saved")) {
      filterState.savedOnly = !filterState.savedOnly;
      applyPostFilters();
    }
  });
});

if (closeEvents && eventsModal) {
  closeEvents.addEventListener("click", function () {
    eventsModal.style.display = "none";
  });
  eventsModal.addEventListener("click", function (e) {
    if (e.target === eventsModal) eventsModal.style.display = "none";
  });
}

if (closeClubs && clubsModal) {
  closeClubs.addEventListener("click", function () {
    clubsModal.style.display = "none";
  });
  clubsModal.addEventListener("click", function (e) {
    if (e.target === clubsModal) clubsModal.style.display = "none";
  });
}

document.querySelectorAll(".join").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const joined = btn.classList.toggle("joined");
    btn.textContent = joined ? "Joined" : "Join";
  });
});

document.querySelectorAll(".add").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const added = btn.classList.toggle("added");
    btn.textContent = added ? "Added" : "Add";
  });
});

// Initial hydration
syncCurrentUserUI();
renderPosts();

// =========================================================
// CAMPUSLY COMPLETION PATCH: CHAT, PROFILE, NOTIFICATIONS, NAV
// =========================================================
function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value == null ? fallback : value;
  } catch (_) { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.warn("Campusly storage limit:", err); }
}

let conversations = readStore(STORAGE_KEYS.messages, DEFAULT_CONVERSATIONS.map(c => ({
  ...c, messages: c.messages.map(m => ({...m}))
})));
let activeConversation = null;
let conversationFilter = "all";

function updateMessageBadges() {
  const unread = conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0);
  const badge = document.getElementById("messageBadge");
  const filterBadge = document.getElementById("unreadFilterCount");
  if (badge) { badge.textContent = unread; badge.style.display = unread ? "" : "none"; }
  if (filterBadge) filterBadge.textContent = unread;
}
function renderConversationList() {
  const list = document.getElementById("conversationList");
  if (!list) return;
  const query = (document.getElementById("messageSearch")?.value || "").toLowerCase().trim();
  const visible = conversations.filter(c =>
    (!query || (c.name + " " + c.preview).toLowerCase().includes(query)) &&
    (conversationFilter !== "unread" || Number(c.unread) > 0)
  );
  list.innerHTML = visible.length ? visible.map(c => {
    const safeName = escapeHTML(c.name);
    const initial = escapeHTML(c.initials || c.name[0] || "?");
    const avatar = c.avatar ? `<img src="${escapeHTML(c.avatar)}" alt="">` : initial;
    return `<button type="button" class="conversation-item ${activeConversation === c.name ? "active" : ""}" data-conversation="${safeName}">
      <span class="conversation-avatar">${avatar}</span><span class="conversation-copy"><b>${safeName}</b><small>${escapeHTML(c.preview || "No messages yet")}</small></span>
      <span class="conversation-meta"><small>${escapeHTML(c.time || "")}</small>${c.unread ? `<i>${c.unread}</i>` : ""}</span>
    </button>`;
  }).join("") : '<div class="conversation-empty">No conversations found.</div>';
  list.querySelectorAll("[data-conversation]").forEach(btn => btn.addEventListener("click", () => openConversation(btn.dataset.conversation)));
  updateMessageBadges();
}
function renderChat() {
  const c = conversations.find(x => x.name === activeConversation);
  if (!c) return;
  const empty = document.getElementById("chatEmpty");
  const content = document.getElementById("chatContent");
  if (empty) empty.classList.add("hidden");
  if (content) content.classList.remove("hidden");
  const avatar = document.getElementById("chatAvatar");
  if (avatar) avatar.innerHTML = c.avatar ? `<img src="${escapeHTML(c.avatar)}" alt="">` : escapeHTML(c.initials || c.name[0]);
  const name = document.getElementById("chatName");
  const status = document.getElementById("chatStatus");
  if (name) name.textContent = c.name;
  if (status) status.textContent = c.status || "Campusly student";
  const messages = document.getElementById("chatMessages");
  if (messages) {
    messages.innerHTML = (c.messages || []).map(m =>
      `<div class="chat-bubble ${m.from === "me" ? "mine" : "theirs"}"><p>${formatMultilineText(m.text)}</p><small>${escapeHTML(m.time || "")}</small></div>`
    ).join("");
    messages.scrollTop = messages.scrollHeight;
  }
  const profileBtn = document.getElementById("chatProfileBtn");
  if (profileBtn) profileBtn.onclick = () => openProfile(c.name);
}
function openConversation(name) {
  const c = conversations.find(x => x.name === name);
  if (!c) return;
  activeConversation = name;
  c.unread = 0;
  writeStore(STORAGE_KEYS.messages, conversations);
  renderConversationList();
  renderChat();
  document.getElementById("chatPanel")?.classList.add("mobile-active");
}
function openMessages() {
  const modal = document.getElementById("messagesModal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  renderConversationList();
  if (!activeConversation && conversations.length) openConversation(conversations[0].name);
}
document.getElementById("closeMessages")?.addEventListener("click", () => {
  const modal = document.getElementById("messagesModal");
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden", "true");
});
document.getElementById("messageSearch")?.addEventListener("input", renderConversationList);
document.querySelectorAll(".message-filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".message-filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  conversationFilter = btn.dataset.filter || "all";
  renderConversationList();
}));
document.getElementById("chatForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input?.value.trim();
  const c = conversations.find(x => x.name === activeConversation);
  if (!message || !c) return;
  const now = new Date();
  c.messages = c.messages || [];
  c.messages.push({from:"me", text:message, time:now.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})});
  c.preview = message;
  c.time = "now";
  writeStore(STORAGE_KEYS.messages, conversations);
  input.value = "";
  renderChat();
  renderConversationList();
});
document.getElementById("chatBack")?.addEventListener("click", () => document.getElementById("chatPanel")?.classList.remove("mobile-active"));

const profileModal = document.getElementById("profileModal");
function openProfile(name) {
  if (!profileModal) return;
  const own = !name || name === getSavedProfile().name || name === getCurrentFirstName();
  const profile = own ? getSavedProfile() : {name, course:"Campusly student", bio:"Part of the Campusly community."};
  document.getElementById("profileTitle").textContent = profile.name || "Student";
  document.getElementById("profileBio").textContent = profile.bio || "No bio added yet.";
  document.getElementById("profileAbout").textContent = profile.bio || "No bio added yet.";
  document.querySelector(".profile-meta span")?.replaceChildren(document.createTextNode("🎓 " + (profile.course || "Student")));
  document.getElementById("profileAvatar").textContent = (profile.name || "S")[0].toUpperCase();
  document.getElementById("profilePosts").textContent = own ? postsData.filter(p => p.author === getCurrentFirstName()).length : postsData.filter(p => p.author === name).length;
  document.getElementById("editProfileBtn").style.display = own ? "" : "none";
  document.getElementById("messageFromProfile").style.display = own ? "none" : "";
  document.getElementById("profileEdit").classList.add("hidden");
  profileModal.classList.add("open");
  profileModal.setAttribute("aria-hidden","false");
}
function closeProfile() {
  profileModal?.classList.remove("open");
  profileModal?.setAttribute("aria-hidden","true");
}
document.getElementById("closeProfile")?.addEventListener("click", closeProfile);
profileModal?.addEventListener("click", e => { if (e.target === profileModal) closeProfile(); });
document.getElementById("profileNav")?.addEventListener("click", () => openProfile());
document.getElementById("quickProfileBtn")?.addEventListener("click", () => openProfile());
document.getElementById("editProfileBtn")?.addEventListener("click", () => {
  const p = getSavedProfile();
  document.getElementById("editProfileName").value = p.name || "";
  document.getElementById("editProfileBio").value = p.bio || "";
  document.getElementById("profileEdit").classList.remove("hidden");
});
document.getElementById("cancelProfileEdit")?.addEventListener("click", () => document.getElementById("profileEdit").classList.add("hidden"));
document.getElementById("saveProfileEdit")?.addEventListener("click", () => {
  const name = document.getElementById("editProfileName").value.trim();
  const bio = document.getElementById("editProfileBio").value.trim();
  if (!name) { alert("Please enter your display name."); return; }
  const p = getSavedProfile();
  p.name = name; p.bio = bio;
  writeStore(STORAGE_KEYS.profile, p);
  syncCurrentUserUI();
  openProfile();
});

document.querySelectorAll(".profile-link").forEach(el => el.addEventListener("click", () => openProfile(el.dataset.profile || "")));
document.getElementById("messageFromProfile")?.addEventListener("click", () => {
  const name = document.getElementById("profileTitle").textContent;
  if (!conversations.some(c => c.name === name)) conversations.unshift({
    name, initials:name[0], time:"now", preview:"Start a conversation", unread:0, status:"Campusly student", messages:[]
  });
  writeStore(STORAGE_KEYS.messages, conversations);
  closeProfile(); openMessages(); openConversation(name);
});

// Notifications: persisted read state and functional badge.
const notificationPopover = document.getElementById("notificationPopover");
let notificationRead = readStore("campuslyNotificationsRead", false);
function syncNotifications() {
  const badge = document.getElementById("notificationBadge");
  const items = Array.from(document.querySelectorAll(".notification-item"));
  items.forEach(item => item.classList.toggle("unread", !notificationRead && item.dataset.read !== "true" && item.dataset.notification));
  const count = notificationRead ? 0 : items.filter(i => i.classList.contains("unread")).length;
  if (badge) { badge.textContent = count; badge.style.display = count ? "" : "none"; }
}
document.getElementById("notificationBtn")?.addEventListener("click", e => {
  e.stopPropagation();
  notificationPopover?.classList.toggle("hidden");
  notificationPopover?.setAttribute("aria-hidden", notificationPopover.classList.contains("hidden") ? "true" : "false");
});
document.getElementById("markNotificationsRead")?.addEventListener("click", () => {
  notificationRead = true; writeStore("campuslyNotificationsRead", true); syncNotifications();
});
notificationPopover?.addEventListener("click", e => {
  const item = e.target.closest(".notification-item");
  if (!item) return;
  item.classList.remove("unread"); item.dataset.read = "true";
  if (item.dataset.notification === "message") { notificationPopover.classList.add("hidden"); openMessages(); }
  syncNotifications();
});
document.addEventListener("click", e => {
  if (notificationPopover && !notificationPopover.contains(e.target) && !e.target.closest("#notificationBtn")) {
    notificationPopover.classList.add("hidden");
    notificationPopover.setAttribute("aria-hidden","true");
  }
});
syncNotifications();

// Complete Explore and navigation behaviour.
const exploreNav = Array.from(document.querySelectorAll(".nav")).find(b => b.textContent.trim().startsWith("Explore"));
exploreNav?.addEventListener("click", () => {
  filterState.savedOnly = false; filterState.tab = "For You";
  tabButtons.forEach(t => t.classList.toggle("active", t.textContent.trim() === "For You"));
  if (searchInput) { searchInput.focus(); searchInput.placeholder = "Explore posts, people and campus topics..."; }
  filterState.search = "";
  if (searchInput) searchInput.value = "";
  applyPostFilters();
});
document.getElementById("messagesNav")?.addEventListener("click", openMessages);
document.querySelectorAll(".nav").forEach(b => b.addEventListener("click", () => {
  if (!b.textContent.trim().startsWith("Saved")) return;
  filterState.savedOnly = true; filterState.tab = "For You";
  tabButtons.forEach(t => t.classList.toggle("active", t.textContent.trim() === "For You"));
  applyPostFilters();
}));
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    notificationPopover?.classList.add("hidden");
    closeProfile();
    document.getElementById("messagesModal")?.classList.remove("open");
    eventsModal && (eventsModal.style.display = "none");
    clubsModal && (clubsModal.style.display = "none");
  }
});
updateMessageBadges();

document.addEventListener("click", e => { const target = e.target.closest(".profile-link"); if (target) openProfile(target.dataset.profile || ""); });


// =========================================================
// CAMPUSLY PRESENTATION UPGRADE — richer demo interactions
// =========================================================
(function campuslyPresentationUpgrade() {
  const extraPosts = [
    {id:"post-priya-1",author:"Priya Menon",initials:"P",course:"Information Technology",time:"6h ago",timestamp:Date.now()-6*3600000,category:"Campus Life",following:true,text:"Late-night library sessions hit different when your friends are just as determined as you are. 📚✨",photoUrl:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1100&q=85",likes:76,liked:false,comments:8,saved:false},
    {id:"post-arjun-1",author:"Arjun Iyer",initials:"A",course:"Computer Science",time:"8h ago",timestamp:Date.now()-8*3600000,category:"Events",following:true,text:"The campus hackathon is coming up! Building something useful, meeting new people, and learning along the way. Who's joining? 🚀",photoUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=85",likes:93,liked:false,comments:14,saved:false},
    {id:"post-sneha-1",author:"Sneha Kapoor",initials:"S",course:"Visual Communication",time:"Yesterday",timestamp:Date.now()-24*3600000,category:"Creative",following:true,text:"A few frames from today's photo walk around campus. Golden hour understood the assignment. 📸",photoUrl:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1100&q=85",likes:112,liked:false,comments:19,saved:false},
    {id:"post-dev-1",author:"Dev Patel",initials:"D",course:"Electronics Engineering",time:"Yesterday",timestamp:Date.now()-27*3600000,category:"Academic",following:false,text:"Reminder: the robotics team is looking for people who enjoy hardware, coding, design, or just learning by building. Beginners are welcome.",photoUrl:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1100&q=85",likes:41,liked:false,comments:6,saved:false},
    {id:"post-meera-1",author:"Meera Shah",initials:"M",course:"Business Administration",time:"2 days ago",timestamp:Date.now()-48*3600000,category:"Campus Life",following:false,text:"Small wins matter. Finished my presentation, helped a friend prepare for an interview, and still made it to dance practice. 💜",photoUrl:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85",likes:67,liked:false,comments:11,saved:false}
  ];
  extraPosts.forEach(p => { if (!postsData.some(x => x.id === p.id)) postsData.push(p); });
  if (postsData.length > 7) postsData = postsData.slice(0,7);

  const baseBuildPostElement = buildPostElement;
  buildPostElement = function(post,index) {
    const el = baseBuildPostElement(post,index);
    const actions = el.querySelector(".post-actions");
    if (actions && !actions.querySelector(".dislike")) {
      const dislike = document.createElement("button");
      dislike.type="button"; dislike.className="dislike"; dislike.title="Dislike";
      dislike.innerHTML='<i class="fa-regular fa-thumbs-down"></i><span>Dislike</span>';
      const report = document.createElement("button");
      report.type="button"; report.className="report"; report.title="Report post";
      report.innerHTML='<i class="fa-regular fa-flag"></i><span>Report</span>';
      actions.append(dislike,report);
    }
    return el;
  };

  function addCampusNotification(title, detail, type="activity") {
    const list=document.getElementById("notificationList");
    if(!list) return;
    const item=document.createElement("button");
    item.type="button"; item.className="notification-item unread"; item.dataset.notification=type;
    item.innerHTML='<span class="notification-icon friend"><i class="fa-solid fa-bolt"></i></span><span><b></b> <small></small></span>';
    item.querySelector("b").textContent=title;
    item.querySelector("small").textContent=detail+" · just now";
    list.prepend(item);
    notificationRead=false; writeStore("campuslyNotificationsRead",false);
    if(typeof syncNotifications==="function") syncNotifications();
  }

  function openPostComments(post) {
    let modal=document.getElementById("postCommentsModal");
    if(!modal){
      modal=document.createElement("div"); modal.id="postCommentsModal"; modal.className="campus-modal open";
      modal.innerHTML='<section class="upgrade-dialog"><button class="modal-close" data-close-comments>×</button><p class="modal-eyebrow">CAMPUS CONVERSATION</p><h2>Comments</h2><div id="postCommentList"></div><form id="postCommentForm"><input id="postCommentInput" maxlength="400" placeholder="Write a thoughtful comment…" required><button class="primary-btn">Comment</button></form></section>';
      document.body.append(modal);
      modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest("[data-close-comments]"))modal.classList.remove("open");});
      modal.querySelector("#postCommentForm").addEventListener("submit",e=>{
        e.preventDefault(); const value=modal.querySelector("#postCommentInput").value.trim(); if(!value)return;
        const target=postsData.find(p=>p.id===modal.dataset.postId); if(!target)return;
        target.commentItems=target.commentItems||[];
        target.commentItems.push({author:getSavedProfile().name||"Bandile Dlamini",text:value,time:new Date().toLocaleString()});
        target.comments=target.commentItems.length; savePosts(); modal.querySelector("#postCommentInput").value="";
        renderCommentItems(target); renderPosts();
      });
    }
    modal.dataset.postId=post.id; renderCommentItems(post); modal.classList.add("open");
  }
  function renderCommentItems(post){
    const list=document.getElementById("postCommentList"); if(!list)return;
    const items=post.commentItems||[];
    list.innerHTML=items.length?items.map(c=>'<article class="comment-row"><b>'+escapeHTML(c.author)+'</b><p>'+formatMultilineText(c.text)+'</p><small>'+escapeHTML(c.time||"")+'</small></article>').join(""):'<p class="empty-comments">No written comments yet. Start the conversation.</p>';
  }

  // Capture comments before the older demo prompt handler.
  postsContainer?.addEventListener("click",e=>{
    const comment=e.target.closest(".comment");
    if(comment){e.preventDefault();e.stopImmediatePropagation();const p=postsData.find(x=>x.id===comment.closest(".post")?.dataset.id);if(p)openPostComments(p);}
  },true);
  postsContainer?.addEventListener("click",e=>{
    const postEl=e.target.closest(".post"); if(!postEl)return;
    const post=postsData.find(x=>x.id===postEl.dataset.id); if(!post)return;
    const dislike=e.target.closest(".dislike");
    if(dislike){
      const on=dislike.classList.toggle("active"); post.disliked=on;
      dislike.innerHTML='<i class="fa-'+(on?'solid':'regular')+' fa-thumbs-down"></i><span>'+(on?'Disliked':'Dislike')+'</span>';
      savePosts(); if(on)addCampusNotification("Your feedback was recorded","You marked a post as not relevant","activity");
    }
    const report=e.target.closest(".report");
    if(report){
      if(confirm("Report this post to the Campusly moderation team?")){
        post.reported=true; savePosts(); report.classList.add("active"); report.innerHTML='<i class="fa-solid fa-flag"></i><span>Reported</span>';
        const reportQueue = JSON.parse(localStorage.getItem("campuslyReports") || "[]");
        reportQueue.unshift({id:"report-"+Date.now(),postId:post.id,postAuthor:post.author,reason:"Community guideline concern",details:(post.text||"").slice(0,160),status:"Open",createdAt:new Date().toLocaleString()});
        localStorage.setItem("campuslyReports",JSON.stringify(reportQueue));
        addCampusNotification("Report submitted","The post was flagged for review","activity");
        alert("Thank you. This demo report has been recorded locally for review.");
      }
    }
  });

  // Make the event list and club cards open rich detail views.
  const eventInfo=[
    ["Afro Fest 2026","6 December 2026","Main Auditorium","A celebration of music, dance, food and student creativity. Expect live performances, cultural showcases, food stalls and an open dance floor.","6:00 PM – 10:30 PM","Student Cultural Association","Free entry · Student ID required","https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85"],
    ["Inter-Dept Soccer","10 December 2026","Sports Complex","A friendly inter-department tournament bringing together teams from across campus. Come support your department and enjoy an afternoon of sport.","3:00 PM – 6:00 PM","Campus Sports Council","Free spectator entry","https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=85"],
    ["Campus Hackathon","14 December 2026","Innovation Lab","A 24-hour build challenge for students interested in technology, design and problem solving. Teams can prototype ideas and present them to a panel of mentors.","9:00 AM start","Coding Club & Innovation Cell","Registration required · Teams of 2–4","https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85"],
    ["Campus Chess Open","18 December 2026","Student Centre","An open chess tournament for beginners and experienced players, with friendly rounds, prizes and a chance to meet fellow strategy enthusiasts.","11:00 AM – 4:00 PM","Chess Society","Free registration","https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?auto=format&fit=crop&w=1400&q=85"]
  ];
  const clubInfo=[
    ["Coding Club","1.2K members","Build projects, learn web development, explore AI and collaborate on practical software challenges. Weekly workshops, peer mentoring and hackathon teams.","Wednesday · 5:00 PM","Innovation Lab · Room 204","Beginner friendly"],
    ["Photography Club","840 members","A creative community for photography walks, portrait sessions, editing workshops and campus exhibitions. Bring any camera or start with your phone.","Friday · 4:30 PM","Arts Block · Studio 2","All skill levels"],
    ["Dance Society","620 members","Explore choreography, freestyle, cultural dance and performances at campus events. New members are welcome throughout the semester.","Tuesday · 6:00 PM","Activity Hall","Open auditions"],
    ["Robotics Club","510 members","Design, build and test robots with students across engineering disciplines. Learn electronics, CAD, programming and teamwork through hands-on projects.","Saturday · 10:00 AM","Engineering Workshop","No experience required"]
  ];
  function detailModal(kind,data){
    let m=document.getElementById("campusDetailModal");
    if(!m){m=document.createElement("div");m.id="campusDetailModal";m.className="campus-modal";document.body.append(m);m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-detail-close]"))m.classList.remove("open");});}
    const [name,sub,place,desc,when,host,extra,img]=data;
    m.innerHTML='<section class="upgrade-dialog detail-dialog"><button class="modal-close" data-detail-close>×</button><img class="detail-hero" src="'+(kind==="event"?img:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85")+'" alt=""><p class="modal-eyebrow">'+(kind==="event"?"CAMPUS EVENT":"STUDENT CLUB")+'</p><h2>'+escapeHTML(name)+'</h2><p class="detail-sub">'+escapeHTML(sub)+' · '+escapeHTML(place)+'</p><p class="detail-description">'+escapeHTML(desc)+'</p><div class="detail-facts"><span><b>'+(kind==="event"?"Time":"Meetings")+'</b>'+escapeHTML(when)+'</span><span><b>'+(kind==="event"?"Organiser":"Location")+'</b>'+escapeHTML(host)+'</span><span><b>Details</b>'+escapeHTML(extra)+'</span></div><button class="primary-btn detail-action">'+(kind==="event"?"I'm interested / RSVP":"Join this club")+'</button><p class="detail-note">Presentation demo content — details are illustrative and stored only in this browser.</p></section>';
    m.classList.add("open");
    m.querySelector(".detail-action").addEventListener("click",e=>{e.currentTarget.classList.add("confirmed");e.currentTarget.textContent=kind==="event"?"You're on the attendee list ✓":"You've joined the club ✓";addCampusNotification(kind==="event"?"Event RSVP saved":"Club membership saved",name,"event");});
  }
  document.querySelectorAll(".right .event").forEach((el,i)=>{el.setAttribute("role","button");el.tabIndex=0;el.addEventListener("click",()=>detailModal("event",eventInfo[i]||eventInfo[0]));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();detailModal("event",eventInfo[i]||eventInfo[0]);}});});
  document.querySelectorAll(".event-modal-item").forEach((el,i)=>{el.style.cursor="pointer";el.addEventListener("click",e=>{if(e.target.closest("button"))return;detailModal("event",eventInfo[i]||eventInfo[0]);});});
  document.querySelectorAll(".club-modal-item").forEach((el,i)=>{el.style.cursor="pointer";el.addEventListener("click",e=>{if(e.target.closest(".join"))return;detailModal("club",clubInfo[i]||clubInfo[0]);});});
  document.querySelectorAll(".right .club,.right .suggested-club,.right .club-item").forEach((el,i)=>{el.style.cursor="pointer";el.addEventListener("click",e=>{if(e.target.closest("button"))return;detailModal("club",clubInfo[i]||clubInfo[0]);});});

  // Profile customization: course, interests, avatar URL / local image.
  const edit=document.getElementById("profileEdit");
  if(edit && !document.getElementById("editProfileCourse")){
    const extra=document.createElement("div"); extra.className="profile-extra-fields";
    extra.innerHTML='<label>Course / department<input id="editProfileCourse" maxlength="70" placeholder="e.g. Data Science & AI"></label><label>Interests (comma separated)<input id="editProfileInterests" maxlength="120" placeholder="AI, design, football"></label><label>Avatar image URL<input id="editProfileAvatar" type="url" placeholder="https://…"></label><label class="avatar-upload-label">Or upload a profile photo<input id="editProfilePhoto" type="file" accept="image/*"></label>';
    edit.insertBefore(extra,edit.querySelector(".edit-actions"));
    const oldSave=document.getElementById("saveProfileEdit");
    oldSave.addEventListener("click",()=>{
      const p=getSavedProfile(); p.course=document.getElementById("editProfileCourse").value.trim()||p.course||"Student";
      p.interests=document.getElementById("editProfileInterests").value.split(",").map(x=>x.trim()).filter(Boolean);
      const url=document.getElementById("editProfileAvatar").value.trim(); if(url)p.avatar=url;
      const file=document.getElementById("editProfilePhoto").files[0];
      if(file && file.size<900000){const reader=new FileReader();reader.onload=()=>{p.avatar=reader.result;writeStore(STORAGE_KEYS.profile,p);syncCurrentUserUI();openProfile();};reader.readAsDataURL(file);}
      else {writeStore(STORAGE_KEYS.profile,p);syncCurrentUserUI();openProfile();}
    });
  }
  const oldOpenProfile=openProfile;
  openProfile=function(name){
    oldOpenProfile(name);
    const p=getSavedProfile(); const own=!name||name===p.name||name===getCurrentFirstName();
    if(own){
      const course=p.course||"Computer Science";
      const meta=document.querySelector(".profile-meta span"); if(meta)meta.textContent="🎓 "+course;
      const avatar=document.getElementById("profileAvatar"); if(avatar){avatar.innerHTML=p.avatar?'<img src="'+escapeHTML(p.avatar)+'" alt="Profile photo">':escapeHTML((p.name||"S")[0].toUpperCase());}
      const interests=document.getElementById("interestTags"); if(interests)interests.innerHTML=(p.interests||["Technology","AI & Data","Web Development"]).map(x=>"<span>"+escapeHTML(x)+"</span>").join("");
    }
  };
  document.getElementById("editProfileBtn")?.addEventListener("click",()=>{
    const p=getSavedProfile();
    const c=document.getElementById("editProfileCourse"), i=document.getElementById("editProfileInterests"), a=document.getElementById("editProfileAvatar");
    if(c)c.value=p.course||""; if(i)i.value=(p.interests||[]).join(", "); if(a)a.value=p.avatar&&p.avatar.startsWith("http")?p.avatar:"";
  });

  // Better right rail "See all" shortcuts and top profile access.
  document.querySelectorAll(".right .title a").forEach((a,i)=>a.addEventListener("click",()=>{if(i===0&&eventsModal)eventsModal.style.display="flex";else if(clubsModal)clubsModal.style.display="flex";}));
  document.getElementById("quickProfileBtn")?.setAttribute("title","Open your profile");
  document.querySelector(".top .user")?.addEventListener("click",()=>openProfile());
  document.querySelector(".top .user")?.setAttribute("role","button");
  document.querySelector(".top .user")?.setAttribute("tabindex","0");
  document.querySelector(".top .user")?.addEventListener("keydown",e=>{if(e.key==="Enter")openProfile();});

  renderPosts();
})();

