const dataSource = window.LIFEHUB_DATA || {};
const cards = dataSource.cards || [];
const tasks = dataSource.tasks || [];

const iconMap = {
  inbox: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 8h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
      <path d="M12 4v7l-3-3m3 3 3-3" />
    </svg>
  `,
  briefcase: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 7h10a3 3 0 0 1 3 3v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5a3 3 0 0 1 3-3Z" />
      <path d="M9 5h6v2H9zM3 12h18" />
    </svg>
  `,
  family: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="9" r="3" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M4 18v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1" />
      <path d="M13 18v-1.2a3.5 3.5 0 0 1 3.5-3.5H21" />
    </svg>
  `,
  finance: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v8m-2.5-5h5" />
    </svg>
  `,
  home: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12L12 4l9 8" />
      <path d="M5 10v8a2 2 0 0 0 2 2h4v-5h2v5h4a2 2 0 0 0 2-2v-8" />
    </svg>
  `,
  personal: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
    </svg>
  `,
  projects: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 8h4l2-3 2 6 2-3h4" />
      <path d="M5 16h14" />
      <path d="M7 21h10" />
    </svg>
  `,
  hobbies: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm6 0 6-7" />
      <path d="M16 5h4v4M4 20l4-4" />
    </svg>
  `,
  media: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="11" r="2.3" />
      <path d="M13 16l3.5-4 4 5" />
    </svg>
  `,
  templates: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6m-6 4h3" />
    </svg>
  `,
  archive: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="4" rx="1.5" />
      <path d="M5 9v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9" />
      <path d="M10 13h4" />
    </svg>
  `,
  default: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2 2" />
    </svg>
  `,
};

const cardGrid = document.querySelector("#card-grid");
const taskList = document.querySelector("#task-list");
const searchInput = document.querySelector("#search");
const detailView = document.querySelector("#detail-view");
const detailTitle = document.querySelector("#detail-title");
const detailDescription = document.querySelector("#detail-description");
const detailTags = document.querySelector("#detail-tags");
const detailFocus = document.querySelector("#detail-focus");
const detailLinks = document.querySelector("#detail-links");
const detailRoot = document.querySelector("#detail-root");
const detailBack = document.querySelector("#detail-back");
const statElements = document.querySelectorAll("[data-stat]");
const taskSummary = document.querySelector("#task-summary");
const resetButton = document.querySelector("#reset-tasks");
const statsCommandButton = document.querySelector("#copy-stats-command");
const actionFeedback = document.querySelector("#action-feedback");
const cadenceTabs = document.querySelectorAll("[data-cadence-tab]");
const wellbeingFields = {
  source: document.querySelector("#wellbeing-source"),
  latest: document.querySelector("#wellbeing-latest"),
  stress: document.querySelector("#wellbeing-stress"),
  energy: document.querySelector("#wellbeing-energy"),
  focus: document.querySelector("#wellbeing-focus"),
  count: document.querySelector("#wellbeing-count"),
};
const CHECKLIST_STATE_KEY = "lifehub-checklist";
const CHECKLIST_WEEK_KEY = "lifehub-checklist-week";
const CHECKLIST_HISTORY_KEY = "lifehub-checklist-history";
const STATS_COMMAND = "python3 LifeHub/scripts/update_dashboard_stats.py";
const shortcutMap = {
  "/": "SEARCH",
  i: "Inbox",
  w: "Work",
  f: "Family",
  n: "Finance",
  h: "Hobbies",
  m: "Media",
  p: "Projects",
  a: "Archive",
};

let checklistState = loadChecklistState();
let checklistHistory = loadChecklistHistory();
let activeCadence = "All";

function getWeekKey(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - firstDay) / 86400000);
  const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function loadChecklistState() {
  const currentWeek = getWeekKey();
  const storedWeek = localStorage.getItem(CHECKLIST_WEEK_KEY);
  if (storedWeek !== currentWeek) {
    localStorage.setItem(CHECKLIST_WEEK_KEY, currentWeek);
    localStorage.removeItem(CHECKLIST_STATE_KEY);
    return {};
  }
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_STATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadChecklistHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify(state));
}

function saveChecklistHistory(history) {
  localStorage.setItem(CHECKLIST_HISTORY_KEY, JSON.stringify(history));
}

function formatDate(value) {
  if (!value) return "Never";
  try {
    const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
}

function updateTaskSummary() {
  if (!taskSummary) return;
  const sourceTasks = activeCadence === "All" ? tasks : tasks.filter((task) => task.cadence === activeCadence);
  const total = sourceTasks.length;
  const completed = sourceTasks.filter((task) => checklistState[task.id]).length;
  const label = activeCadence === "All" ? "tasks" : `${activeCadence.toLowerCase()} tasks`;
  taskSummary.textContent = total ? `${completed}/${total} ${label} completed` : `No ${label} to track`;
}

function setActionFeedback(message) {
  if (actionFeedback) {
    actionFeedback.textContent = message;
  }
}

async function copyStatsCommand() {
  if (!statsCommandButton) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(STATS_COMMAND);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    setActionFeedback("Copied! Paste into Terminal to refresh stats.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = STATS_COMMAND;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setActionFeedback("Command copied. Paste into Terminal to run it.");
    } catch {
      setActionFeedback("Copy failed — run the command manually.");
    } finally {
      textarea.remove();
    }
  }
}

