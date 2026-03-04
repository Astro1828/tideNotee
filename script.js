const starterPosts = [
  {
    title: "Blue Interfaces That Build Reader Trust",
    type: "article",
    category: "design",
    excerpt: "A practical look at layout balance, color hierarchy, and pacing decisions that make long-form content feel reliable.",
    content: "Trust grows when the reading surface is calm and predictable. Use consistent spacing scales, reserve bright tones for action moments, and avoid visual clutter around the headline area.",
    date: "March 4, 2026",
    readTime: "8 min read"
  },
  {
    title: "Launch a Blog Workflow in One Weekend",
    type: "blog",
    category: "product",
    excerpt: "Start with a simple content pipeline: draft, review, publish, and retro. Keep it light until your publishing rhythm is stable.",
    content: "Set a weekly writing slot, keep each draft scoped to one specific takeaway, and close each post with one actionable checklist. This creates momentum without overcomplicating your process.",
    date: "March 2, 2026",
    readTime: "6 min read"
  }
];
const STORAGE_KEY = "tidenote_posts_v1";

const grid = document.getElementById("posts-grid");
const filterBar = document.getElementById("filters");
const postForm = document.getElementById("post-form");
const formNote = document.getElementById("form-note");
let posts = loadPosts();
let activeFilter = "all";

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createPostMarkup(post) {
  const previewBlock = post.content
    ? `
      <details class="post-details">
        <summary>Open article preview</summary>
        <p>${escapeHtml(post.content)}</p>
      </details>
    `
    : "";

  return `
    <article class="post-card">
      <div class="post-tags">
        <span class="post-tag">${escapeHtml(post.type || "blog")}</span>
        <span class="post-tag post-tag-secondary">${escapeHtml(post.category)}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      ${previewBlock}
      <p class="meta-line">${escapeHtml(post.date)}  |  ${escapeHtml(post.readTime)}</p>
    </article>
  `;
}

function loadPosts() {
  try {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (!storedPosts) {
      return [...starterPosts];
    }
    const parsed = JSON.parse(storedPosts);
    if (!Array.isArray(parsed)) {
      return [...starterPosts];
    }
    return parsed;
  } catch (error) {
    return [...starterPosts];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function renderPosts(filter) {
  const items = filter === "all" ? posts : posts.filter((item) => item.category === filter);
  if (items.length === 0) {
    grid.innerHTML = `
      <article class="post-card">
        <h3>No posts in this category yet.</h3>
        <p>Add one from the writer desk above.</p>
      </article>
    `;
    return;
  }

  grid.innerHTML = items.map(createPostMarkup).join("");

  const cards = grid.querySelectorAll(".post-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(12px)";
    card.style.animation = `rise-in 520ms cubic-bezier(0.2, 0.85, 0.22, 1) ${index * 70}ms forwards`;
  });
}

function activateFilter(nextFilter) {
  activeFilter = nextFilter;
  const buttons = filterBar.querySelectorAll(".filter-btn");
  buttons.forEach((button) => {
    const isCurrent = button.dataset.filter === nextFilter;
    button.classList.toggle("active", isCurrent);
  });
  renderPosts(nextFilter);
}

if (filterBar) {
  filterBar.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const nextFilter = target.dataset.filter;
    if (!nextFilter) {
      return;
    }

    activateFilter(nextFilter);
  });
}

function formatTodayDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

if (postForm) {
  postForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = postForm.elements["post-title"].value.trim();
    const type = postForm.elements["post-type"].value;
    const category = postForm.elements["post-category"].value;
    const readTimeInput = postForm.elements["post-readtime"].value.trim();
    const excerpt = postForm.elements["post-excerpt"].value.trim();
    const content = postForm.elements["post-content"].value.trim();

    if (!title || !excerpt || !content) {
      formNote.textContent = "Please fill in title, summary, and article content.";
      return;
    }

    posts.unshift({
      title,
      type,
      category,
      excerpt,
      content,
      date: formatTodayDate(),
      readTime: readTimeInput || "5 min read"
    });
    savePosts();

    postForm.reset();
    formNote.textContent = `Published: "${title}"`;
    activateFilter(activeFilter);
  });
}

function attachRevealObserver() {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.24
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

renderPosts(activeFilter);
attachRevealObserver();