function renderCards(filter = "") {
  cardGrid.innerHTML = "";
  const query = filter.trim().toLowerCase();
  const visibleCards = cards.filter(({ title, description, tags, links }) => {
    if (!query) return true;
    const haystack = [title, description, tags.join(" "), links.map((link) => link.label).join(" ")]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  if (!visibleCards.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matching area — try another keyword.";
    cardGrid.appendChild(empty);
    return;
  }

  visibleCards.forEach((card) => {
    const el = document.createElement("article");
    el.className = "card";
    const icon = iconMap[card.icon] || iconMap.default;
    el.innerHTML = `
      <div class="card-heading">
        <span class="card-icon" aria-hidden="true">${icon}</span>
        <div>
          <h2>${card.title}</h2>
          <p>${card.description}</p>
        </div>
      </div>
      <ul>
        ${card.links.map((link) => `<li><a href="${link.href}" target="_blank">${link.label}</a></li>`).join("")}
      </ul>
      <div class="taglist">
        ${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <button type="button" data-section="${card.title}">View details</button>
    `;
    cardGrid.appendChild(el);
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = activeCadence === "All" ? tasks : tasks.filter((task) => task.cadence === activeCadence);
  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    const checked = !!checklistState[task.id];
    const history = checklistHistory[task.id];
    const lastCompleted = history?.lastCompleted ? formatDate(history.lastCompleted) : "Not completed yet";
    li.innerHTML = `
      <label>
        <input type="checkbox" data-task="${task.id}" ${checked ? "checked" : ""}>
        <span>${task.label} <small>(${task.cadence})</small></span>
      </label>
      <p class="task-meta">Last done: ${lastCompleted}</p>
    `;
    taskList.appendChild(li);
  });
  if (!visibleTasks.length) {
    const empty = document.createElement("p");
    empty.className = "task-meta";
    empty.textContent = `No ${activeCadence.toLowerCase()} tasks configured yet.`;
    taskList.appendChild(empty);
  }
  updateTaskSummary();
}

function showDetail(sectionName, { updateHash = true } = {}) {
  const card = cards.find((item) => item.title.toLowerCase() === sectionName.toLowerCase());
  if (!card) return;
  detailTitle.textContent = card.title;
  detailDescription.textContent = card.description;
  detailTags.textContent = card.tags.join(", ");
  detailFocus.textContent = card.focus;
  detailLinks.innerHTML = card.links
    .map(
      (link) => `
        <div>
          <a href="${link.href}" target="_blank">${link.label}</a>
          ${link.note ? `<small>${link.note}</small>` : ""}
        </div>
      `
    )
    .join("");
  detailRoot.innerHTML = card.root ? `<a href="${card.root}" target="_blank">Open ${card.title} folder →</a>` : "";
  detailView.classList.add("visible");
  detailView.scrollIntoView({ behavior: "smooth", block: "start" });
  if (updateHash) {
    history.replaceState(null, "", `#${encodeURIComponent(card.title)}`);
  }
}

function hideDetail({ updateHash = true } = {}) {
  detailView.classList.remove("visible");
  if (updateHash) {
    history.replaceState(null, "", window.location.pathname);
  }
}

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    renderCards(event.target.value);
  });

  cardGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-section]");
    if (button) {
      showDetail(button.dataset.section);
    }
  });

  cadenceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCadence = tab.dataset.cadenceTab || "All";
      cadenceTabs.forEach((button) => button.classList.toggle("active", button === tab));
      renderTasks();
    });
  });

  taskList.addEventListener("change", (event) => {
    if (event.target.matches("input[type='checkbox'][data-task]")) {
      const taskId = event.target.dataset.task;
      const checked = event.target.checked;
      checklistState[taskId] = checked;
      saveChecklistState(checklistState);
      if (checked) {
        checklistHistory[taskId] = { lastCompleted: new Date().toISOString(), week: getWeekKey() };
        saveChecklistHistory(checklistHistory);
      }
      renderTasks();
    }
  });

  resetButton?.addEventListener("click", () => {
    checklistState = {};
    saveChecklistState(checklistState);
    renderTasks();
  });

  statsCommandButton?.addEventListener("click", copyStatsCommand);

  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
      return;
    }

    if (isTyping) return;
    const section = shortcutMap[event.key?.toLowerCase()];
    if (section) {
      event.preventDefault();
      showDetail(section);
    }
  });

  detailBack.addEventListener("click", () => hideDetail());

  window.addEventListener("hashchange", handleHashNavigation);
}

function handleHashNavigation() {
  const target = decodeURIComponent(window.location.hash.replace("#", ""));
  if (target) {
    showDetail(target, { updateHash: false });
  } else {
    hideDetail({ updateHash: false });
  }
}

async function loadStats() {
  if (!statElements.length) return;
  try {
    const response = await fetch("dashboard-stats.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load stats: ${response.status}`);
    const stats = await response.json();
    statElements.forEach((node) => {
      const key = node.dataset.stat;
      const value = stats[key];
      node.textContent = typeof value === "number" ? value.toLocaleString() : "0";
    });
  } catch (error) {
    console.error(error);
    statElements.forEach((node) => {
      node.textContent = "N/A";
    });
  }
}

async function loadWellbeing() {
  if (!wellbeingFields.stress) return;
  try {
    const response = await fetch("welltory-summary.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load wellbeing summary: ${response.status}`);
    const summary = await response.json();
    wellbeingFields.source.textContent = summary.sourceFile || "Latest Welltory export";
    wellbeingFields.latest.textContent = summary.latestMeasurement
      ? formatDate(summary.latestMeasurement)
      : "No data";
    wellbeingFields.stress.textContent = summary.stressAverage ?? "--";
    wellbeingFields.energy.textContent = summary.energyAverage ?? "--";
    wellbeingFields.focus.textContent = summary.focusAverage ?? "--";
    wellbeingFields.count.textContent = summary.measurementCount ?? 0;
  } catch (error) {
    console.error(error);
    wellbeingFields.latest.textContent = "Summary unavailable";
  }
}

renderCards();
renderTasks();
bindEvents();
loadStats();
loadWellbeing();
handleHashNavigation();
