const dataSource = window.LIFEHUB_DATA || {};
const ICS_OVERRIDE_KEY = "lifehub-ics-override";
const ICS_OVERRIDE_NAME_KEY = "lifehub-ics-name";
const ICS_OVERRIDE_EVENTS_KEY = "lifehub-ics-override-events";
const ICS_OVERRIDE_MAX_TEXT_LENGTH = 250000; // ~250 KB safety cap
const ICS_OVERRIDE_EVENT_LIMIT = 800;
const inlineData = window.LIFEHUB_INLINE_DATA || {};
const isFileProtocol = window.location.protocol === "file:";
const cards = dataSource.cards || [];
const tasks = dataSource.tasks || [];
const playables = dataSource.playables || [];
const spotlightResources = dataSource.spotlightResources || [];
const automations = dataSource.automations || [];
const agendaConfig = dataSource.agenda || {};
const triageColumns = dataSource.triageColumns || [];
const triageSeeds = dataSource.triageSeeds || [];
const TRIAGE_MOVE_TARGETS = [
  { id: "Work", label: "Work" },
  { id: "Family", label: "Family" },
  { id: "Finance", label: "Finance" },
  { id: "Housing", label: "Housing" },
  { id: "Personal", label: "Personal" },
  { id: "Projects", label: "Projects" },
  { id: "Hobbies", label: "Hobbies" },
  { id: "Media", label: "Media" },
  { id: "Archive", label: "Archive" },
];
const copilotExamples = dataSource.copilotExamples || [];
const backupDestinations = dataSource.backups || [];
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_LOCAL_BASE = "Resources/pyodide/";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
let pyodideBaseUrl = PYODIDE_CDN_BASE;

const getInlineData = (key) =>
  inlineData && Object.prototype.hasOwnProperty.call(inlineData, key) ? inlineData[key] : undefined;

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
const copilotInput = document.querySelector("#copilot-input");
const copilotResults = document.querySelector("#copilot-results");
const copilotClearButton = document.querySelector("#copilot-clear");
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
const tabPanel = document.querySelector("#task-panel");
const taskSparkline = document.querySelector("#task-sparkline");
const resetButton = document.querySelector("#reset-tasks");
const statsCommandButton = document.querySelector("#copy-stats-command");
const actionFeedback = document.querySelector("#action-feedback");
const cadenceTabs = document.querySelectorAll("[data-cadence-tab]");
const checklistTabsContainer = document.querySelector(".checklist-tabs");
const playablesGrid = document.querySelector("#playables-grid");
const playablesCountElement = document.querySelector("#playables-count");
const textGameOutput = document.querySelector("#text-game-output");
const textGameForm = document.querySelector("#text-game-form");
const textGameInput = document.querySelector("#text-game-input");
const textGameStartButton = document.querySelector("#text-game-start");
const textGameStatus = document.querySelector("#text-game-status");
const textGameV2Output = document.querySelector("#text-game-v2-output");
const textGameV2Form = document.querySelector("#text-game-v2-form");
const textGameV2Input = document.querySelector("#text-game-v2-input");
const textGameV2StartButton = document.querySelector("#text-game-v2-start");
const textGameV2Status = document.querySelector("#text-game-v2-status");
const textGameSlotSelect = document.querySelector("#text-game-slot");
const textGameSaveStatus = document.querySelector("#text-game-save-status");
const textGameV2SlotSelect = document.querySelector("#text-game-v2-slot");
const textGameV2SaveStatus = document.querySelector("#text-game-v2-save-status");
const focusToggle = document.querySelector("#focus-toggle");
const kioskToggle = document.querySelector("#kiosk-toggle");
const recentGrid = document.querySelector("#recent-grid");
const recentRefreshButton = document.querySelector("#recent-refresh");
const inboxHealthChart = document.querySelector("#inbox-health-chart");
const inboxHealthSummary = document.querySelector("#inbox-health-summary");
const agendaEventsList = document.querySelector("#agenda-events");
const agendaRemindersList = document.querySelector("#agenda-reminders");
const agendaStatus = document.querySelector("#agenda-status");
const agendaDate = document.querySelector("#agenda-date");
const agendaUploadInput = document.querySelector("#agenda-upload-input");
const agendaUploadStatus = document.querySelector("#agenda-upload-status");
const agendaUploadClearButton = document.querySelector("#agenda-upload-clear");
const spotlightCard = document.querySelector("#spotlight-card");
const spotlightPrev = document.querySelector("#spotlight-prev");
const spotlightNext = document.querySelector("#spotlight-next");
const automationModal = document.querySelector("#automation-modal");
const automationListElement = document.querySelector("#automation-list");
const openAutomationButton = document.querySelector("#open-automation-modal");
const automationCloseButton = document.querySelector("#automation-close");
const AUTOMATION_SERVER_URL = "http://127.0.0.1:8766/run";
window.LIFEHUB_AUTOMATION_URL = AUTOMATION_SERVER_URL;
const automationSchedulerList = document.querySelector("#automation-scheduler-list");
const automationQueueList = document.querySelector("#automation-queue");
const automationStartButton = document.querySelector("#automation-start");
const automationClearButton = document.querySelector("#automation-clear");
const automationStatus = document.querySelector("#automation-status");
const automationLogList = document.querySelector("#automation-log");
const automationPresetsList = document.querySelector("#automation-presets-list");
const automationPresetNameInput = document.querySelector("#automation-preset-name");
const automationSavePresetButton = document.querySelector("#automation-save-preset");
const automationPresetsStatus = document.querySelector("#automation-presets-status");
const automationRunnerStatus = document.querySelector("#automation-runner-status");
const automationDryRunToggle = document.querySelector("#automation-dry-run");
const automationRunLastButton = document.querySelector("#automation-run-last");
const automationPresetImportInput = document.querySelector("#automation-preset-import");
const automationPresetExportButton = document.querySelector("#automation-preset-export");
const commandPalette = document.querySelector("#command-palette");
const commandInput = document.querySelector("#command-input");
const commandResults = document.querySelector("#command-results");
const commandCloseButton = document.querySelector("#command-close");
const readableFontToggle = document.querySelector("#readable-font-toggle");
const shadowToggle = document.querySelector("#shadow-toggle");
const settingsExportButton = document.querySelector("#settings-export");
const settingsImportInput = document.querySelector("#settings-import");
const statusReportExportButton = document.querySelector("#status-report-export");
const timelineList = document.querySelector("#activity-timeline");
const timelineEmpty = document.querySelector("#timeline-empty");
const timelineRefreshButton = document.querySelector("#timeline-refresh");
const timelineModal = document.querySelector("#timeline-modal");
const timelineModalBody = document.querySelector("#timeline-modal-body");
const timelineModalMeta = document.querySelector("#timeline-modal-meta");
const timelineModalClose = document.querySelector("#timeline-modal-close");
const triageGrid = document.querySelector("#triage-grid");
const triageResetButton = document.querySelector("#triage-reset");
const healthList = document.querySelector("#health-list");
const healthRefreshButton = document.querySelector("#health-refresh");
const downloadsList = document.querySelector("#downloads-list");
const downloadsStatus = document.querySelector("#downloads-status");
const downloadsRefreshButton = document.querySelector("#downloads-refresh");
const downloadsTriageList = document.querySelector("#downloads-triage-list");
const downloadsTriageStatus = document.querySelector("#downloads-triage-status");
const downloadsTriageRefreshButton = document.querySelector("#downloads-triage-refresh");
const resurfaceCard = document.querySelector("#resurface-card");
const resurfacePrevButton = document.querySelector("#resurface-prev");
const resurfaceNextButton = document.querySelector("#resurface-next");
const resurfaceFilter = document.querySelector("#resurface-filter");
const resurfaceSnoozeButton = document.querySelector("#resurface-snooze");
const resurfaceSkipButton = document.querySelector("#resurface-skip");
const scratchpadInput = document.querySelector("#scratchpad-input");
const scratchpadCopyButton = document.querySelector("#scratchpad-copy");
const scratchpadDownloadButton = document.querySelector("#scratchpad-download");
const scratchpadClearButton = document.querySelector("#scratchpad-clear");
const scratchpadStatus = document.querySelector("#scratchpad-status");
const scratchpadPromoteButton = document.querySelector("#scratchpad-promote");
const backupList = document.querySelector("#backup-list");
const backupRefreshButton = document.querySelector("#backup-refresh");
const kioskSettingsPanel = document.querySelector("#kiosk-settings");
const kioskOrderList = document.querySelector("#kiosk-order-list");
const kioskIntervalInput = document.querySelector("#kiosk-interval-input");
const kioskSettingsSaveButton = document.querySelector("#kiosk-settings-save");
const kioskPresetButtons = document.querySelectorAll("[data-kiosk-preset]");
const kioskPauseButton = document.querySelector("#kiosk-pause");
const statInsightElements = {
  lifehubSize: document.querySelector("[data-insight='lifehubSize']"),
  inboxChange: document.querySelector("[data-insight='inboxChange']"),
  actionItems: document.querySelector("[data-insight='actionItems']"),
};
const wellbeingFields = {
  source: document.querySelector("#wellbeing-source"),
  latest: document.querySelector("#wellbeing-latest"),
  stress: document.querySelector("#wellbeing-stress"),
  energy: document.querySelector("#wellbeing-energy"),
  focus: document.querySelector("#wellbeing-focus"),
  count: document.querySelector("#wellbeing-count"),
};
const wellbeingTrendSummary = document.querySelector("#wellbeing-trend-summary");
const wellbeingDeltaFields = {
  stress: document.querySelector("#wellbeing-stress-delta"),
  energy: document.querySelector("#wellbeing-energy-delta"),
  focus: document.querySelector("#wellbeing-focus-delta"),
  count: document.querySelector("#wellbeing-count-delta"),
};
const CHECKLIST_STATE_KEY = "lifehub-checklist";
const CHECKLIST_WEEK_KEY = "lifehub-checklist-week";
const CHECKLIST_HISTORY_KEY = "lifehub-checklist-history";
const STATS_COMMAND = "python3 LifeHub/scripts/update_dashboard_stats.py";
const TEXT_GAME_SOURCE_URL = "scripts/fun_text_game_base.py";
const TEXT_GAME_V2_SOURCE_URL = "scripts/fun_text_game_v2.py";
const TEXT_GAME_SAVE_PREFIX = "lifehub-game-save";
const FOCUS_SET_KEY = "lifehub-focus-cards";
const FOCUS_MODE_KEY = "lifehub-focus-mode";
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
const STAT_TARGETS = {
  inboxCount: 20,
  familyHealthCount: 150,
  financeCount: 250,
  projectsCount: 12,
  housingCount: 180,
  mediaCount: 600,
  archiveCount: 500,
  templatesCount: 80,
};
const INVERTED_STATS = new Set(["inboxCount"]);
const AUTOMATION_LOG_KEY = "lifehub-automation-log";
const AUTOMATION_PRESETS_KEY = "lifehub-automation-presets";
const TRIAGE_STATE_KEY = "lifehub-triage-state";
const SCRATCHPAD_KEY = "lifehub-scratchpad";
const KIOSK_MODE_KEY = "lifehub-kiosk-mode";
const KIOSK_ORDER_KEY = "lifehub-kiosk-order";
const KIOSK_INTERVAL_KEY = "lifehub-kiosk-interval";
const AUTOMATION_DRY_RUN_KEY = "lifehub-automation-dryrun";
const AUTOMATION_LAST_QUEUE_KEY = "lifehub-automation-lastqueue";
const READABLE_FONT_KEY = "lifehub-readable-font";
const NO_SHADOWS_KEY = "lifehub-no-shadows";
const SETTINGS_EXPORT_FILENAME = "lifehub-settings.json";
let automationDryRun =
  (function () {
    try {
      return localStorage.getItem(AUTOMATION_DRY_RUN_KEY) === "1";
    } catch (e) {
      return false;
    }
  })();
let kioskPaused = false;
const KIOSK_PRESETS = {
  ops: {
    order: ["search", "timeline", "downloads", "triage", "backup", "resurface"],
    disabled: [],
    label: "Ops sweep",
  },
  inbox: {
    order: ["triage", "downloads", "search"],
    disabled: ["resurface", "backup"],
    label: "Inbox focus",
  },
  showcase: {
    order: ["resurface", "timeline", "backup", "downloads", "search"],
    disabled: [],
    label: "Showcase",
  },
};
const DOWNLOAD_STALE_HOURS = 24;
const DOWNLOAD_TRIAGE_LIMIT = 5;
const DOWNLOAD_TRIAGE_MIN_AGE_HOURS = 4;
const DOWNLOAD_TRIAGE_RULES = [
  { destination: "Finance", test: /(invoice|receipt|statement|tax|paystub|bank|insurance|claim)/i, reason: "Finance keyword match" },
  { destination: "Family", test: /(clinic|medical|therapy|school|consent|report|assessment)/i, reason: "Family/health keyword match" },
  { destination: "Work", test: /(resume|cv|offer|contract|position|job)/i, reason: "Work keyword match" },
  { destination: "Projects", test: /(design|spec|prototype|draft|whirring|project)/i, reason: "Projects keyword match" },
  { destination: "Housing", test: /(lease|rental|property|mortgage|rent)/i, reason: "Housing keyword match" },
  { destination: "Personal", test: /(passport|travel|medicare|license|welltory|fitness)/i, reason: "Personal keyword match" },
];
const DOWNLOAD_TRIAGE_EXTENSION_MAP = {
  pdf: { destination: "Finance", reason: "PDF document" },
  csv: { destination: "Personal", reason: "Data export" },
  png: { destination: "Media", reason: "Image asset" },
  jpg: { destination: "Media", reason: "Image asset" },
  jpeg: { destination: "Media", reason: "Image asset" },
  heic: { destination: "Media", reason: "Photo" },
  mov: { destination: "Media", reason: "Video" },
  mp4: { destination: "Media", reason: "Video" },
  zip: { destination: "Projects", reason: "Archive" },
  doc: { destination: "Work", reason: "Document" },
  docx: { destination: "Work", reason: "Document" },
};
const RESURFACE_THRESHOLD_DAYS = 90;
const DEFAULT_AUTOMATION_PRESETS = [
  {
    id: "preset-weekly-sweep",
    name: "Weekly sweep",
    automations: ["sweep-downloads", "update-stats", "archive-quarter"],
  },
  {
    id: "preset-health-refresh",
    name: "Health refresh",
    automations: ["update-stats"],
  },
];
const WELLBEING_DELTA_META = {
  stress: { label: "Stress", decimals: 1, unit: "pts" },
  energy: { label: "Energy", decimals: 1, unit: "pts" },
  focus: { label: "Focus", decimals: 1, unit: "pts" },
  measurementCount: { label: "Measurements", decimals: 0, unit: "" },
};

let checklistState = loadChecklistState();
let checklistHistory = loadChecklistHistory();
let focusCards = new Set(loadFocusCards());
let focusModeEnabled = localStorage.getItem(FOCUS_MODE_KEY) === "true";
let kioskModeEnabled = localStorage.getItem(KIOSK_MODE_KEY) === "true";
let activeCadence = "All";
let automationQueue = [];
let automationLog = loadAutomationLog();
let automationRunning = false;
let recentFilesCache = null;
let recentFilesFlat = [];
let timelineSources = { events: [], reminders: [], files: [], automations: [], downloads: [], backups: [], wellbeing: [] };
let downloadTriageSuggestions = new Map();
let downloadsPathHint = "";
let automationPresets = loadAutomationPresets();
let triageState = loadTriageState();
let triageCards = [];
let resurfaceEntries = [];
let resurfaceIndex = 0;
const RESURFACE_SNOOZE_KEY = "lifehub-resurface-snoozed";
let resurfaceSnoozed = loadResurfaceSnoozed();
let kioskRotationTimer = null;
let draggedTriageId = null;
const TIMELINE_FILTER_KEY = "lifehub-timeline-filters";
let timelineFilters = loadTimelineFilters();
let kioskPanels = [];
let kioskActiveIndex = 0;
let searchIndex = Array.isArray(getInlineData("searchIndex")) ? getInlineData("searchIndex") : [];
let searchIndexRequested = false;
let kioskRotationInterval = Number(localStorage.getItem(KIOSK_INTERVAL_KEY)) || 8000;

const encodePath = (path) => (path ? encodeURI(path) : "");
const encodeBase64Utf8 = (value) => {
  if (typeof value !== "string") return "";
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  } catch (error) {
    try {
      return btoa(unescape(encodeURIComponent(value)));
    } catch {
      console.warn("Failed to encode base64 argument", error);
      return "";
    }
  }
};
async function fetchJsonWithFallback(url, { cache = "default" } = {}) {
  try {
    const response = await fetch(url, { cache });
    if (!response.ok) throw new Error(`Failed to load ${url} (${response.status})`);
    return await response.json();
  } catch (error) {
    if (window.location.protocol === "file:") {
      return new Promise((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.overrideMimeType("application/json");
          xhr.open("GET", url, true);
          xhr.onload = () => {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (parseError) {
                reject(parseError);
              }
            } else {
              reject(new Error(`Failed to load ${url} (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error(`Failed to load ${url}`));
          xhr.send();
        } catch (xhrError) {
          reject(xhrError);
        }
      });
    }
    throw error;
  }
}

async function fetchTextWithFallback(url, { cache = "default" } = {}) {
  try {
    const response = await fetch(url, { cache });
    if (!response.ok) throw new Error(`Failed to load ${url} (${response.status})`);
    return await response.text();
  } catch (error) {
    if (window.location.protocol === "file:") {
      return new Promise((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.overrideMimeType("text/plain");
          xhr.open("GET", url, true);
          xhr.onload = () => {
            if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Failed to load ${url} (${xhr.status})`));
            }
          };
          xhr.onerror = () => reject(new Error(`Failed to load ${url}`));
          xhr.send();
        } catch (xhrError) {
          reject(xhrError);
        }
      });
    }
    throw error;
  }
}
function normalizeLinkHref(href) {
  if (!href) return "#";
  if (/^(?:[a-z]+:|\/\/)/i.test(href)) return href;
  if (href.endsWith(".html")) return href;
  const cleaned = href.replace(/\/+$/, "");
  const segments = cleaned.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "";
  if (!lastSegment || lastSegment.includes(".")) {
    return href;
  }
  return `${cleaned}/index.html`;
}
const LIFEHUB_WRAPPER = `
import io, sys, json, base64, pickle

def _lifehub_capture(func, *args):
    buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buf
    keep = True
    try:
        result = func(*args)
        keep = True if result is None else bool(result)
    except Exception as exc:
        print(f"[Error] {exc}")
        keep = True
    finally:
        sys.stdout = old_out
        sys.stderr = old_err
    return buf.getvalue(), keep

def lifehub_intro():
    out1, _ = _lifehub_capture(GAME.say, "Welcome to the Whispering Wilds. Type 'help' for commands.")
    out2, _ = _lifehub_capture(GAME.look)
    return out1 + out2

def lifehub_command(line):
    out, keep = _lifehub_capture(GAME.dispatch, line)
    return json.dumps({"output": out, "keep_running": bool(keep)})

def lifehub_room_npcs():
    try:
        room = GAME.room()
        names = list(getattr(room, "npcs", []))
    except Exception:
        names = []
    return json.dumps(names)

def lifehub_save_state():
    return base64.b64encode(pickle.dumps(GAME)).decode("ascii")

def lifehub_load_state(payload):
    global GAME
    GAME = pickle.loads(base64.b64decode(payload))
    return lifehub_intro()
`;
let pyodideInstance = null;
let pyodideV2Instance = null;
let textGameReady = false;
let textGameLoading = false;
let textGameNpcs = [];
let textGameV2Ready = false;
let textGameV2Loading = false;
let textGameV2Npcs = [];
let spotlightIndex = 0;
let spotlightRotation = null;
const gameSourceCache = new Map();
const commandItems = [];
const commandItemMap = new Map();
const DIRECTION_ALIASES = new Set(["n", "s", "e", "w", "north", "south", "east", "west"]);

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

function loadFocusCards() {
  try {
    return JSON.parse(localStorage.getItem(FOCUS_SET_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFocusCards(set) {
  localStorage.setItem(FOCUS_SET_KEY, JSON.stringify(Array.from(set)));
}

async function loadGameSource(url, fallbackKey) {
  const cacheKey = fallbackKey || url;
  if (cacheKey && gameSourceCache.has(cacheKey)) {
    return gameSourceCache.get(cacheKey);
  }
  let source = null;
  const shouldAttemptFetch = url && window.location.protocol !== "file:";
  if (shouldAttemptFetch) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load game source at ${url}`);
      }
      source = (await response.text()).trim();
    } catch (error) {
      console.warn(error);
    }
  } else if (url && !source) {
    console.info(`Skipping fetch for ${url} due to unsupported protocol.`);
  }
  if (!source && fallbackKey && window.LIFEHUB_GAME_SOURCES?.[fallbackKey]) {
    source = window.LIFEHUB_GAME_SOURCES[fallbackKey].trim();
  }
  if (!source) {
    throw new Error(`Game source unavailable (${fallbackKey || url})`);
  }
  if (cacheKey) {
    gameSourceCache.set(cacheKey, source);
  }
  return source;
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "--";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, index);
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

function formatDownloadAge(ageHours) {
  const value = Number(ageHours);
  if (!Number.isFinite(value)) return "Unknown age";
  if (value < 1) return "<1h old";
  if (value < 24) return `${Math.round(value)}h old`;
  const days = Math.round(value / 24);
  return `${days} day${days === 1 ? "" : "s"} old`;
}

function formatRefreshTime(isoTimestamp) {
  if (!isoTimestamp) return "Never";
  try {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return "Unknown";
  }
}

function getRefreshBadgeClass(isoTimestamp) {
  if (!isoTimestamp) return "very-stale";
  try {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffHours = (now - date) / 3600000;
    if (diffHours < 1) return "fresh";
    if (diffHours < 24) return "fresh";
    if (diffHours < 72) return "stale";
    return "very-stale";
  } catch (e) {
    return "very-stale";
  }
}

function createRefreshBadge(isoTimestamp, label = "Refreshed") {
  const badgeClass = getRefreshBadgeClass(isoTimestamp);
  const timeText = formatRefreshTime(isoTimestamp);
  return `<span class="refresh-badge ${badgeClass}" title="Last refresh: ${isoTimestamp || 'Never'}">
    <span class="refresh-badge-indicator"></span>
    <span>${label} ${timeText}</span>
  </span>`;
}

function updateRefreshBadges(stats, recentFiles, welltory, downloads) {
  // Update stats refresh badge
  const statsWidget = document.querySelector('[data-panel="stats"] .panel-header');
  if (statsWidget && stats?.generatedAt) {
    const existing = statsWidget.querySelector('.refresh-badge');
    if (existing) existing.remove();
    statsWidget.insertAdjacentHTML('beforeend', createRefreshBadge(stats.generatedAt, 'Stats'));
  }
  
  // Update recent files refresh badge
  const recentWidget = document.getElementById('recent-files-panel');
  if (recentWidget && recentFiles?.generatedAt) {
    const header = recentWidget.querySelector('.panel-header');
    if (header) {
      const existing = header.querySelector('.refresh-badge');
      if (existing) existing.remove();
      header.insertAdjacentHTML('beforeend', createRefreshBadge(recentFiles.generatedAt, 'Files'));
    }
  }
  
  // Update wellbeing refresh badge
  const wellbeingWidget = document.getElementById('wellbeing-widget');
  if (wellbeingWidget && welltory?.updatedAt) {
    const header = wellbeingWidget.querySelector('.panel-header');
    if (header) {
      const existing = header.querySelector('.refresh-badge');
      if (existing) existing.remove();
      header.insertAdjacentHTML('beforeend', createRefreshBadge(welltory.updatedAt, 'Welltory'));
    }
  }
  
  // Update downloads refresh badge
  const downloadsWidget = document.getElementById('downloads-panel');
  if (downloadsWidget && downloads?.generatedAt) {
    const header = downloadsWidget.querySelector('.panel-header');
    if (header) {
      const existing = header.querySelector('.refresh-badge');
      if (existing) existing.remove();
      header.insertAdjacentHTML('beforeend', createRefreshBadge(downloads.generatedAt, 'Downloads'));
    }
  }
}

function setupAutoRefresh(intervalMinutes = 5) {
  // Auto-refresh data feeds every N minutes
  const intervalMs = intervalMinutes * 60 * 1000;
  let autoRefreshTimer = null;
  let lastRefreshTime = Date.now();

  function performAutoRefresh() {
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    
    // Only refresh if enough time has passed (avoid overlapping refreshes)
    if (timeSinceLastRefresh < intervalMs * 0.8) return;

    lastRefreshTime = Date.now();
    
    // Silently refresh without blocking UI
    Promise.all([
      loadStats().catch(() => {}),
      loadWellbeing().catch(() => {}),
      loadRecentFiles({ force: true }).catch(() => {}),
      loadDownloadsWatch({ force: true }).catch(() => {})
    ]).then(() => {
      updateAllRefreshBadges().catch(() => {});
    }).catch(error => {
      console.debug('Auto-refresh completed with some errors:', error);
    });
  }

  // Start auto-refresh timer
  autoRefreshTimer = setInterval(performAutoRefresh, intervalMs);

  // Allow manual stop/restart if needed
  window.stopAutoRefresh = () => {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  };

  window.restartAutoRefresh = () => {
    autoRefreshTimer = setInterval(performAutoRefresh, intervalMs);
  };

  // Pause auto-refresh when user is typing (don't refresh during active work)
  let typingTimeout = null;
  document.addEventListener('input', () => {
    window.stopAutoRefresh?.();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      window.restartAutoRefresh?.();
    }, 60000); // Resume after 1 minute of inactivity
  }, true);

  console.log(`Auto-refresh enabled: every ${intervalMinutes} minutes`);
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

function appendTextGameOutput(text) {
  if (!textGameOutput || !text) return;
  const chunk = document.createElement("pre");
  chunk.textContent = text.trim();
  textGameOutput.appendChild(chunk);
  textGameOutput.scrollTop = textGameOutput.scrollHeight;
}

function setTextGameStatus(message) {
  if (textGameStatus) {
    textGameStatus.textContent = message;
  }
}

function appendTextGameV2Output(text) {
  if (!textGameV2Output || !text) return;
  const chunk = document.createElement("pre");
  chunk.textContent = text.trim();
  textGameV2Output.appendChild(chunk);
  textGameV2Output.scrollTop = textGameV2Output.scrollHeight;
}

function setTextGameV2Status(message) {
  if (textGameV2Status) {
    textGameV2Status.textContent = message;
  }
}

function loadPyodideScript() {
  if (window.loadPyodide) {
    return Promise.resolve();
  }
  const sources = [
    { script: `${PYODIDE_LOCAL_BASE}pyodide.js`, base: PYODIDE_LOCAL_BASE },
    { script: `${PYODIDE_CDN_BASE}pyodide.js`, base: PYODIDE_CDN_BASE },
  ];
  return new Promise((resolve, reject) => {
    const trySource = (index) => {
      if (index >= sources.length) {
        reject(new Error("Failed to load Pyodide runtime"));
        return;
      }
      const source = sources[index];
      const script = document.createElement("script");
      script.src = source.script;
      script.onload = () => {
        pyodideBaseUrl = source.base;
        resolve();
      };
      script.onerror = () => {
        script.remove();
        trySource(index + 1);
      };
      document.head.appendChild(script);
    };
    trySource(0);
  });
}

async function ensurePyodideInstance() {
  if (pyodideInstance) return pyodideInstance;
  await loadPyodideScript();
  pyodideInstance = await loadPyodide({ indexURL: pyodideBaseUrl });
  return pyodideInstance;
}

async function ensurePyodideV2Instance() {
  if (pyodideV2Instance) return pyodideV2Instance;
  await loadPyodideScript();
  pyodideV2Instance = await loadPyodide({ indexURL: pyodideBaseUrl });
  return pyodideV2Instance;
}

async function refreshTextGameNpcs() {
  if (!pyodideInstance) {
    textGameNpcs = [];
    return;
  }
  try {
    const raw = await pyodideInstance.runPythonAsync("lifehub_room_npcs()");
    const parsed = JSON.parse(raw);
    textGameNpcs = Array.isArray(parsed) ? parsed : [];
  } catch {
    textGameNpcs = [];
  }
}

async function refreshTextGameV2Npcs() {
  if (!pyodideV2Instance) {
    textGameV2Npcs = [];
    return;
  }
  try {
    const raw = await pyodideV2Instance.runPythonAsync("lifehub_room_npcs()");
    const parsed = JSON.parse(raw);
    textGameV2Npcs = Array.isArray(parsed) ? parsed : [];
  } catch {
    textGameV2Npcs = [];
  }
}

async function initTextGameEngine() {
  if (textGameReady || textGameLoading) return;
  textGameLoading = true;
  if (textGameStartButton) {
    textGameStartButton.textContent = "Loading…";
  }
  try {
    setTextGameStatus("Loading Pyodide runtime and text adventure…");
    const pyodide = await ensurePyodideInstance();
    const loadedSource = await loadGameSource(TEXT_GAME_SOURCE_URL, "base");
    let pythonSource = loadedSource;
    const runnerIndex = pythonSource.indexOf("# ===========================\n# SINGLE RUNNER");
    if (runnerIndex > -1) {
      pythonSource = pythonSource.slice(0, runnerIndex);
    }
    const fullSource = `${pythonSource}\nGAME = Game()\n${LIFEHUB_WRAPPER}`;
    await pyodide.runPythonAsync(fullSource);
    const intro = await pyodide.runPythonAsync("lifehub_intro()");
    appendTextGameOutput(intro);
    await refreshTextGameNpcs();
    textGameReady = true;
    setTextGameStatus("Game ready. Enter commands below.");
    if (textGameInput) {
      textGameInput.disabled = false;
      textGameInput.focus();
    }
    const formButton = textGameForm?.querySelector("button");
    if (formButton) {
      formButton.disabled = false;
    }
    if (textGameStartButton) {
      textGameStartButton.textContent = "Loaded";
      textGameStartButton.disabled = true;
    }
  } catch (error) {
    console.error(error);
    setTextGameStatus(
      "Failed to load the Python game. Check your internet connection and reload the dashboard to try again."
    );
    if (textGameStartButton) {
      textGameStartButton.disabled = false;
      textGameStartButton.textContent = "Retry Load";
    }
  } finally {
    textGameLoading = false;
  }
}

function normalizeGameInput(line, npcs = []) {
  const raw = (line || "").trim();
  if (!raw) return { command: "" };
  const lower = raw.toLowerCase();
  if (["inventory", "inv", "backpack", "bag", "pack"].includes(lower)) {
    return { command: "inv" };
  }
  if (DIRECTION_ALIASES.has(lower)) {
    const short = lower[0];
    return { command: `move ${short}` };
  }
  if (/^\\d+$/.test(lower)) {
    return { command: `say ${lower}` };
  }
  if (lower === "unlock" || lower === "unlock gate") {
    return { command: "use rusty key", autoMessage: "You test the rusty key in the gate." };
  }
  if (lower === "talk") {
    if (npcs.length === 1) {
      const npc = npcs[0];
      return { command: `talk ${npc}`, autoMessage: `You approach ${npc}.` };
    }
    if (npcs.length > 1) {
      return { command: "", statusHint: `Multiple NPCs nearby: ${npcs.join(", ")}. Try “talk name”.` };
    }
  }
  return { command: raw };
}

function normalizeTextGameInput(line) {
  return normalizeGameInput(line, textGameNpcs);
}

function normalizeTextGameV2Input(line) {
  return normalizeGameInput(line, textGameV2Npcs);
}

async function sendTextGameCommand(line) {
  if (!pyodideInstance || !textGameReady) return;
  const normalized = normalizeTextGameInput(line);
  if (normalized.statusHint) {
    setTextGameStatus(normalized.statusHint);
  }
  if (!normalized.command) return;
  if (normalized.autoMessage) {
    appendTextGameOutput(normalized.autoMessage);
  }
  const escaped = JSON.stringify(normalized.command);
  const resultJson = await pyodideInstance.runPythonAsync(`lifehub_command(${escaped})`);
  const data = JSON.parse(resultJson);
  appendTextGameOutput(data.output || "");
  await refreshTextGameNpcs();
  if (data.keep_running) {
    setTextGameStatus("Game ready. Enter commands below.");
  }
  if (!data.keep_running) {
    setTextGameStatus("Game ended. Refresh or click Start Game to play again.");
    if (textGameInput) textGameInput.disabled = true;
    const formButton = textGameForm?.querySelector("button");
    if (formButton) formButton.disabled = true;
  }
}

async function initTextGameEngineV2() {
  if (textGameV2Ready || textGameV2Loading) return;
  textGameV2Loading = true;
  if (textGameV2StartButton) {
    textGameV2StartButton.textContent = "Loading…";
  }
  try {
    setTextGameV2Status("Loading Pyodide runtime and v2 game…");
    const pyodide = await ensurePyodideV2Instance();
    const loadedSource = await loadGameSource(TEXT_GAME_V2_SOURCE_URL, "v2");
    let pythonSource = loadedSource;
    const runnerIndex = pythonSource.indexOf("# ===========================\n# SINGLE RUNNER");
    if (runnerIndex > -1) {
      pythonSource = pythonSource.slice(0, runnerIndex);
    }
    const fullSource = `${pythonSource}\nGAME = Game()\n${LIFEHUB_WRAPPER}`;
    await pyodide.runPythonAsync(fullSource);
    const intro = await pyodide.runPythonAsync("lifehub_intro()");
    appendTextGameV2Output(intro);
    await refreshTextGameV2Npcs();
    textGameV2Ready = true;
    setTextGameV2Status("Game ready. Enter commands below.");
    if (textGameV2Input) {
      textGameV2Input.disabled = false;
      textGameV2Input.focus();
    }
    const formButton = textGameV2Form?.querySelector("button");
    if (formButton) {
      formButton.disabled = false;
    }
    if (textGameV2StartButton) {
      textGameV2StartButton.textContent = "Loaded";
      textGameV2StartButton.disabled = true;
    }
  } catch (error) {
    console.error(error);
    setTextGameV2Status(
      "Failed to load the v2 Python game. Check your internet connection and reload the dashboard to try again."
    );
    if (textGameV2StartButton) {
      textGameV2StartButton.disabled = false;
      textGameV2StartButton.textContent = "Retry Load";
    }
  } finally {
    textGameV2Loading = false;
  }
}

async function sendTextGameCommandV2(line) {
  if (!pyodideV2Instance || !textGameV2Ready) return;
  const normalized = normalizeTextGameV2Input(line);
  if (normalized.statusHint) {
    setTextGameV2Status(normalized.statusHint);
  }
  if (!normalized.command) return;
  if (normalized.autoMessage) {
    appendTextGameV2Output(normalized.autoMessage);
  }
  const escaped = JSON.stringify(normalized.command);
  const resultJson = await pyodideV2Instance.runPythonAsync(`lifehub_command(${escaped})`);
  const data = JSON.parse(resultJson);
  appendTextGameV2Output(data.output || "");
  await refreshTextGameV2Npcs();
  if (data.keep_running) {
    setTextGameV2Status("Game ready. Enter commands below.");
  }
  if (!data.keep_running) {
    setTextGameV2Status("Game ended. Refresh or click Start v2 to play again.");
    if (textGameV2Input) textGameV2Input.disabled = true;
    const formButton = textGameV2Form?.querySelector("button");
    if (formButton) formButton.disabled = true;
  }
}

function getGameSlot(variant) {
  const select = variant === "v2" ? textGameV2SlotSelect : textGameSlotSelect;
  return select?.value || "slotA";
}

async function saveGameState(variant = "base") {
  const slot = getGameSlot(variant);
  const statusElement = variant === "v2" ? textGameV2SaveStatus : textGameSaveStatus;
  const pyodide = variant === "v2" ? pyodideV2Instance : pyodideInstance;
  if (!pyodide || (variant === "v2" ? !textGameV2Ready : !textGameReady)) {
    statusElement.textContent = "Start the game before saving.";
    return;
  }
  try {
    const payload = await pyodide.runPythonAsync("lifehub_save_state()");
    localStorage.setItem(`${TEXT_GAME_SAVE_PREFIX}-${variant}-${slot}`, payload);
    statusElement.textContent = `Saved to ${slot.toUpperCase()}.`;
  } catch (error) {
    console.error(error);
    statusElement.textContent = "Save failed.";
  }
}

async function loadGameState(variant = "base") {
  const slot = getGameSlot(variant);
  const statusElement = variant === "v2" ? textGameV2SaveStatus : textGameSaveStatus;
  const pyodide = variant === "v2" ? pyodideV2Instance : pyodideInstance;
  if (!pyodide || (variant === "v2" ? !textGameV2Ready : !textGameReady)) {
    statusElement.textContent = "Start the game before loading.";
    return;
  }
  const payload = localStorage.getItem(`${TEXT_GAME_SAVE_PREFIX}-${variant}-${slot}`);
  if (!payload) {
    statusElement.textContent = "Slot empty.";
    return;
  }
  try {
    const result = await pyodide.runPythonAsync(`lifehub_load_state(${JSON.stringify(payload)})`);
    if (variant === "v2") {
      appendTextGameV2Output(result || "Loaded save.");
      setTextGameV2Status("Save loaded.");
    } else {
      appendTextGameOutput(result || "Loaded save.");
      setTextGameStatus("Save loaded.");
    }
    await (variant === "v2" ? refreshTextGameV2Npcs() : refreshTextGameNpcs());
    statusElement.textContent = `Loaded ${slot.toUpperCase()}.`;
  } catch (error) {
    console.error(error);
    statusElement.textContent = "Failed to load save.";
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

function cardMatchesQuery(card, tokens) {
  if (!tokens.length) return true;
  const haystack = [
    card.title,
    card.description,
    card.focus,
    (card.tags || []).join(" "),
    (card.keywords || []).join(" "),
    card.links?.map((link) => link.label).join(" "),
    card.snippet || "",
  ]
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function renderCards(filter = "") {
  if (!cardGrid) return;
  cardGrid.innerHTML = "";
  const query = filter.trim().toLowerCase();
  const tokens = query.split(/\s+/).filter(Boolean);
  let visibleCards = cards.filter((card) => cardMatchesQuery(card, tokens));
  if (focusModeEnabled) {
    visibleCards = visibleCards.filter((card) => focusCards.has(card.title));
  }

  if (!visibleCards.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = focusModeEnabled
      ? "No focus cards yet. Pin a few areas, then toggle Focus mode."
      : "No matching area — try another keyword.";
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
          ${card.snippet ? `<p class="card-snippet">${card.snippet}</p>` : ""}
        </div>
      </div>
      <ul>
        ${card.links
          .map((link) => `<li><a href="${normalizeLinkHref(link.href)}" target="_blank">${link.label}</a></li>`)
          .join("")}
      </ul>
      <div class="taglist">
        ${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button type="button" class="focus-pin" data-focus-card="${card.title}" aria-pressed="${
      focusCards.has(card.title) ? "true" : "false"
    }">
          ${focusCards.has(card.title) ? "Pinned" : "Pin to focus"}
        </button>
        <button type="button" data-section="${card.title}">View details</button>
      </div>
    `;
    cardGrid.appendChild(el);
  });
}

function updateFocusToggle() {
  if (!focusToggle) return;
  focusToggle.setAttribute("aria-pressed", String(focusModeEnabled));
  focusToggle.textContent = focusModeEnabled ? "Focus mode: On" : "Focus mode: Off";
}

function toggleFocusMode() {
  focusModeEnabled = !focusModeEnabled;
  localStorage.setItem(FOCUS_MODE_KEY, String(focusModeEnabled));
  updateFocusToggle();
  renderCards(searchInput?.value || "");
}

function toggleFocusCard(title) {
  if (!title) return;
  if (focusCards.has(title)) {
    focusCards.delete(title);
  } else {
    focusCards.add(title);
  }
  saveFocusCards(focusCards);
  renderCards(searchInput?.value || "");
}

function setActiveCadenceTab(tab, { focus = false } = {}) {
  if (!tab) return;
  activeCadence = tab.dataset.cadenceTab || "All";
  cadenceTabs.forEach((button) => {
    const isActive = button === tab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
  if (tabPanel && tab.id) {
    tabPanel.setAttribute("aria-labelledby", tab.id);
  }
  renderTasks();
  if (focus) {
    tab.focus();
  }
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
  renderTaskSparkline();
}

function listRecentWeekKeys(count = 8) {
  const keys = [];
  const date = new Date();
  for (let i = 0; i < count; i++) {
    keys.unshift(getWeekKey(new Date(date)));
    date.setDate(date.getDate() - 7);
  }
  return keys;
}

function renderTaskSparkline() {
  if (!taskSparkline) return;
  let canvas = taskSparkline.querySelector("canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    taskSparkline.appendChild(canvas);
  }
  const width = taskSparkline.clientWidth || 240;
  const height = taskSparkline.clientHeight || 50;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  const weeks = listRecentWeekKeys(8);
  const values = weeks.map((week) => {
    let count = 0;
    Object.values(checklistHistory || {}).forEach((entry) => {
      if (entry?.week === week) count += 1;
    });
    return count;
  });
  const maxValue = Math.max(...values, 1);
  ctx.strokeStyle = "rgba(37, 99, 235, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = (index / (values.length - 1 || 1)) * width;
    const y = height - (value / maxValue) * height;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function renderPlayables() {
  if (!playablesGrid) return;
  if (!playables.length) {
    playablesGrid.innerHTML = "<p class=\"task-meta\">No playable projects registered yet.</p>";
    if (playablesCountElement) playablesCountElement.textContent = "";
    return;
  }
  if (playablesCountElement) {
    playablesCountElement.textContent = `${playables.length} project${playables.length === 1 ? "" : "s"}`;
  }
  playablesGrid.innerHTML = playables
    .map(
      (project) => `
        <article class="playable-card" data-playable="${project.id}">
          <div>
            <h3>${project.name}</h3>
            <p class="playable-meta">${project.type}</p>
          </div>
          <p>${project.description}</p>
          <p class="playable-command">${project.command}</p>
          <div class="playable-actions">
            <button type="button" data-copy-command="${encodeURIComponent(project.command)}">Copy run command</button>
            ${
              project.entry
                ? `<a href="${encodePath(project.entry)}" target="_blank" rel="noopener">${
                    project.type.includes("Python") ? "Open script" : "Open entry point"
                  }</a>`
                : ""
            }
            ${
              project.folderLink
                ? `<a href="${encodePath(project.folderLink)}" target="_blank" rel="noopener">Open project folder</a>`
                : ""
            }
          </div>
          ${project.notes ? `<p class="playable-meta">${project.notes}</p>` : ""}
        </article>
      `
    )
    .join("");
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
          <a href="${normalizeLinkHref(link.href)}" target="_blank">${link.label}</a>
          ${link.note ? `<small>${link.note}</small>` : ""}
        </div>
      `
    )
    .join("");
  detailRoot.innerHTML = card.root
    ? `<a href="${normalizeLinkHref(card.root)}" target="_blank">Open ${card.title} folder →</a>`
    : "";
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
  automationDryRunToggle && (automationDryRunToggle.checked = automationDryRun);
  searchInput.addEventListener("input", (event) => {
    renderCards(event.target.value);
  });

  cardGrid.addEventListener("click", (event) => {
    const pinButton = event.target.closest("button.focus-pin");
    if (pinButton) {
      toggleFocusCard(pinButton.dataset.focusCard);
      return;
    }
    const button = event.target.closest("button[data-section]");
    if (button) {
      showDetail(button.dataset.section);
    }
  });

  focusToggle?.addEventListener("click", () => toggleFocusMode());
  kioskToggle?.addEventListener("click", () => toggleKioskMode());
  kioskPresetButtons.forEach((button) => {
    button.addEventListener("click", () => applyKioskPreset(button.dataset.kioskPreset));
  });
  automationDryRunToggle?.addEventListener("change", (event) => {
    const enabled = !!event.target.checked;
    try {
      localStorage.setItem(AUTOMATION_DRY_RUN_KEY, enabled ? "1" : "0");
    } catch (e) {}
    automationDryRun = enabled;
    automationStatus &&
      (automationStatus.textContent = enabled ? "Dry run: will simulate queued automations." : "Dry run off: will execute if runner is up.");
  });
  automationRunLastButton?.addEventListener("click", restoreLastAutomationQueueAndRun);
  copilotInput?.addEventListener("input", (event) => handleCopilotQuery(event.target.value));
  copilotInput?.addEventListener("focus", (event) => {
    if (!event.target.value) {
      handleCopilotQuery("");
    }
  });
  copilotClearButton?.addEventListener("click", () => {
    copilotInput.value = "";
    handleCopilotQuery("");
    copilotInput.focus();
  });
  copilotResults?.addEventListener("click", (event) => {
    const commandButton = event.target.closest("[data-copilot-command]");
    if (!commandButton) return;
    const command = decodeURIComponent(commandButton.dataset.copilotCommand || "");
    if (!command) return;
    navigator.clipboard
      ?.writeText(command)
      .then(() => {
        commandButton.textContent = "Copied!";
        setTimeout(() => (commandButton.textContent = "Copy command"), 1500);
      })
      .catch(() => {
        commandButton.textContent = "Clipboard blocked";
      });
  });

  cadenceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveCadenceTab(tab);
    });
  });

  checklistTabsContainer?.addEventListener("keydown", (event) => {
    const tabs = Array.from(cadenceTabs);
    if (!tabs.length) return;
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (nextIndex !== currentIndex) {
      setActiveCadenceTab(tabs[nextIndex], { focus: true });
    } else {
      tabs[nextIndex].focus();
    }
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
  recentRefreshButton?.addEventListener("click", () => loadRecentFiles({ force: true }));
  timelineRefreshButton?.addEventListener("click", () => refreshTimeline());
  agendaUploadInput?.addEventListener("change", handleAgendaUpload);
  agendaUploadClearButton?.addEventListener("click", () => {
    clearAgendaOverride();
    updateAgendaUploadStatus(null);
    if (agendaUploadInput) agendaUploadInput.value = "";
    loadAgenda();
  });
  spotlightPrev?.addEventListener("click", () => rotateSpotlight(-1));
  spotlightNext?.addEventListener("click", () => rotateSpotlight(1));
  openAutomationButton?.addEventListener("click", openAutomationModal);
  automationCloseButton?.addEventListener("click", closeAutomationModal);
  automationModal?.addEventListener("click", (event) => {
    if (event.target === automationModal) {
      closeAutomationModal();
    }
  });
  automationListElement?.addEventListener("click", (event) => {
    const commandButton = event.target.closest("[data-automation-command]");
    if (commandButton) {
      const command = decodeURIComponent(commandButton.dataset.automationCommand);
      navigator.clipboard
        ?.writeText(command)
        .then(() => {
          commandButton.textContent = "Copied!";
          setTimeout(() => (commandButton.textContent = "Copy command"), 1200);
        })
        .catch(() => {
          commandButton.textContent = "Clipboard blocked";
        });
    }
  });
  automationSchedulerList?.addEventListener("click", (event) => {
    const queueButton = event.target.closest("[data-automation-queue]");
    if (!queueButton) return;
    queueAutomation(queueButton.dataset.automationQueue);
  });
  automationQueueList?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-queue]");
    if (removeButton) {
      removeAutomationFromQueue(removeButton.dataset.removeQueue);
    }
  });
  automationRunLastButton?.addEventListener("click", restoreLastAutomationQueueAndRun);
  kioskPauseButton?.addEventListener("click", toggleKioskPause);
  automationPresetImportInput?.addEventListener("change", handleAutomationPresetImport);
  automationPresetExportButton?.addEventListener("click", handleAutomationPresetExport);
  timelineList?.addEventListener("click", (event) => {
    const item = event.target.closest(".activity-item");
    if (item) {
      openTimelineModal(item);
    }
  });
  timelineModalClose?.addEventListener("click", closeTimelineModal);
  timelineModal?.addEventListener("click", (event) => {
    if (event.target === timelineModal) closeTimelineModal();
  });
  playablesGrid?.addEventListener("click", (event) => {
    const copyButton = event.target.closest("button[data-copy-command]");
    if (copyButton) {
      const decoded = decodeURIComponent(copyButton.dataset.copyCommand);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(decoded)
          .then(() => setActionFeedback("Command copied — paste into Terminal to play."))
          .catch(() => setActionFeedback("Clipboard blocked — copy manually."));
      } else {
        setActionFeedback("Clipboard unavailable — please copy the command manually.");
      }
      event.preventDefault();
    }
  });

  textGameStartButton?.addEventListener("click", () => {
    if (textGameReady || textGameLoading) return;
    textGameStartButton.disabled = true;
    initTextGameEngine();
  });

  textGameForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!textGameInput?.value.trim()) return;
    const command = textGameInput.value.trim();
    appendTextGameOutput(`> ${command}`);
    textGameInput.value = "";
    try {
      await sendTextGameCommand(command);
    } catch (error) {
      console.error(error);
      appendTextGameOutput("[Error] Failed to run command.");
    }
  });

  textGameV2StartButton?.addEventListener("click", () => {
    if (textGameV2Ready || textGameV2Loading) return;
    textGameV2StartButton.disabled = true;
    initTextGameEngineV2();
  });

  textGameV2Form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!textGameV2Input?.value.trim()) return;
    const command = textGameV2Input.value.trim();
    appendTextGameV2Output(`> ${command}`);
    textGameV2Input.value = "";
    try {
      await sendTextGameCommandV2(command);
    } catch (error) {
      console.error(error);
      appendTextGameV2Output("[Error] Failed to run command.");
    }
  });

  document.addEventListener("click", (event) => {
    const saveButton = event.target.closest("button[data-game-save]");
    if (saveButton) {
      const variant = saveButton.dataset.gameSave;
      saveGameState(variant);
    }
    const loadButton = event.target.closest("button[data-game-load]");
    if (loadButton) {
      const variant = loadButton.dataset.gameLoad;
      loadGameState(variant);
    }
  });

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

    if (event.key === "Escape") {
      if (commandPalette?.getAttribute("aria-hidden") === "false") {
        event.preventDefault();
        closeCommandPalette();
        return;
      }
      if (automationModal?.getAttribute("aria-hidden") === "false") {
        event.preventDefault();
        closeAutomationModal();
        return;
      }
    }

    if (isTyping) return;

    // Cmd+T: Jump to Triage
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 't') {
      event.preventDefault();
      const triagePanel = document.getElementById('triage-panel');
      if (triagePanel) {
        triagePanel.scrollIntoView({ behavior: 'smooth' });
        triagePanel.focus();
      }
      return;
    }

    // Cmd+S: Jump to Search / Copilot
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      const searchInput = document.querySelector('input[type="search"]') || commandInput;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Cmd+R: Force refresh all data
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      document.body.classList.add('refreshing');
      Promise.all([
        loadStats(),
        loadWellbeing(),
        loadRecentFiles({ force: true }),
        loadDownloadsWatch({ force: true })
      ]).then(() => {
        updateAllRefreshBadges();
        document.body.classList.remove('refreshing');
      }).catch(e => {
        document.body.classList.remove('refreshing');
        console.error('Refresh failed:', e);
      });
      return;
    }

    if (event.key === "?" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    const section = shortcutMap[event.key?.toLowerCase()];
    if (section) {
      event.preventDefault();
      showDetail(section);
    }
  });

  // Side nav active state + back to top
  const sideNavLinks = Array.from(document.querySelectorAll(".side-nav a"));
  const backToTop = document.getElementById("back-to-top");
  const sectionTargets = sideNavLinks
    .map((link) => {
      const id = link.getAttribute("href") || "";
      if (!id.startsWith("#")) return null;
      const el = document.querySelector(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);
  function updateNavState() {
    const scrollY = window.scrollY + 120;
    sectionTargets.forEach(({ link, el }) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;
      const active = scrollY >= top && scrollY < bottom;
      link.classList.toggle("active", active);
    });
    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 240);
    }
  }
  updateNavState();
  window.addEventListener("scroll", updateNavState, { passive: true });
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  settingsExportButton?.addEventListener("click", exportSettings);
  settingsImportInput?.addEventListener("change", handleSettingsImport);
  statusReportExportButton?.addEventListener("click", exportStatusReport);

  healthRefreshButton?.addEventListener("click", () => {
    refreshTimeline();
    loadWellbeing();
    loadStats();
    loadRecentFiles({ force: true });
    loadDownloadsWatch({ force: true });
    renderHealthPanel();
  });

  commandCloseButton?.addEventListener("click", closeCommandPalette);
  commandPalette?.addEventListener("click", (event) => {
    if (event.target === commandPalette) {
      closeCommandPalette();
    }
  });
  commandResults?.addEventListener("click", (event) => {
    const item = event.target.closest("li[data-command-id]");
    if (item) {
      executeCommandFromEvent(item);
    }
  });
  commandInput?.addEventListener("input", (event) => filterCommandResults(event.target.value));
  commandInput?.addEventListener("keydown", handleCommandInputKeydown);

  triageResetButton?.addEventListener("click", resetTriageBoard);
  triageGrid?.addEventListener("change", handleTriageSelectChange);
  triageGrid?.addEventListener("dragstart", handleTriageDragStart);
  triageGrid?.addEventListener("dragend", handleTriageDragEnd);
  triageGrid?.addEventListener("dragover", handleTriageDragOver);
  triageGrid?.addEventListener("drop", handleTriageDrop);
  triageGrid?.addEventListener("dragenter", handleTriageDragEnter);
  triageGrid?.addEventListener("dragleave", handleTriageDragLeave);

  downloadsRefreshButton?.addEventListener("click", () => loadDownloadsWatch({ force: true }));
  downloadsTriageRefreshButton?.addEventListener("click", () => loadDownloadsWatch({ force: true }));
  downloadsTriageList?.addEventListener("click", handleDownloadsTriageClick);

  resurfacePrevButton?.addEventListener("click", () => rotateResurface(-1));
  resurfaceNextButton?.addEventListener("click", () => rotateResurface(1));
  resurfaceFilter?.addEventListener("change", () => {
    resurfaceIndex = 0;
    renderResurfaceCard();
  });
  resurfaceSnoozeButton?.addEventListener("click", () => snoozeResurfaceEntry(30));
  resurfaceSkipButton?.addEventListener("click", () => rotateResurface(1));

  scratchpadInput?.addEventListener("input", handleScratchpadInput);
  scratchpadCopyButton?.addEventListener("click", copyScratchpad);
  scratchpadDownloadButton?.addEventListener("click", downloadScratchpad);
  scratchpadClearButton?.addEventListener("click", clearScratchpad);
  scratchpadPromoteButton?.addEventListener("click", promoteScratchpadToFile);

  backupRefreshButton?.addEventListener("click", () => renderBackupStatus({ force: true }));
  backupList?.addEventListener("click", handleBackupListClick);
  kioskOrderList?.addEventListener("click", handleKioskOrderListClick);
  kioskSettingsSaveButton?.addEventListener("click", saveKioskSettings);

  detailBack.addEventListener("click", () => hideDetail());

  window.addEventListener("hashchange", handleHashNavigation);

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const sideNav = document.querySelector('.side-nav');
  const showNavToggleOnMobile = () => {
    if (window.innerWidth <= 900) {
      navToggle.style.display = 'block';
    } else {
      navToggle.style.display = 'none';
      sideNav?.classList.remove('mobile-open');
    }
  };
  
  navToggle?.addEventListener('click', () => {
    const isOpen = sideNav?.classList.toggle('mobile-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is clicked
  sideNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      sideNav.classList.remove('mobile-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!sideNav?.contains(e.target) && !navToggle?.contains(e.target)) {
      sideNav?.classList.remove('mobile-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // Check on load and when resizing
  showNavToggleOnMobile();
  window.addEventListener('resize', showNavToggleOnMobile);
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
    let stats = null;
    if (isFileProtocol) {
      stats = getInlineData("stats");
    }
    if (!stats) {
      stats = await fetchJsonWithFallback("dashboard-stats.json", { cache: "no-store" });
    }
    if (!stats) throw new Error("Stats data unavailable");
    statElements.forEach((node) => {
      const key = node.dataset.stat;
      const value = stats[key];
      node.textContent = typeof value === "number" ? value.toLocaleString() : "0";
      const meter = node.parentElement?.querySelector(".stat-meter span");
      if (meter) {
        meter.style.width = `${getStatProgress(key, Number(value) || 0)}%`;
      }
    });
    updateStatInsights(stats);
    renderInboxHealth(stats);
  } catch (error) {
    console.error(error);
    statElements.forEach((node) => {
      node.textContent = "N/A";
    });
    updateStatInsights({});
    renderInboxHealth({});
  }
}

function getStatProgress(key, value) {
  if (!Number.isFinite(value)) return 0;
  const target = STAT_TARGETS[key] || Math.max(value, 1);
  let ratio = target ? Math.min(1, value / target) : 0;
  if (INVERTED_STATS.has(key)) {
    ratio = 1 - ratio;
  }
  return Math.max(0, Math.min(100, ratio * 100));
}

function updateStatInsights(stats = {}) {
  if (statInsightElements.lifehubSize) {
    statInsightElements.lifehubSize.textContent = formatBytes(Number(stats.lifehubSizeBytes || 0));
  }
  const changeValue = Number(stats.inboxWeeklyChange);
  if (statInsightElements.inboxChange) {
    const formatted = Number.isFinite(changeValue) ? `${changeValue > 0 ? "+" : ""}${changeValue}` : "--";
    statInsightElements.inboxChange.textContent = formatted;
    const card = statInsightElements.inboxChange.closest(".stat-insight-card");
    if (card) {
      card.classList.toggle("trend-up", changeValue > 0);
      card.classList.toggle("trend-down", changeValue < 0);
    }
  }
  if (statInsightElements.actionItems) {
    const actionItems = Number(stats.actionItemCount);
    statInsightElements.actionItems.textContent = Number.isFinite(actionItems) ? actionItems.toLocaleString() : "--";
  }
}

function updateWellbeingDeltas(summary = {}) {
  const deltas = summary?.deltas || {};
  setWellbeingDeltaValue(wellbeingDeltaFields.stress, deltas.stress, WELLBEING_DELTA_META.stress);
  setWellbeingDeltaValue(wellbeingDeltaFields.energy, deltas.energy, WELLBEING_DELTA_META.energy);
  setWellbeingDeltaValue(wellbeingDeltaFields.focus, deltas.focus, WELLBEING_DELTA_META.focus);
  setWellbeingDeltaValue(wellbeingDeltaFields.count, deltas.measurementCount, WELLBEING_DELTA_META.measurementCount);
}

function setWellbeingDeltaValue(node, value, meta = {}) {
  if (!node) return;
  const baseClass = "wellbeing-delta";
  if (!Number.isFinite(value) || value === null) {
    node.textContent = "—";
    node.className = `${baseClass} neutral`;
    return;
  }
  if (value === 0) {
    node.textContent = "↔ steady";
    node.className = `${baseClass} neutral`;
    return;
  }
  const decimals = typeof meta.decimals === "number" ? meta.decimals : 1;
  const formatted =
    decimals === 0 ? `${value > 0 ? "+" : ""}${Math.round(value)}` : `${value > 0 ? "+" : ""}${value.toFixed(decimals)}`;
  const unit = meta.unit ? ` ${meta.unit}` : "";
  const arrow = value > 0 ? "↑" : "↓";
  const directionClass = value > 0 ? "positive" : "negative";
  node.textContent = `${arrow} ${formatted}${unit}`;
  node.className = `${baseClass} ${directionClass}`;
}

function buildWellbeingDeltaSummary(deltas = {}, previousMeasurement) {
  const entries = [];
  ["stress", "energy", "focus"].forEach((key) => {
    const value = deltas[key];
    if (!Number.isFinite(value) || value === 0) return;
    const meta = WELLBEING_DELTA_META[key];
    const decimals = typeof meta?.decimals === "number" ? meta.decimals : 1;
    const formatted = decimals === 0 ? Math.round(Math.abs(value)) : Math.abs(value).toFixed(decimals);
    const trend = value > 0 ? "↑" : "↓";
    const unit = meta?.unit ? ` ${meta.unit}` : "";
    entries.push(`${meta?.label || key} ${trend} ${formatted}${unit}`);
  });
  if (Number.isFinite(deltas.measurementCount) && deltas.measurementCount !== 0) {
    const countMeta = WELLBEING_DELTA_META.measurementCount;
    const formatted = Math.abs(Math.round(deltas.measurementCount));
    const trend = deltas.measurementCount > 0 ? "↑" : "↓";
    const unit = countMeta?.unit ? ` ${countMeta.unit}` : "";
    entries.push(`${countMeta?.label || "Measurements"} ${trend} ${formatted}${unit}`);
  }
  if (!entries.length) {
    return previousMeasurement
      ? `Since ${formatDate(previousMeasurement)}: no change detected yet.`
      : "Waiting for previous uploads to compare trends.";
  }
  const intro = previousMeasurement ? `Since ${formatDate(previousMeasurement)}: ` : "Since last import: ";
  return intro + entries.join(", ");
}

function updateWellbeingTrendSummary(summary = {}) {
  if (!wellbeingTrendSummary) return;
  const deltas = summary?.deltas || {};
  const windowLabel = summary?.comparisonWindow || "last upload";
  const parts = [];
  ["stress", "energy", "focus"].forEach((key) => {
    const value = deltas[key];
    const meta = WELLBEING_DELTA_META[key];
    if (!Number.isFinite(value) || value === 0) {
      parts.push(`${meta?.label || key}: steady`);
      return;
    }
    const decimals = typeof meta?.decimals === "number" ? meta.decimals : 1;
    const formatted = decimals === 0 ? Math.round(Math.abs(value)) : Math.abs(value).toFixed(decimals);
    const trend = value > 0 ? "↑" : "↓";
    const unit = meta?.unit ? ` ${meta.unit}` : "";
    parts.push(`${meta?.label || key}: ${trend}${formatted}${unit}`);
  });
  if (Number.isFinite(deltas.measurementCount) && deltas.measurementCount !== 0) {
    const countMeta = WELLBEING_DELTA_META.measurementCount;
    const formatted = Math.abs(Math.round(deltas.measurementCount));
    const trend = deltas.measurementCount > 0 ? "+" : "−";
    const unit = countMeta?.unit ? ` ${countMeta.unit}` : "";
    parts.push(`${countMeta?.label || "Samples"}: ${trend}${formatted}${unit}`);
  }
  if (!parts.length) {
    wellbeingTrendSummary.textContent = summary.previousMeasurement
      ? `Since ${formatDate(summary.previousMeasurement)}: no change detected yet.`
      : "Waiting for previous uploads to compare trends.";
    return;
  }
  const intro = summary.previousMeasurement
    ? `Vs ${formatDate(summary.previousMeasurement)} (${windowLabel}): `
    : `Vs ${windowLabel}: `;
  wellbeingTrendSummary.textContent = intro + parts.join(" · ");
}

function renderInboxHealth(stats = {}) {
  if (!inboxHealthChart) return;
  const trend = Array.isArray(stats.inboxTrend) ? stats.inboxTrend : [];
  if (!trend.length) {
    inboxHealthChart.innerHTML =
      '<p class="task-meta">No weekly snapshots yet. Run refresh-all over a few weeks to unlock Inbox health.</p>';
    if (inboxHealthSummary) {
      inboxHealthSummary.textContent = "Need additional data points to chart adds vs clears.";
    }
    return;
  }
  const maxValue = Math.max(
    1,
    ...trend.map((item) => Math.max(Number(item.added) || 0, Number(item.cleared) || 0)),
  );
  inboxHealthChart.innerHTML = "";
  let totalAdded = 0;
  let totalCleared = 0;

  const makeBar = (type, value) => {
    const bar = document.createElement("div");
    if (value > 0) {
      bar.className = `inbox-week-bar ${type}`;
      bar.style.height = `${Math.max(18, Math.round((value / maxValue) * 100))}%`;
      bar.textContent = `${type === "added" ? "+" : "-"}${value}`;
    } else {
      bar.className = "inbox-week-bar empty";
      bar.style.height = "12%";
      bar.textContent = "0";
    }
    return bar;
  };

  trend.forEach((item) => {
    const added = Math.max(0, Math.round(Number(item.added) || 0));
    const cleared = Math.max(0, Math.round(Number(item.cleared) || 0));
    totalAdded += added;
    totalCleared += cleared;

    const week = document.createElement("div");
    week.className = "inbox-week";

    const label = document.createElement("div");
    label.className = "inbox-week-label";
    label.textContent = item.weekLabel || "Week";

    const bars = document.createElement("div");
    bars.className = "inbox-week-bars";
    bars.appendChild(makeBar("added", added));
    bars.appendChild(makeBar("cleared", cleared));

    const count = document.createElement("div");
    count.className = "inbox-week-count";
    const countValue = Number(item.count);
    count.textContent = Number.isFinite(countValue)
      ? `Inbox: ${countValue.toLocaleString()}`
      : `Inbox: ${item.count ?? "--"}`;

    week.appendChild(label);
    week.appendChild(bars);
    week.appendChild(count);
    inboxHealthChart.appendChild(week);
  });

  const firstCount = Number(trend[0]?.count);
  const lastCount = Number(trend[trend.length - 1]?.count);
  const net = Number.isFinite(firstCount) && Number.isFinite(lastCount) ? lastCount - firstCount : 0;
  const direction = net < 0 ? "down" : net > 0 ? "up" : "steady";
  if (inboxHealthSummary) {
    inboxHealthSummary.textContent = `Past ${trend.length} week${
      trend.length === 1 ? "" : "s"
    }: cleared ${totalCleared}, added ${totalAdded}. Inbox ${direction} to ${
      Number.isFinite(lastCount) ? lastCount : "?"
    } items.`;
  }
}

async function loadWellbeing() {
  if (!wellbeingFields.stress) return;
  try {
    let summary = null;
    if (isFileProtocol) {
      summary = getInlineData("wellbeing");
    }
    if (!summary) {
      summary = await fetchJsonWithFallback("welltory-summary.json", { cache: "no-store" });
    }
    if (!summary) throw new Error("Wellbeing summary unavailable");
    wellbeingFields.source.textContent = summary.sourceFile || "Latest Welltory export";
    wellbeingFields.latest.textContent = summary.latestMeasurement
      ? formatDate(summary.latestMeasurement)
      : "No data";
    wellbeingFields.stress.textContent = summary.stressAverage ?? "--";
    wellbeingFields.energy.textContent = summary.energyAverage ?? "--";
    wellbeingFields.focus.textContent = summary.focusAverage ?? "--";
    wellbeingFields.count.textContent = summary.measurementCount ?? 0;
    updateWellbeingDeltas(summary);
    updateWellbeingTrendSummary(summary);
    const measurementDate = summary.latestMeasurement ? new Date(summary.latestMeasurement) : null;
    const wellbeingEntry = measurementDate
      ? [
          {
            type: "wellbeing",
            label: "Welltory import",
            meta: `Latest reading ${measurementDate.toLocaleString([], { month: "short", day: "numeric" })}`,
            time: measurementDate,
          },
        ]
      : [];
    updateTimelineSources("wellbeing", wellbeingEntry);
  } catch (error) {
    console.error(error);
    wellbeingFields.latest.textContent = "Summary unavailable";
    updateTimelineSources("wellbeing", []);
    updateWellbeingDeltas({});
  }
}

async function loadRecentFiles({ force = false } = {}) {
  if (!recentGrid) return;
  recentGrid.innerHTML = "<p class=\"task-meta\">Loading recent files…</p>";
  const inlinePayload = isFileProtocol ? getInlineData("recentFiles") : null;
  if (isFileProtocol) {
    if (inlinePayload) {
      applyRecentFilesPayload(inlinePayload);
      return;
    }
    recentGrid.innerHTML =
      "<p class=\"task-meta\">Recent file snapshot missing — run scripts/refresh_all.sh to rebuild dashboard-inline-data.js.</p>";
    return;
  }
  try {
    const response = await fetch("recent-files.json", { cache: force ? "no-store" : "default" });
    if (!response.ok) throw new Error(`Failed to load recent files (${response.status})`);
    const payload = await response.json();
    applyRecentFilesPayload(payload);
  } catch (error) {
    console.error(error);
    loadRecentFilesViaXhr();
  }
}

function applyRecentFilesPayload(payload) {
  if (!payload) {
    recentGrid.innerHTML = "<p class=\"task-meta\">Recent file list unavailable — run generate_recent_files.py.</p>";
    return;
  }
  recentFilesCache = payload;
  recentFilesFlat = flattenRecentFiles(payload);
  renderRecentFiles(payload);
  updateTimelineSources("files", buildTimelineFromFiles(recentFilesFlat));
  buildTriageCards();
  buildResurfaceEntries();
  handleCopilotQuery(copilotInput?.value || "");
}

function loadRecentFilesViaXhr() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", "recent-files.json");
    xhr.onload = () => {
      if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
        try {
          const payload = JSON.parse(xhr.responseText);
          applyRecentFilesPayload(payload);
        } catch (error) {
          console.error(error);
          recentGrid.innerHTML = "<p class=\"task-meta\">Recent files JSON unreadable — rerun generate_recent_files.py.</p>";
        }
      } else {
        recentGrid.innerHTML = "<p class=\"task-meta\">Recent files unavailable — serve dashboard via http://localhost.</p>";
      }
    };
    xhr.onerror = () => {
      recentGrid.innerHTML = "<p class=\"task-meta\">Recent files unavailable — serve dashboard via http://localhost.</p>";
    };
    xhr.send();
  } catch (error) {
    console.error(error);
    recentGrid.innerHTML = "<p class=\"task-meta\">Recent files unavailable — serve dashboard via http://localhost.</p>";
  }
}

function renderRecentFiles(payload) {
  const fragment = document.createDocumentFragment();
  const entries = Object.entries(payload || {});
  if (!entries.length) {
    recentGrid.innerHTML = "<p class=\"task-meta\">No recent entries found.</p>";
    return;
  }
  entries.forEach(([area, files]) => {
    const card = document.createElement("article");
    card.className = "recent-card";
    card.innerHTML = `
      <h3>${area}</h3>
      ${
        files.length
          ? `<ul>${files
              .map(
                (file) =>
                  `<li><a href="${encodePath(file.path)}" target="_blank">${file.path}</a><br><small>${formatDate(
                    file.modified
                  )}</small></li>`
              )
              .join("")}</ul>`
          : `<p class="task-meta">No recent changes.</p>`
      }
    `;
    fragment.appendChild(card);
  });
  recentGrid.innerHTML = "";
  recentGrid.appendChild(fragment);
}

async function updateAllRefreshBadges() {
  // Load all data sources and update their refresh badges
  try {
    let stats = null, recentFiles = null, welltory = null, downloads = null;
    
    if (isFileProtocol) {
      stats = getInlineData("stats");
      recentFiles = getInlineData("recentFiles");
      welltory = getInlineData("wellbeing");
      downloads = getInlineData("downloads");
    }
    
    if (!stats) {
      stats = await fetchJsonWithFallback("dashboard-stats.json", { cache: "no-store" }).catch(() => ({}));
    }
    if (!recentFiles) {
      recentFiles = await fetchJsonWithFallback("recent-files.json", { cache: "no-store" }).catch(() => ({}));
    }
    if (!welltory) {
      welltory = await fetchJsonWithFallback("welltory-summary.json", { cache: "no-store" }).catch(() => ({}));
    }
    if (!downloads) {
      downloads = await fetchJsonWithFallback("downloads-feed.json", { cache: "no-store" }).catch(() => ({}));
    }
    
    updateRefreshBadges(stats, recentFiles, welltory, downloads);
  } catch (error) {
    console.debug("Could not load refresh badge data:", error);
  }
}

async function loadAgenda() {
  if (!agendaEventsList || !agendaRemindersList) return;
  const today = new Date();
  agendaDate.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(
    today
  );
  try {
    let events = [];
    const override = getAgendaOverride();
    let calendarText = override?.text;
    updateAgendaUploadStatus(override);
    if (override?.events?.length) {
      events = filterEventsForDate(override.events, today);
    }
    if (!events.length) {
      if (!calendarText) {
        if (isFileProtocol) {
          calendarText = getInlineData("calendarIcs");
        }
        if (!calendarText && agendaConfig.icsPath) {
          calendarText = await fetchTextWithFallback(agendaConfig.icsPath, { cache: "no-store" });
        }
      }
      if (isFileProtocol) {
        // inlineData lookup already attempted above
      }
      if (calendarText) {
        events = parseIcsEvents(calendarText, today);
      }
    }
    let reminders = [];
    if (agendaConfig.remindersPath) {
      let reminderPayload = null;
      if (isFileProtocol) {
        reminderPayload = getInlineData("agendaReminders");
      }
      if (!reminderPayload) {
        reminderPayload = await fetchJsonWithFallback(agendaConfig.remindersPath, { cache: "no-store" });
      }
      reminders = reminderPayload?.reminders || [];
    }
    renderAgenda(events, reminders, today);
    const eventEntries = events.map((event) => {
      const start = event.start instanceof Date ? event.start : new Date(event.start);
      const end = event.end instanceof Date ? event.end : new Date(event.end || event.start);
      const timeLabel = event.allDay
        ? "All day"
        : `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
      return {
        type: "event",
        label: event.summary || "Calendar event",
        meta: timeLabel,
        time: start,
      };
    });
    const reminderEntries = reminders.map((reminder) => ({
      type: "reminder",
      label: reminder.title || "Reminder",
      meta: reminder.notes || "",
      time: today,
    }));
    updateTimelineSources("events", eventEntries);
    updateTimelineSources("reminders", reminderEntries);
    if (override?.name) {
      const snapshotNote = override.mode === "compact" && !override.text ? " (snapshot)" : "";
      agendaStatus && (agendaStatus.textContent = `Agenda updated from ${override.name}${snapshotNote}`);
    }
  } catch (error) {
    console.error(error);
    agendaStatus && (agendaStatus.textContent = "Agenda unavailable — check the ICS path.");
  }
}

function renderAgenda(events, reminders) {
  agendaEventsList.innerHTML = "";
  if (!events.length) {
    agendaEventsList.innerHTML = "<li>No calendar events today.</li>";
  } else {
    events
      .sort((a, b) => a.start - b.start)
      .slice(0, 5)
      .forEach((event) => {
        const li = document.createElement("li");
        const timeLabel = event.allDay
          ? "All day"
          : `${event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${event.end.toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}`;
        li.innerHTML = `<strong>${event.summary || "Event"}</strong><br><small>${timeLabel}</small>`;
        agendaEventsList.appendChild(li);
      });
  }

  agendaRemindersList.innerHTML = "";
  if (!reminders.length) {
    agendaRemindersList.innerHTML = "<li>Nothing queued.</li>";
  } else {
    reminders.forEach((reminder) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${reminder.title}</strong><br><small>${reminder.notes || ""}</small>`;
      agendaRemindersList.appendChild(li);
    });
  }
  agendaStatus && (agendaStatus.textContent = "Agenda updated");
}

function setAgendaOverride(text, name = "") {
  let mode = "none";
  let eventsStored = 0;
  try {
    localStorage.setItem(ICS_OVERRIDE_NAME_KEY, name);
  } catch (error) {
    console.warn("Failed to store agenda override name", error);
  }
  try {
    const parsedEvents = buildIcsEvents(text)
      .filter((event) => event?.start && !Number.isNaN(event.start.getTime()))
      .sort((a, b) => a.start - b.start);
    const limitedSlice = parsedEvents.slice(-ICS_OVERRIDE_EVENT_LIMIT);
    const events = limitedSlice
      .map((event) => {
        const end = event.end && !Number.isNaN(event.end.getTime()) ? event.end : event.start;
        const dateKey = event.dateKey || formatDateKey(event.start);
        return {
          summary: event.summary || "",
          start: event.start.toISOString(),
          end: end.toISOString(),
          allDay: Boolean(event.allDay),
          dateKey,
        };
      })
      .filter(Boolean);
    localStorage.setItem(ICS_OVERRIDE_EVENTS_KEY, JSON.stringify(events));
    eventsStored = events.length;
    if (events.length) {
      mode = "compact";
    }
  } catch (error) {
    console.warn("Failed to store compact agenda events", error);
    localStorage.removeItem(ICS_OVERRIDE_EVENTS_KEY);
  }
  if (text && text.length <= ICS_OVERRIDE_MAX_TEXT_LENGTH) {
    try {
      localStorage.setItem(ICS_OVERRIDE_KEY, text);
      mode = "full";
    } catch (error) {
      console.warn("Failed to store agenda override text", error);
      localStorage.removeItem(ICS_OVERRIDE_KEY);
    }
  } else {
    localStorage.removeItem(ICS_OVERRIDE_KEY);
  }
  return { mode, eventsStored };
}

function getAgendaOverride() {
  try {
    const text = localStorage.getItem(ICS_OVERRIDE_KEY);
    const name = localStorage.getItem(ICS_OVERRIDE_NAME_KEY) || "Uploaded calendar";
    let events = null;
    const serializedEvents = localStorage.getItem(ICS_OVERRIDE_EVENTS_KEY);
    if (serializedEvents) {
      try {
        const parsed = JSON.parse(serializedEvents);
        if (Array.isArray(parsed)) {
          events = parsed
            .map((event) => {
              if (!event?.start) return null;
              const start = new Date(event.start);
              const end = new Date(event.end || event.start);
              if (Number.isNaN(start.getTime())) return null;
              if (Number.isNaN(end.getTime())) return null;
              const dateKey = event.dateKey || formatDateKey(start);
              return { summary: event.summary, start, end, allDay: Boolean(event.allDay), dateKey };
            })
            .filter(Boolean);
        }
      } catch (error) {
        console.warn("Failed to parse stored agenda events", error);
      }
    }
    if (!text && (!events || !events.length)) return null;
    const mode = text ? "full" : events?.length ? "compact" : "none";
    return { text: text || "", name, events: events || [], mode };
  } catch (error) {
    console.warn("Failed to fetch agenda override", error);
    return null;
  }
}

function clearAgendaOverride() {
  try {
    localStorage.removeItem(ICS_OVERRIDE_KEY);
    localStorage.removeItem(ICS_OVERRIDE_NAME_KEY);
    localStorage.removeItem(ICS_OVERRIDE_EVENTS_KEY);
  } catch (error) {
    console.warn("Failed to clear agenda override", error);
  }
}

function updateAgendaUploadStatus(override) {
  if (!agendaUploadStatus) return;
  if (override?.name) {
    const suffix =
      override.mode === "compact" && !override.text ? " (using compact snapshot)" : override.mode === "full" ? "" : "";
    agendaUploadStatus.textContent = `Using uploaded file${suffix}: ${override.name}`;
  } else if (agendaConfig.icsPath) {
    agendaUploadStatus.textContent = `Using ${agendaConfig.icsPath}`;
  } else {
    agendaUploadStatus.textContent = "Calendar source not configured";
  }
  if (agendaUploadClearButton) {
    agendaUploadClearButton.disabled = !override;
  }
}

function handleAgendaUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result;
    if (typeof text !== "string") return;
    const result = setAgendaOverride(text, file.name);
    if (result.mode === "none") {
      agendaStatus && (agendaStatus.textContent = "Could not store that calendar — try a smaller export or clear browser data.");
      return;
    }
    updateAgendaUploadStatus(getAgendaOverride());
    const snapshotNote = result.mode === "compact" ? " (stored as a compact snapshot)" : "";
    agendaStatus &&
      (agendaStatus.textContent = `Agenda updated from ${file.name}${snapshotNote}${
        result.eventsStored ? ` · ${result.eventsStored} events saved` : ""
      }`);
    loadAgenda();
    if (agendaUploadInput) agendaUploadInput.value = "";
  };
  reader.onerror = () => {
    agendaStatus && (agendaStatus.textContent = "Could not read that .ics file — please try again.");
  };
  reader.readAsText(file);
}

function formatDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIcsEvents(text, targetDate) {
  if (!text) return [];
  const events = buildIcsEvents(text);
  return filterEventsForDate(events, targetDate);
}

function buildIcsEvents(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const unfolded = [];
  lines.forEach((line) => {
    if (/^[ \t]/.test(line) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.trim();
    } else {
      unfolded.push(line);
    }
  });
  const events = [];
  let current = null;
  unfolded.forEach((line) => {
    if (line === "BEGIN:VEVENT") {
      current = {};
      return;
    }
    if (line === "END:VEVENT") {
      if (current) {
        events.push(current);
        current = null;
      }
      return;
    }
    if (!current) return;
    const [key, value] = line.split(":", 2);
    if (!key || value === undefined) return;
    if (key.startsWith("DTSTART")) {
      current.start = parseIcsDate(value);
      current.startRaw = value;
    } else if (key.startsWith("DTEND")) {
      current.end = parseIcsDate(value);
      current.endRaw = value;
    } else if (key.startsWith("SUMMARY")) {
      current.summary = value;
    }
  });
  return events
    .map((event) => {
      const start = event.start;
      const end = event.end || event.start;
      if (!start) return null;
      const allDay = (event.startRaw || "").length === 8;
      const startDate = start instanceof Date ? start : new Date(start);
      const endDate = end instanceof Date ? end : new Date(end);
      if (!Number.isFinite(startDate?.getTime())) return null;
      if (!Number.isFinite(endDate?.getTime())) return null;
      return { summary: event.summary, start: startDate, end: endDate, allDay, dateKey: formatDateKey(startDate) };
    })
    .filter(Boolean);
}

function filterEventsForDate(events, targetDate) {
  if (!events?.length || !targetDate) return [];
  const dateKey = formatDateKey(targetDate);
  return events.filter((event) => {
    if (!event?.start || Number.isNaN(event.start.getTime())) return false;
    const eventKey = event.dateKey || formatDateKey(event.start);
    return eventKey === dateKey;
  });
}

function parseIcsDate(value) {
  if (!value) return null;
  // Handle all-day dates (YYYYMMDD) and date-times (YYYYMMDDTHHMMSSZ)
  if (value.length === 8) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const dateTimeMatch = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (dateTimeMatch) {
    const [, y, m, d, hh, mm, ss, z] = dateTimeMatch;
    if (z) {
      const iso = `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
      const parsed = new Date(iso);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function renderSpotlight() {
  if (!spotlightCard) return;
  if (!spotlightResources.length) {
    spotlightCard.innerHTML = "<p class=\"task-meta\">Add spotlight resources in dashboard-data.js.</p>";
    return;
  }
  if (spotlightIndex >= spotlightResources.length) {
    spotlightIndex = 0;
  }
  const resource = spotlightResources[spotlightIndex];
  spotlightCard.innerHTML = `
    <h3>${resource.title}</h3>
    <p>${resource.description}</p>
    <a href="${encodePath(resource.path)}" target="_blank" rel="noopener">Open resource →</a>
    ${
      resource.tags?.length
        ? `<div class="spotlight-tags">${resource.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`
        : ""
    }
  `;
}

function rotateSpotlight(delta = 1) {
  if (!spotlightResources.length) return;
  spotlightIndex = (spotlightIndex + delta + spotlightResources.length) % spotlightResources.length;
  renderSpotlight();
}

function startSpotlightRotation() {
  if (spotlightRotation) {
    clearInterval(spotlightRotation);
  }
  if (spotlightResources.length > 1) {
    spotlightRotation = setInterval(() => rotateSpotlight(1), 12000);
  }
}

function renderAutomations() {
  if (!automationListElement) return;
  if (!automations.length) {
    automationListElement.innerHTML = "<li>No automations defined yet.</li>";
    return;
  }
  automationListElement.innerHTML = automations
    .map(
      (automation) => `
        <li class="automation-item">
          <header>
            <strong>${automation.label}</strong>
            <span>${automation.description || ""}</span>
          </header>
          <code>${automation.command}</code>
          <button type="button" data-automation-command="${encodeURIComponent(automation.command)}">Copy command</button>
        </li>
      `
    )
    .join("");
}

function openAutomationModal() {
  if (!automationModal) return;
  renderAutomations();
  automationModal.setAttribute("aria-hidden", "false");
  automationCloseButton?.focus();
}

function closeAutomationModal() {
  if (!automationModal) return;
  automationModal.setAttribute("aria-hidden", "true");
  openAutomationButton?.focus();
}

function buildCommandItems() {
  commandItems.length = 0;
  commandItemMap.clear();
  const baseCommands = [
    {
      id: "focus-search",
      label: "Focus search",
      description: "Move cursor to dashboard search",
      keywords: ["search", "jump", "focus"],
      action: () => searchInput?.focus(),
    },
    {
      id: "toggle-focus-mode",
      label: focusModeEnabled ? "Disable focus mode" : "Enable focus mode",
      description: "Collapses dashboard to pinned cards",
      keywords: ["focus", "mode", "cards"],
      action: () => toggleFocusMode(),
    },
    {
      id: "refresh-all",
      label: "Refresh all data",
      description: "Reload stats, agenda, downloads, recent files, wellbeing",
      keywords: ["refresh", "stats", "agenda", "downloads", "recent", "wellbeing"],
      action: () => {
        loadStats();
        loadAgenda();
        loadDownloadsWatch({ force: true });
        loadRecentFiles({ force: true });
        loadWellbeing();
        setActionFeedback("Refreshing data sources…");
      },
    },
    {
      id: "open-health-panel",
      label: "Open System Health",
      description: "Jump to the System Health panel and refresh checks",
      keywords: ["health", "status", "freshness"],
      action: () => {
        document.getElementById("health-panel")?.scrollIntoView({ behavior: "smooth" });
        renderHealthPanel();
      },
    },
    {
      id: "export-status-report",
      label: "Export status report",
      description: "Save a markdown snapshot of stats, wellbeing, timeline, and attention items",
      keywords: ["export", "report", "markdown"],
      action: () => exportStatusReport(),
    },
    {
      id: "toggle-kiosk",
      label: kioskModeEnabled ? "Disable kiosk mode" : "Enable kiosk mode",
      description: "Turn kiosk rotation on/off",
      keywords: ["kiosk", "rotation", "auto"],
      action: () => toggleKioskMode(),
    },
    {
      id: "pause-kiosk",
      label: kioskPaused ? "Resume kiosk rotation" : "Pause kiosk rotation",
      description: "Pause or resume kiosk panel rotation",
      keywords: ["kiosk", "pause", "resume"],
      action: () => toggleKioskPause(),
    },
  ];
  baseCommands.forEach((item) => registerCommand(item));
  cards.forEach((card) => {
    registerCommand({
      id: `card-${card.title}`,
      label: `Open ${card.title}`,
      description: card.description,
      keywords: [card.title, ...(card.tags || []), ...(card.keywords || [])],
      action: () => showDetail(card.title),
    });
  });
  Array.from(document.querySelectorAll(".quick-launch-item")).forEach((item) => {
    const label = item.querySelector(".label")?.textContent || item.dataset.id;
    registerCommand({
      id: `quick-${item.dataset.id}`,
      label: `Quick launch: ${label}`,
      description: item.dataset.href || item.getAttribute("href") || "",
      keywords: ["quick", "launch", label],
      action: () => item.click(),
    });
  });
  automations.forEach((automation) => {
    registerCommand({
      id: `automation-${automation.id}`,
      label: `Copy automation: ${automation.label}`,
      description: automation.description,
      keywords: ["automation", "command", automation.label],
      action: () => navigator.clipboard?.writeText(automation.command),
    });
  });
  automationPresets.forEach((preset) => {
    registerCommand({
      id: `automation-preset-${preset.id}`,
      label: `Run automation preset: ${preset.name}`,
      description: `Queue ${preset.automations.length} step${preset.automations.length === 1 ? "" : "s"}`,
      keywords: ["automation", "preset", preset.name],
      action: () => applyAutomationPreset(preset.id),
    });
  });
  [
    { id: "jump-copilot", label: "Jump: Copilot", target: "#copilot-panel" },
    { id: "jump-automation", label: "Jump: Automation", target: "#automation-scheduler-panel" },
    { id: "jump-timeline", label: "Jump: Timeline", target: "#timeline-panel" },
    { id: "jump-wellbeing", label: "Jump: Wellbeing", target: "#wellbeing-widget" },
    { id: "jump-downloads", label: "Jump: Downloads", target: "#downloads-panel" },
    { id: "jump-resurface", label: "Jump: Resurface", target: "#resurface-panel" },
    { id: "jump-health", label: "Jump: System Health", target: "#health-panel" },
  ].forEach((entry) =>
    registerCommand({
      id: entry.id,
      label: entry.label,
      description: "Scroll to section",
      keywords: ["jump", "section", entry.label],
      action: () => document.querySelector(entry.target)?.scrollIntoView({ behavior: "smooth" }),
    }),
  );
}

function registerCommand(item) {
  commandItems.push(item);
  commandItemMap.set(item.id, item);
}

function openCommandPalette() {
  if (!commandPalette) return;
  buildCommandItems();
  commandPalette.setAttribute("aria-hidden", "false");
  renderCommandResults(commandItems);
  commandInput.value = "";
  commandInput.focus();
}

function closeCommandPalette() {
  if (!commandPalette) return;
  commandPalette.setAttribute("aria-hidden", "true");
  commandInput.value = "";
  commandResults.innerHTML = "";
}

function renderCommandResults(items) {
  commandResults.innerHTML = "";
  const limited = items.slice(0, 8);
  if (!limited.length) {
    commandResults.innerHTML = "<li>No commands match that query.</li>";
    return;
  }
  limited.forEach((item, index) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.dataset.commandId = item.id;
    li.innerHTML = `<strong>${item.label}</strong><br><small>${item.description || ""}</small>`;
    commandResults.appendChild(li);
  });
}

function filterCommandResults(query) {
  if (!query) {
    renderCommandResults(commandItems);
    return;
  }
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = commandItems.filter((item) =>
    tokens.every((token) => `${item.label} ${item.description || ""} ${(item.keywords || []).join(" ")}`.toLowerCase().includes(token))
  );
  renderCommandResults(filtered);
}

function executeCommandFromEvent(target) {
  if (!target?.dataset.commandId) return;
  const item = commandItemMap.get(target.dataset.commandId);
  if (!item) return;
  try {
    item.action?.();
  } finally {
    closeCommandPalette();
  }
}

function handleCommandInputKeydown(event) {
  const items = Array.from(commandResults.querySelectorAll("li[data-command-id]"));
  if (!items.length) return;
  let activeIndex = items.findIndex((item) => item.classList.contains("active"));
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
    setActiveCommandItem(items, activeIndex);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    setActiveCommandItem(items, activeIndex);
  } else if (event.key === "Enter" && activeIndex > -1) {
    event.preventDefault();
    executeCommandFromEvent(items[activeIndex]);
  }
}

function setActiveCommandItem(items, index) {
  items.forEach((item, idx) => item.classList.toggle("active", idx === index));
  items[index]?.scrollIntoView({ block: "nearest" });
}

function handleCopilotQuery(rawQuery = "") {
  if (!copilotResults) return;
  const query = (rawQuery || "").trim().toLowerCase();
  if (!query) {
    renderCopilotSuggestions(buildCopilotHints());
    return;
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  const matches = [];
  const seenPaths = new Set();

  cards.forEach((card) => {
    const score = scoreCardForCopilot(card, tokens);
    if (score <= 0) return;
    const primaryLink = card.links?.[0]?.href || card.root;
    matches.push({
      type: "card",
      score,
      label: `Go to ${card.title}`,
      description: card.description,
      meta: `Tags: ${(card.tags || []).join(", ") || "none"}`,
      href: encodePath(primaryLink),
    });
  });

  recentFilesFlat.forEach((file) => {
    const loweredPath = file.path.toLowerCase();
    const fileScore = tokens.every((token) => loweredPath.includes(token)) ? 2 : tokens.some((token) => loweredPath.includes(token)) ? 1 : 0;
    if (!fileScore) return;
    matches.push({
      type: "file",
      score: fileScore + (file.ageDays ? Math.max(0, 5 - Math.min(5, file.ageDays / 30)) : 0),
      label: `Open ${file.path.split("/").pop()}`,
      description: file.path,
      meta: `Updated ${formatDate(file.modified)} · ${file.area}`,
      href: encodePath(file.path),
    });
    seenPaths.add(loweredPath);
  });

  automations.forEach((automation) => {
    const haystack = `${automation.label} ${automation.description}`.toLowerCase();
    const match = tokens.every((token) => haystack.includes(token));
    if (!match) return;
    matches.push({
      type: "automation",
      score: 5,
      label: `Copy automation: ${automation.label}`,
      description: automation.description,
      meta: automation.command,
      command: automation.command,
    });
  });

  searchIndex.forEach((entry) => {
    if (!entry?.path) return;
    const haystack = `${entry.path} ${entry.snippet || ""}`.toLowerCase();
    const isMatch = tokens.every((token) => haystack.includes(token));
    if (!isMatch) return;
    const pathKey = entry.path.toLowerCase();
    const scoreBoost = seenPaths.has(pathKey) ? 0 : 3;
    matches.push({
      type: "search",
      score: 3 + scoreBoost,
      label: `Search hit: ${entry.path.split("/").pop() || entry.path}`,
      description: entry.snippet || entry.path,
      meta: entry.area ? `${entry.area} · text match` : "Text match",
      href: encodePath(entry.path),
    });
  });

  if (!matches.length) {
    renderCopilotSuggestions([
      {
        type: "hint",
        label: "No matches yet.",
        description: "Try folder names (finance), actions (copy downloads command), or file keywords.",
      },
    ]);
    return;
  }

  matches.sort((a, b) => b.score - a.score);
  renderCopilotSuggestions(matches.slice(0, 8));
}

function renderCopilotSuggestions(items) {
  if (!copilotResults) return;
  copilotResults.innerHTML = "";
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.kind = item.type || "hint";
    const parts = [`<strong>${item.label}</strong>`];
    if (item.description) {
      parts.push(`<p>${item.description}</p>`);
    }
    if (item.meta) {
      parts.push(`<small>${item.meta}</small>`);
    }
    if (item.href) {
      parts.push(`<a href="${item.href}" target="_blank" rel="noopener">Open →</a>`);
    } else if (item.command) {
      parts.push(
        `<button type="button" class="ghost" data-copilot-command="${encodeURIComponent(item.command)}">Copy command</button>`
      );
    }
    li.innerHTML = parts.join("");
    fragment.appendChild(li);
  });
  copilotResults.appendChild(fragment);
}

function scoreCardForCopilot(card, tokens) {
  if (!tokens.length) return 0;
  const haystack = `${card.title} ${card.description || ""} ${(card.tags || []).join(" ")} ${(card.keywords || []).join(" ")}`.toLowerCase();
  let score = 0;
  tokens.forEach((token) => {
    if (haystack.includes(token)) {
      score += 2;
    }
  });
  return score;
}

function buildCopilotHints() {
  if (!copilotExamples.length) {
    return [
      {
        type: "hint",
        label: "Try: show finance invoices",
        description: "You can also ask for reminders or copying automation commands.",
      },
    ];
  }
  return copilotExamples.map((example) => ({
    type: "hint",
    label: example,
    description: "Example prompt",
  }));
}

function prefetchSearchIndex() {
  if (isFileProtocol || searchIndexRequested) return;
  searchIndexRequested = true;
  fetch("search-index.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`search-index.json returned ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      if (Array.isArray(payload)) {
        searchIndex = payload;
      }
    })
    .catch(() => {
      // Ignore fetch errors; inline data already covers file:// mode.
    });
}

function renderAutomationScheduler() {
  if (automationSchedulerList) {
    if (!automations.length) {
      automationSchedulerList.innerHTML = "<li>No automations defined yet.</li>";
    } else {
      automationSchedulerList.innerHTML = automations
        .map(
          (automation) => `
          <li>
            <strong>${automation.label}</strong>
            <p>${automation.description || ""}</p>
            <button type="button" data-automation-queue="${automation.id}">Queue run</button>
          </li>
        `
        )
        .join("");
    }
  }
  renderAutomationQueue();
  renderAutomationLog();
  updateAutomationControls();
  renderAutomationPresets();
}

function queueAutomation(id) {
  const automation = automations.find((item) => item.id === id);
  if (!automation) return;
  const entry = {
    uid: `${id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    automation,
    progress: 0,
    status: "pending",
  };
  automationQueue.push(entry);
  renderAutomationQueue();
}

function removeAutomationFromQueue(uid) {
  if (automationRunning) return;
  automationQueue = automationQueue.filter((item) => item.uid !== uid);
  renderAutomationQueue();
}

function clearAutomationQueue() {
  if (automationRunning) return;
  automationQueue = [];
  renderAutomationQueue();
}

function saveLastAutomationQueue() {
  const ids = automationQueue.map((entry) => entry.automation.id).filter(Boolean);
  if (!ids.length) return;
  try {
    localStorage.setItem(AUTOMATION_LAST_QUEUE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Unable to save last automation queue", e);
  }
}

function restoreLastAutomationQueueAndRun() {
  let ids = [];
  try {
    ids = JSON.parse(localStorage.getItem(AUTOMATION_LAST_QUEUE_KEY) || "[]");
  } catch (e) {
    ids = [];
  }
  if (!Array.isArray(ids) || !ids.length) {
    automationStatus && (automationStatus.textContent = "No saved queue yet — run a batch to save it.");
    return;
  }
  ids.forEach((id) => queueAutomation(id));
  automationStatus && (automationStatus.textContent = "Restored last queue — starting now.");
  startAutomationQueue();
}

async function startAutomationQueue() {
  if (!automationQueue.length || automationRunning) return;
  saveLastAutomationQueue();
  automationRunning = true;
  automationStatus && (automationStatus.textContent = "Running queued automations…");
  automationStartButton && (automationStartButton.disabled = true);
  const ranViaServer = automationDryRun ? false : await runAutomationQueueViaServer();
  if (!ranViaServer) {
    automationStatus &&
      (automationStatus.textContent =
        "Automation runner unavailable — simulating progress (start automation_server.py for real execution).");
    for (const entry of automationQueue) {
      entry.status = "running";
      renderAutomationQueue();
      await runAutomationEntry(entry);
    }
    automationStatus && (automationStatus.textContent = "Batch complete — review Terminal output.");
  }
  automationQueue = [];
  automationRunning = false;
  renderAutomationQueue();
}

function runAutomationEntry(entry) {
  return new Promise((resolve) => {
    const duration = Math.max(10, Number(entry.automation.durationSeconds) || 30) * 1000;
    const startedAt = Date.now();
    entry.progress = 0;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      entry.progress = Math.min(100, Math.round((elapsed / duration) * 100));
      renderAutomationQueue();
      if (elapsed >= duration) {
        clearInterval(timer);
        entry.progress = 100;
        entry.status = "done";
        renderAutomationQueue();
        logAutomationResult({
          id: entry.automation.id,
          label: entry.automation.label,
          command: entry.automation.command,
          finishedAt: new Date().toISOString(),
          exitCode: 0,
        });
        resolve();
      }
    }, 200);
  });
}

async function runAutomationQueueViaServer() {
  if (!automationQueue.length) return false;
  automationQueue.forEach((entry) => {
    entry.status = "running";
    entry.progress = 10;
  });
  renderAutomationQueue();
  try {
    const response = await fetch(AUTOMATION_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: automationQueue.map((entry) => ({
          id: entry.uid,
          label: entry.automation.label,
          command: entry.automation.command,
        })),
      }),
    });
    if (!response.ok) throw new Error(`Automation runner returned ${response.status}`);
    const result = await response.json();
    if (!Array.isArray(result?.runs)) throw new Error("Runner response missing runs array.");
    result.runs.forEach((run) => {
      const matched = automationQueue.find((entry) => entry.uid === run.id || entry.automation.command === run.command);
      if (matched) {
        matched.status = run.exitCode === 0 ? "done" : "error";
        matched.progress = 100;
        matched.exitCode = run.exitCode;
      }
      logAutomationResult({
        id: run.id,
        label: run.label,
        command: run.command,
        finishedAt: run.finishedAt,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
      });
    });
    automationStatus && (automationStatus.textContent = "Batch complete via automation runner.");
    refreshAutomationHistoryFromFile();
    return true;
  } catch (error) {
    console.error(error);
    automationStatus &&
      (automationStatus.textContent = "Automation runner offline — start automation_server.py to execute scripts automatically.");
    return false;
  }
}

function renderAutomationQueue() {
  if (!automationQueueList) return;
  automationQueueList.innerHTML = "";
  if (!automationQueue.length) {
    automationQueueList.innerHTML = "<li>No automations queued.</li>";
    automationStatus && (automationStatus.textContent = "Pick at least one automation to start a batch.");
    updateAutomationControls();
    updateAutomationPresetControls();
    return;
  }
  const fragment = document.createDocumentFragment();
  automationQueue.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.status = item.status;
    li.innerHTML = `
      <strong>${item.automation.label}</strong>
      <p>${item.automation.description || ""}</p>
      ${typeof item.exitCode === "number" ? `<small>Exit code: ${item.exitCode}</small>` : ""}
      <div class="automation-progress"><span style="width:${item.progress}%"></span></div>
      ${
        !automationRunning
          ? `<button type="button" class="ghost" data-remove-queue="${item.uid}">Remove</button>`
          : `<small>${item.status === "running" ? "Running…" : "Queued"}</small>`
      }
    `;
    fragment.appendChild(li);
  });
  automationQueueList.appendChild(fragment);
  updateAutomationControls();
  updateAutomationPresetControls();
}

function updateAutomationControls() {
  if (!automationStartButton) return;
  automationStartButton.disabled = !automationQueue.length || automationRunning;
  automationClearButton && (automationClearButton.disabled = automationRunning || !automationQueue.length);
}

function logAutomationResult(entry) {
  automationLog.unshift({
    id: entry.id || entry.automation?.id,
    label: entry.label || entry.automation?.label,
    command: entry.command || entry.automation?.command,
    finishedAt: entry.finishedAt || new Date().toISOString(),
    exitCode: entry.exitCode,
    durationMs: entry.durationMs,
  });
  automationLog = automationLog.slice(0, 8);
  saveAutomationLog();
  renderAutomationLog();
}

function renderAutomationLog() {
  if (!automationLogList) return;
  if (!automationLog.length) {
    automationLogList.innerHTML = "<li>No runs yet.</li>";
    updateTimelineSources("automations", []);
    return;
  }
  automationLogList.innerHTML = automationLog
    .map(
      (entry) => `
        <li>
          <strong>${entry.label}</strong>
          <small>${formatDate(entry.finishedAt)} · ${entry.command}${typeof entry.exitCode === "number" ? ` (exit ${entry.exitCode})` : ""}</small>
        </li>
      `
    )
    .join("");
  updateTimelineSources("automations", buildAutomationTimelineEntries());
}

async function refreshAutomationHistoryFromFile() {
  try {
    let history = null;
    if (isFileProtocol) {
      history = getInlineData("automationHistory");
    }
    if (!history) {
      const response = await fetch("automation/logs/history.json", { cache: "no-store" });
      if (!response.ok) return;
      history = await response.json();
    }
    if (Array.isArray(history)) {
      automationLog = history.slice(0, 8);
      saveAutomationLog();
      renderAutomationLog();
    }
  } catch (error) {
    console.warn("Failed to load automation history file", error);
  }
}

function loadAutomationLog() {
  try {
    const stored = localStorage.getItem(AUTOMATION_LOG_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse automation log", error);
    return [];
  }
}

function saveAutomationLog() {
  try {
    localStorage.setItem(AUTOMATION_LOG_KEY, JSON.stringify(automationLog));
  } catch (error) {
    console.warn("Failed to save automation log", error);
  }
}

function buildAutomationTimelineEntries(limit = 5) {
  return automationLog.slice(0, limit).map((entry) => {
    const finishedAt = entry.finishedAt ? new Date(entry.finishedAt) : new Date();
    return {
      type: "automation",
      label: entry.label || "Automation run",
      meta: entry.command ? `Command: ${entry.command}` : "",
      time: finishedAt,
    };
  });
}

function flattenRecentFiles(payload) {
  if (!payload) return [];
  const items = [];
  Object.entries(payload).forEach(([area, files]) => {
    (files || []).forEach((file, index) => {
      items.push({
        id: `${area}-${index}-${file.path}`,
        area,
        path: file.path,
        ageDays: file.ageDays,
        modified: file.modified,
      });
    });
  });
  return items.sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

function buildTimelineFromFiles(files) {
  return (files || []).slice(0, 8).map((file) => ({
    type: "file",
    label: file.path.split("/").pop(),
    meta: `${file.area} · ${formatDate(file.modified)}`,
    time: new Date(file.modified),
    href: encodePath(file.path),
  }));
}

function updateTimelineSources(kind, items) {
  timelineSources[kind] = items || [];
  renderTimeline();
}

function renderTimeline() {
  if (!timelineList) return;
  const filters = timelineFilters || {};
  const combined = Object.values(timelineSources)
    .flat()
    .filter((entry) => {
      const time = entry?.time instanceof Date ? entry.time : new Date(entry?.time);
      if (!(time instanceof Date) || Number.isNaN(time.getTime())) return false;
      const kind = entry?.type || "event";
      if (typeof filters[kind] === "boolean" && filters[kind] === false) return false;
      return true;
    })
    .map((entry) => ({
      ...entry,
      time: entry.time instanceof Date ? entry.time : new Date(entry.time),
    }));
  combined.sort((a, b) => b.time - a.time);
  const limited = combined.slice(0, 9);
  timelineList.innerHTML = "";
  if (!limited.length) {
    timelineEmpty && (timelineEmpty.textContent = "No timeline entries yet.");
    return;
  }
  const fragment = document.createDocumentFragment();
  limited.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.dataset.kind = entry.type || "event";
    const when = entry.time instanceof Date ? entry.time : new Date(entry.time);
    const timeLabel = when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    li.innerHTML = `
      <strong>${entry.label}</strong>
      <p>${entry.meta || ""}</p>
      <small>${timeLabel}</small>
    `;
    if (entry.href) {
      const link = document.createElement("a");
      link.href = entry.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open";
      li.appendChild(link);
    }
    fragment.appendChild(li);
  });
  timelineList.appendChild(fragment);
  timelineEmpty && (timelineEmpty.textContent = "");
}

function renderHealthPanel() {
  if (!healthList) return;
  const items = [];
  const automationHealthy = automationRunnerStatus?.classList.contains("success");
  items.push({
    label: "Automation runner",
    meta: automationRunnerStatus?.textContent || "",
    ok: !!automationHealthy,
  });
  const downloadsOk = downloadsStatus && !downloadsStatus.textContent?.toLowerCase().includes("unavailable");
  items.push({
    label: "Downloads feed",
    meta: downloadsStatus?.textContent || "",
    ok: !!downloadsOk,
  });
  const wellbeingOk = wellbeingFields.latest && wellbeingFields.latest.textContent && wellbeingFields.latest.textContent !== "Summary unavailable";
  items.push({
    label: "Wellbeing",
    meta: wellbeingFields.latest?.textContent || "",
    ok: !!wellbeingOk,
  });
  const agendaOk = agendaStatus && !agendaStatus.textContent?.toLowerCase().includes("error");
  items.push({
    label: "Calendar",
    meta: agendaStatus?.textContent || "",
    ok: !!agendaOk,
  });
  const statsOk =
    statElements &&
    Array.from(statElements).some((el) => {
      const txt = el.textContent || "";
      return txt && txt !== "--";
    });
  items.push({
    label: "Stats snapshot",
    meta: statsOk ? "Loaded" : "Awaiting refresh",
    ok: !!statsOk,
  });
  healthList.innerHTML = items
    .map(
      (item) => `
      <li>
        <span>${item.label}</span>
        <small>${item.meta || ""}</small>
        <strong style="color:${item.ok ? "#15803d" : "#b91c1c"}">${item.ok ? "OK" : "Check"}</strong>
      </li>
    `,
    )
    .join("");
}

function refreshTimeline() {
  loadAgenda();
  loadRecentFiles({ force: true });
}

function bindTimelineFilters() {
  const filterInputs = document.querySelectorAll("[data-timeline-filter]");
  if (!filterInputs.length) return;
  // initialize
  filterInputs.forEach((input) => {
    const key = input.dataset.timelineFilter;
    const saved = timelineFilters[key];
    if (typeof saved === "boolean") {
      input.checked = saved;
    }
  });
  // apply initial filters
  renderTimeline();
  filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.timelineFilter;
      timelineFilters = { ...timelineFilters, [key]: !!input.checked };
      saveTimelineFilters(timelineFilters);
      renderTimeline();
    });
  });
}

function openTimelineModal(itemEl) {
  if (!timelineModal || !timelineModalBody) return;
  const type = itemEl.dataset.kind || "event";
  const title = itemEl.querySelector("strong")?.textContent || "Timeline item";
  const meta = itemEl.querySelector("p")?.textContent || "";
  const time = itemEl.querySelector("small")?.textContent || "";
  timelineModal.setAttribute("aria-hidden", "false");
  timelineModalBody.innerHTML = `
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Details:</strong> ${meta}</p>
    <p><strong>When:</strong> ${time}</p>
  `;
  if (timelineModalMeta) {
    timelineModalMeta.textContent = meta || "";
  }
}

function closeTimelineModal() {
  if (!timelineModal) return;
  timelineModal.setAttribute("aria-hidden", "true");
}

async function loadDownloadsWatch({ force = false } = {}) {
  if (!downloadsList) return;
  downloadsStatus && (downloadsStatus.textContent = "Checking Downloads…");
  downloadsList.innerHTML = "";
  if (isFileProtocol) {
    const feed = getInlineData("downloadsFeed");
    if (feed) {
      renderDownloadsFeed(feed);
    } else {
      downloadsStatus &&
        (downloadsStatus.textContent = "Downloads snapshot missing — run scripts/refresh_all.sh to rebuild dashboard-inline-data.js.");
      renderDownloadsTriage([], downloadsPathHint);
    }
    return;
  }
  try {
    const response = await fetch("downloads-feed.json", { cache: force ? "no-store" : "default" });
    if (!response.ok) throw new Error(`Failed to load downloads-feed.json (${response.status})`);
    const payload = await response.json();
    renderDownloadsFeed(payload);
  } catch (error) {
    console.error(error);
    downloadsStatus && (downloadsStatus.textContent = "Downloads watcher unavailable — run generate_downloads_feed.py.");
    renderDownloadsTriage([], downloadsPathHint);
  }
}

function renderDownloadsFeed(payload) {
  if (!downloadsList) return;
  const files = payload?.files || [];
  downloadsPathHint = payload?.downloadsPath || downloadsPathHint || "";
  renderDownloadsTriage(files, downloadsPathHint);
  const staleFiles = files.filter((file) => Number(file.ageHours) >= DOWNLOAD_STALE_HOURS);
  if (!staleFiles.length) {
    downloadsStatus && (downloadsStatus.textContent = "Downloads are clear — nothing older than a day.");
    updateTimelineSources("downloads", [
      {
        type: "downloads",
        label: "Downloads clear",
        meta: "Last check found nothing older than a day.",
        time: new Date(),
      },
    ]);
    return;
  }
  downloadsStatus &&
    (downloadsStatus.textContent = `${staleFiles.length} item${staleFiles.length === 1 ? "" : "s"} older than ${DOWNLOAD_STALE_HOURS}h.`);
  const fragment = document.createDocumentFragment();
  staleFiles
    .sort((a, b) => new Date(b.modified) - new Date(a.modified))
    .slice(0, 6)
    .forEach((file) => {
      const li = document.createElement("li");
      const age = Math.round(file.ageHours);
      li.innerHTML = `<strong>${file.name}</strong><small>${age}h old · ${file.modified ? formatDate(file.modified) : "Unknown date"}</small>`;
      fragment.appendChild(li);
    });
  downloadsList.appendChild(fragment);
  const mostRecent = staleFiles
    .map((file) => new Date(file.modified || Date.now()))
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a)[0];
  updateTimelineSources("downloads", [
    {
      type: "downloads",
      label: "Downloads sweep",
      meta: `${staleFiles.length} file${staleFiles.length === 1 ? "" : "s"} pending`,
      time: mostRecent || new Date(),
    },
  ]);
}

function loadAutomationPresets() {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem(AUTOMATION_PRESETS_KEY) || "[]");
  } catch {
    stored = [];
  }
  stored = sanitizeAutomationPresets(Array.isArray(stored) ? stored : []);
  if (stored.length) {
    return stored;
  }
  const defaults = sanitizeAutomationPresets(DEFAULT_AUTOMATION_PRESETS);
  try {
    localStorage.setItem(AUTOMATION_PRESETS_KEY, JSON.stringify(defaults));
  } catch (error) {
    console.warn("Failed to seed automation presets", error);
  }
  return defaults;
}

function sanitizeAutomationPresets(presets) {
  const seen = new Set();
  return presets
    .map((preset) => {
      const name = typeof preset.name === "string" ? preset.name.trim() : "";
      const ids = Array.isArray(preset.automations)
        ? preset.automations.map((id) => (typeof id === "string" ? id.trim() : "")).filter(Boolean)
        : [];
      if (!name || !ids.length) return null;
      let presetId = typeof preset.id === "string" && preset.id.trim() ? preset.id.trim() : "";
      if (!presetId || seen.has(presetId)) {
        presetId = `preset-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      }
      seen.add(presetId);
      return { id: presetId, name, automations: Array.from(new Set(ids)) };
    })
    .filter(Boolean);
}

function saveAutomationPresetsToStorage(presets) {
  automationPresets = presets;
  try {
    localStorage.setItem(AUTOMATION_PRESETS_KEY, JSON.stringify(automationPresets));
  } catch (error) {
    console.warn("Failed to save automation presets", error);
  }
}

function handleAutomationPresetImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const sanitized = sanitizeAutomationPresets(Array.isArray(parsed) ? parsed : []);
      if (!sanitized.length) {
        automationStatus && (automationStatus.textContent = "Imported file had no valid presets.");
        return;
      }
      saveAutomationPresetsToStorage(sanitized);
      renderAutomationPresets();
      automationStatus &&
        (automationStatus.textContent = `Imported ${sanitized.length} preset${sanitized.length === 1 ? "" : "s"}.`);
    } catch (err) {
      automationStatus && (automationStatus.textContent = "Import failed — invalid JSON.");
    }
  };
  reader.readAsText(file);
  // clear input to allow re-importing same file
  event.target.value = "";
}

function handleAutomationPresetExport() {
  if (!automationPresets || !automationPresets.length) {
    automationStatus && (automationStatus.textContent = "No presets to export yet.");
    return;
  }
  const blob = new Blob([JSON.stringify(automationPresets, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lifehub-automation-presets.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  automationStatus && (automationStatus.textContent = "Exported presets.");
}

function renderAutomationPresets() {
  if (!automationPresetsList) return;
  const availablePresets = automationPresets
    .map((preset) => {
      const matches = preset.automations
        .map((id) => automations.find((automation) => automation.id === id))
        .filter(Boolean);
      return { ...preset, matches, missing: preset.automations.length - matches.length };
    })
    .filter((preset) => preset.matches.length);
  if (!availablePresets.length) {
    automationPresetsList.innerHTML = "<li>No presets yet — queue automations, name the routine, and save it.</li>";
    automationPresetsStatus &&
      (automationPresetsStatus.textContent = "Save this week’s queue so you can rebuild it instantly next time.");
    return;
  }
  automationPresetsStatus &&
    (automationPresetsStatus.textContent = "Apply a preset to append its automations to the queue.");
  automationPresetsList.innerHTML = availablePresets
    .map((preset) => {
      const chain = preset.matches.map((automation) => automation.label).join(" → ");
      const missingLabel = preset.missing > 0 ? ` · ${preset.missing} missing step${preset.missing === 1 ? "" : "s"}` : "";
      return `
        <li>
          <div>
            <strong>${preset.name}</strong>
            <small>${preset.matches.length} step${preset.matches.length === 1 ? "" : "s"}${missingLabel}</small>
          </div>
          <p class="task-meta">Includes: ${chain}</p>
          <div class="automation-presets-actions">
            <button type="button" data-preset-run="${preset.id}">Queue preset</button>
            <button type="button" class="ghost" data-preset-delete="${preset.id}">Delete</button>
          </div>
        </li>
      `;
    })
    .join("");
}

function handleAutomationPresetSave() {
  if (!automationQueue.length) {
    automationStatus && (automationStatus.textContent = "Queue at least one automation before saving a preset.");
    return;
  }
  const name = automationPresetNameInput?.value.trim();
  if (!name) {
    automationStatus && (automationStatus.textContent = "Enter a preset name before saving.");
    return;
  }
  const ids = Array.from(new Set(automationQueue.map((entry) => entry.automation.id))).filter(Boolean);
  if (!ids.length) {
    automationStatus && (automationStatus.textContent = "Unable to save an empty preset.");
    return;
  }
  const newPreset = {
    id: `preset-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    name,
    automations: ids,
  };
  saveAutomationPresetsToStorage([...automationPresets, newPreset]);
  renderAutomationPresets();
  automationPresetNameInput && (automationPresetNameInput.value = "");
  updateAutomationPresetControls();
  automationStatus && (automationStatus.textContent = `Saved preset “${name}”.`);
}

function handleAutomationPresetsClick(event) {
  const runButton = event.target.closest("[data-preset-run]");
  if (runButton) {
    applyAutomationPreset(runButton.dataset.presetRun);
    return;
  }
  const deleteButton = event.target.closest("[data-preset-delete]");
  if (deleteButton) {
    deleteAutomationPreset(deleteButton.dataset.presetDelete);
  }
}

function applyAutomationPreset(presetId) {
  const preset = automationPresets.find((item) => item.id === presetId);
  if (!preset) return;
  const matched = preset.automations
    .map((id) => automations.find((automation) => automation.id === id))
    .filter(Boolean);
  if (!matched.length) {
    automationStatus && (automationStatus.textContent = `Preset “${preset.name}” has no available automations.`);
    return;
  }
  matched.forEach((automation) => queueAutomation(automation.id));
  automationStatus &&
    (automationStatus.textContent = `Queued ${matched.length} automation${matched.length === 1 ? "" : "s"} from “${
      preset.name
    }”.`);
}

function deleteAutomationPreset(presetId) {
  if (!presetId) return;
  const preset = automationPresets.find((item) => item.id === presetId);
  if (!preset) return;
  automationPresets = automationPresets.filter((item) => item.id !== presetId);
  saveAutomationPresetsToStorage(automationPresets);
  renderAutomationPresets();
  automationStatus && (automationStatus.textContent = `Deleted preset “${preset.name}”.`);
}

function updateAutomationPresetControls() {
  if (!automationSavePresetButton) return;
  const hasQueue = automationQueue.length > 0;
  const nameFilled = !!automationPresetNameInput?.value.trim();
  automationSavePresetButton.disabled = !hasQueue || !nameFilled || automationRunning;
}

function loadTimelineFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMELINE_FILTER_KEY) || "{}");
    return typeof saved === "object" && saved !== null ? saved : {};
  } catch {
    return {};
  }
}

function saveTimelineFilters(state = {}) {
  try {
    localStorage.setItem(TIMELINE_FILTER_KEY, JSON.stringify(state));
  } catch (e) {}
}

function collectSettingsSnapshot() {
  const get = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  };
  return {
    savedAt: new Date().toISOString(),
    theme: get("lh_theme_style"),
    compact: get("lh_density_compact"),
    calm: get("lh_mode_calm"),
    readable: get("lh_readable_font"),
    noShadows: get("lh_no_shadows"),
    timelineFilters: (() => {
      try {
        return JSON.parse(get(TIMELINE_FILTER_KEY) || "{}");
      } catch {
        return {};
      }
    })(),
    quickLaunchOrder: get("lh_quicklaunch_order"),
    quickLaunchPinned: get("lh_quicklaunch_pinned"),
    customQuick: get("lh_custom_quick_actions"),
    kiosk: {
      order: get(KIOSK_ORDER_KEY),
      interval: get(KIOSK_INTERVAL_KEY),
      mode: get(KIOSK_MODE_KEY),
    },
    automations: {
      dryRun: get(AUTOMATION_DRY_RUN_KEY),
      presets: get(AUTOMATION_PRESETS_KEY),
      lastQueue: get(AUTOMATION_LAST_QUEUE_KEY),
    },
    checklist: {
      state: get("lifehub-checklist-state"),
      history: get("lifehub-checklist-history"),
      cadence: activeCadence,
    },
    focusCards: Array.from(focusCards || []),
  };
}

function exportSettings() {
  const snapshot = collectSettingsSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = SETTINGS_EXPORT_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setActionFeedback("Exported settings.");
}

function handleSettingsImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const payload = JSON.parse(e.target.result);
      if (payload.theme) localStorage.setItem("lh_theme_style", payload.theme);
      if (payload.compact) localStorage.setItem("lh_density_compact", payload.compact);
      if (payload.calm) localStorage.setItem("lh_mode_calm", payload.calm);
      if (payload.readable) localStorage.setItem("lh_readable_font", payload.readable);
      if (payload.noShadows) localStorage.setItem("lh_no_shadows", payload.noShadows);
      if (payload.timelineFilters)
        localStorage.setItem(TIMELINE_FILTER_KEY, JSON.stringify(payload.timelineFilters));
      if (payload.quickLaunchOrder) localStorage.setItem("lh_quicklaunch_order", payload.quickLaunchOrder);
      if (payload.quickLaunchPinned) localStorage.setItem("lh_quicklaunch_pinned", payload.quickLaunchPinned);
      if (payload.customQuick) localStorage.setItem("lh_custom_quick_actions", payload.customQuick);
      if (payload.kiosk?.order) localStorage.setItem(KIOSK_ORDER_KEY, payload.kiosk.order);
      if (payload.kiosk?.interval) localStorage.setItem(KIOSK_INTERVAL_KEY, payload.kiosk.interval);
      if (payload.kiosk?.mode) localStorage.setItem(KIOSK_MODE_KEY, payload.kiosk.mode);
      if (payload.automations?.dryRun) localStorage.setItem(AUTOMATION_DRY_RUN_KEY, payload.automations.dryRun);
      if (payload.automations?.presets) localStorage.setItem(AUTOMATION_PRESETS_KEY, payload.automations.presets);
      if (payload.automations?.lastQueue) localStorage.setItem(AUTOMATION_LAST_QUEUE_KEY, payload.automations.lastQueue);
      if (payload.checklist?.state) localStorage.setItem("lifehub-checklist-state", payload.checklist.state);
      if (payload.checklist?.history) localStorage.setItem("lifehub-checklist-history", payload.checklist.history);
      if (Array.isArray(payload.focusCards)) localStorage.setItem("lifehub-focus-cards", JSON.stringify(payload.focusCards));
      setActionFeedback("Imported settings — reloading.");
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      console.error(err);
      setActionFeedback("Import failed — invalid file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function exportStatusReport() {
  const now = new Date();
  const lines = [];
  lines.push(`# LifeHub Status Report`);
  lines.push(`Generated: ${now.toLocaleString()}`);
  lines.push("");
  lines.push("## Quick stats");
  const statData = Array.from(statElements || []).map((el) => {
    const label = el.closest("dt")?.textContent || el.parentElement?.querySelector("dt")?.textContent || "Stat";
    return `${label}: ${el.textContent?.trim() || "--"}`;
  });
  lines.push(statData.length ? statData.join("\n") : "Stats unavailable.");
  lines.push("");
  lines.push("## Wellbeing");
  lines.push(`Latest: ${wellbeingFields.latest?.textContent || "--"}`);
  lines.push(`Source: ${wellbeingFields.source?.textContent || "--"}`);
  lines.push(`Stress/Energy/Focus: ${wellbeingFields.stress?.textContent || "--"} / ${wellbeingFields.energy?.textContent || "--"} / ${wellbeingFields.focus?.textContent || "--"}`);
  lines.push(`Measurements: ${wellbeingFields.count?.textContent || "--"}`);
  lines.push(`Trend: ${wellbeingTrendSummary?.textContent || "No trend yet."}`);
  lines.push("");
  lines.push("## Attention items");
  lines.push(getAttentionItemsMarkdown());
  lines.push("");
  lines.push("## Timeline highlights");
  const timelineItems = (timelineSources ? Object.values(timelineSources).flat() : []).slice(0, 8);
  if (timelineItems.length) {
    timelineItems.forEach((item) => {
      const when = item.time ? new Date(item.time).toLocaleString() : "";
      lines.push(`- [${item.type || "event"}] ${item.label} — ${item.meta || ""} (${when})`);
    });
  } else {
    lines.push("No timeline entries captured.");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lifehub-status-report.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setActionFeedback("Exported status report.");
}

function getAttentionItemsMarkdown() {
  try {
    const arr = JSON.parse(localStorage.getItem("lh_attention_items") || "[]");
    if (!arr.length) return "None.";
    return arr.map((it) => `- ${it.text || it}`).join("\n");
  } catch {
    return "Unable to load attention items.";
  }
}

function renderDownloadsTriage(files, downloadsPath) {
  if (!downloadsTriageList) return;
  downloadsTriageList.innerHTML = "";
  downloadTriageSuggestions = new Map();
  const suggestions = buildDownloadSuggestions(files || []);
  if (!suggestions.length) {
    downloadsTriageStatus &&
      (downloadsTriageStatus.textContent = files && files.length
        ? "No confident moves to suggest right now."
        : "No download data yet — refresh to gather suggestions.");
    return;
  }
  downloadsTriageStatus &&
    (downloadsTriageStatus.textContent = `${suggestions.length} smart move${
      suggestions.length === 1 ? "" : "s"
    } ready. Adjust the destination if needed before moving.`);
  const safePath = downloadsPath || downloadsPathHint || "~/Downloads";
  suggestions.forEach((item, index) => {
    const suggestionId = `dltriage-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
    downloadTriageSuggestions.set(suggestionId, { ...item, downloadsPath: safePath });
    const selectOptions = TRIAGE_MOVE_TARGETS.map(
      (target) =>
        `<option value="${target.id}" ${target.id === item.destination ? "selected" : ""}>${target.label}</option>`,
    ).join("");
    const li = document.createElement("li");
    li.className = "downloads-triage-item";
    li.innerHTML = `
      <header>
        <strong>${item.name}</strong>
        <small>${item.reason} · ${formatDownloadAge(item.ageHours)}</small>
        <small>Suggested destination: ${item.destination}</small>
      </header>
      <div class="downloads-triage-actions">
        <label>
          Destination
          <select data-download-select="${suggestionId}">
            ${selectOptions}
          </select>
        </label>
        <button type="button" data-download-move="${suggestionId}">Move file</button>
        <button type="button" class="ghost" data-download-copy="${suggestionId}">Copy open command</button>
      </div>
    `;
    downloadsTriageList.appendChild(li);
  });
}

function buildDownloadSuggestions(files = []) {
  return files
    .filter((file) => file && !file.isDir)
    .map((file) => {
      const suggestion = guessDownloadDestination(file);
      if (!suggestion) return null;
      const ageHours = Number(file.ageHours) || 0;
      if (ageHours < DOWNLOAD_TRIAGE_MIN_AGE_HOURS && suggestion.score < 2) {
        return null;
      }
      return {
        name: file.name,
        destination: suggestion.destination,
        reason: suggestion.reason,
        ageHours,
        modified: file.modified,
        score: suggestion.score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (Number(b.ageHours) || 0) - (Number(a.ageHours) || 0))
    .slice(0, DOWNLOAD_TRIAGE_LIMIT);
}

function guessDownloadDestination(file) {
  const name = (file?.name || "").trim();
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const rule of DOWNLOAD_TRIAGE_RULES) {
    if (rule.test.test(lower)) {
      return { destination: rule.destination, reason: rule.reason, score: 3 };
    }
  }
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext && DOWNLOAD_TRIAGE_EXTENSION_MAP[ext]) {
    const match = DOWNLOAD_TRIAGE_EXTENSION_MAP[ext];
    return { destination: match.destination, reason: match.reason, score: 2 };
  }
  if (lower.includes("screenshot") || lower.includes("screen shot")) {
    return { destination: "Media", reason: "Screenshot image", score: 1.5 };
  }
  return null;
}

function handleDownloadsTriageClick(event) {
  const moveBtn = event.target.closest("[data-download-move]");
  if (moveBtn) {
    moveDownloadSuggestion(moveBtn.dataset.downloadMove);
    return;
  }
  const copyBtn = event.target.closest("[data-download-copy]");
  if (copyBtn) {
    copyDownloadOpenCommand(copyBtn.dataset.downloadCopy);
  }
}

async function moveDownloadSuggestion(suggestionId) {
  if (!suggestionId) return;
  const suggestion = downloadTriageSuggestions.get(suggestionId);
  if (!suggestion) {
    setActionFeedback("Suggestion expired. Refresh Downloads to try again.");
    return;
  }
  const select = downloadsTriageList?.querySelector(`select[data-download-select="${suggestionId}"]`);
  const destination = select?.value || suggestion.destination;
  if (!destination) {
    setActionFeedback("Choose a destination before moving.");
    return;
  }
  const command = buildDownloadMoveCommand(suggestion.name, destination);
  const task = {
    id: `download-triage-${Date.now()}`,
    label: `Move ${suggestion.name} → ${destination}`,
    command,
  };
  const run = await triggerImmediateAutomation(task);
  if (run?.exitCode === 0) {
    setActionFeedback(`Moved ${suggestion.name} to ${destination}.`);
    loadDownloadsWatch({ force: true });
    return;
  }
  copyDownloadMoveFallback(command, destination);
}

function buildDownloadMoveCommand(fileName, destination) {
  const encoded = encodeBase64Utf8(fileName);
  return `python3 LifeHub/scripts/move_download_item.py --source-b64 ${encoded} --destination ${destination}`;
}

function copyDownloadMoveFallback(command, destination) {
  if (!navigator.clipboard) {
    setActionFeedback(`Automation runner offline — copy this command manually to move into ${destination}.`);
    return;
  }
  navigator.clipboard
    .writeText(command)
    .then(() =>
      setActionFeedback(
        `Automation runner offline — move command copied. Paste into Terminal to file under ${destination}.`,
      ),
    )
    .catch(() => setActionFeedback("Clipboard blocked — copy the move command manually."));
}

function copyDownloadOpenCommand(suggestionId) {
  if (!suggestionId) return;
  const suggestion = downloadTriageSuggestions.get(suggestionId);
  if (!suggestion) return;
  const downloadsDir = suggestion.downloadsPath || downloadsPathHint || "~/Downloads";
  const command = `open "${downloadsDir.replace(/\/$/, "")}/${suggestion.name}"`;
  if (!navigator.clipboard) {
    setActionFeedback("Clipboard access denied — copy the open command manually.");
    return;
  }
  navigator.clipboard
    .writeText(command)
    .then(() => setActionFeedback("Open command copied — paste into Terminal to reveal the file."))
    .catch(() => setActionFeedback("Clipboard blocked — copy manually."));
}

function buildTriageCards() {
  const inboxFiles = (recentFilesCache && recentFilesCache.Inbox) || [];
  if (inboxFiles.length) {
    triageCards = inboxFiles.slice(0, 12).map((file, index) => ({
      id: file.path || `inbox-${index}`,
      label: file.path?.split("/").pop() || "Inbox item",
      href: encodePath(file.path),
      hint: `Updated ${formatDate(file.modified)}`,
      path: file.path,
    }));
  } else if (triageSeeds.length) {
    triageCards = triageSeeds.map((seed) => ({
      id: seed.id,
      label: seed.label,
      href: encodePath(seed.href || ""),
      hint: seed.hint || "",
      path: seed.path || "",
    }));
  } else {
    triageCards = [];
  }
  renderTriageBoard();
}

function renderTriageBoard() {
  if (!triageGrid) return;
  triageGrid.innerHTML = "";
  if (!triageColumns.length) {
    triageGrid.innerHTML = "<p>No triage columns defined yet.</p>";
    return;
  }
  const columnMap = new Map();
  triageColumns.forEach((column) => columnMap.set(column.id, []));
  triageCards.forEach((card) => {
    const columnId = triageState[card.id] || "inbox";
    if (!columnMap.has(columnId)) {
      columnMap.set(columnId, []);
    }
    columnMap.get(columnId).push(card);
  });
  const fragment = document.createDocumentFragment();
  triageColumns.forEach((column) => {
    const wrapper = document.createElement("div");
    wrapper.className = "triage-column";
    wrapper.dataset.triageColumn = column.id;
    wrapper.innerHTML = `<h3>${column.label} <small>${column.description || ""}</small></h3>`;
    const columnCards = columnMap.get(column.id) || [];
    columnCards.forEach((card) => {
      const cardEl = document.createElement("article");
      cardEl.className = "triage-card";
      cardEl.draggable = true;
      cardEl.dataset.triageId = card.id;
      const moveControl = card.path
        ? `<div class="triage-move">
            <label>
              Move file
              <select data-triage-move="${card.id}">
                <option value="">Select destination…</option>
                ${TRIAGE_MOVE_TARGETS.map((target) => `<option value="${target.id}">${target.label}</option>`).join("")}
              </select>
            </label>
            <small>Copies an mv command for Terminal</small>
          </div>`
        : "";
      cardEl.innerHTML = `
        <header>${card.label}</header>
        <p>${card.hint || ""}</p>
        <footer>
          <div class="triage-routing">
            <label>
              Board column
              <select data-triage-select="${card.id}">
                ${triageColumns
                  .map(
                    (option) => `<option value="${option.id}" ${option.id === column.id ? "selected" : ""}>${option.label}</option>`
                  )
                  .join("")}
              </select>
            </label>
            ${
              card.href
                ? `<a href="${card.href}" target="_blank" rel="noopener">Open</a>`
                : "<span>—</span>"
            }
          </div>
          ${moveControl}
        </footer>
      `;
      wrapper.appendChild(cardEl);
    });
    fragment.appendChild(wrapper);
  });
  triageGrid.appendChild(fragment);
}

function handleTriageSelectChange(event) {
  const moveSelect = event.target.closest("select[data-triage-move]");
  if (moveSelect) {
    const destination = moveSelect.value;
    if (destination) {
      moveTriageItem(moveSelect.dataset.triageMove, destination);
    }
    moveSelect.value = "";
    return;
  }
  const select = event.target.closest("select[data-triage-select]");
  if (!select) return;
  setTriageCardColumn(select.dataset.triageSelect, select.value);
}

function setTriageCardColumn(cardId, columnId) {
  if (!cardId) return;
  const validColumn = triageColumns.find((column) => column.id === columnId)?.id || triageColumns[0]?.id;
  if (!validColumn) return;
  triageState[cardId] = validColumn;
  saveTriageState();
  renderTriageBoard();
}

async function moveTriageItem(cardId, destinationRoot) {
  if (!cardId || !destinationRoot) return;
  const card = triageCards.find((item) => item.id === cardId);
  if (!card?.path) {
    setActionFeedback("No file path available for that card.");
    return;
  }
  const command = buildTriageMoveCommand(card.path, destinationRoot);
  const label = `Move ${card.label || cardId} → ${destinationRoot}`;
  const task = {
    id: `triage-${Date.now()}`,
    label,
    command,
  };
  const run = await triggerImmediateAutomation(task);
  if (run?.exitCode === 0) {
    setActionFeedback(`Moved ${card.label || "Inbox file"} to ${destinationRoot}.`);
    loadRecentFiles({ force: true });
    return;
  }
  copyTriageMoveFallback(command, destinationRoot);
}

function buildTriageMoveCommand(path, destinationRoot) {
  const encoded = encodeBase64Utf8(path);
  return `python3 LifeHub/scripts/move_inbox_item.py --source-b64 ${encoded} --destination ${destinationRoot}`;
}

function copyTriageMoveFallback(command, destinationRoot) {
  navigator.clipboard
    ?.writeText(command)
    .then(() =>
      setActionFeedback(
        `Automation runner offline — move command copied. Paste into Terminal to file under ${destinationRoot}.`
      )
    )
    .catch(() => setActionFeedback("Clipboard blocked — copy manually."));
}

function handleTriageDragStart(event) {
  const card = event.target.closest("[data-triage-id]");
  if (!card) return;
  draggedTriageId = card.dataset.triageId;
  event.dataTransfer?.setData("text/plain", draggedTriageId);
}

function handleTriageDragEnd() {
  draggedTriageId = null;
  triageGrid
    ?.querySelectorAll(".triage-column.is-hovered")
    .forEach((column) => column.classList.remove("is-hovered"));
}

function handleTriageDragOver(event) {
  if (!draggedTriageId) return;
  if (event.target.closest("[data-triage-column]")) {
    event.preventDefault();
  }
}

function handleTriageDrop(event) {
  if (!draggedTriageId) return;
  const column = event.target.closest("[data-triage-column]");
  if (!column) return;
  event.preventDefault();
  setTriageCardColumn(draggedTriageId, column.dataset.triageColumn);
}

function handleTriageDragEnter(event) {
  const column = event.target.closest("[data-triage-column]");
  if (!column || !draggedTriageId) return;
  column.classList.add("is-hovered");
}

function handleTriageDragLeave(event) {
  const column = event.target.closest("[data-triage-column]");
  if (!column) return;
  column.classList.remove("is-hovered");
}

function resetTriageBoard() {
  triageState = {};
  saveTriageState();
  renderTriageBoard();
}

function loadTriageState() {
  try {
    const stored = localStorage.getItem(TRIAGE_STATE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveTriageState() {
  try {
    localStorage.setItem(TRIAGE_STATE_KEY, JSON.stringify(triageState));
  } catch (error) {
    console.warn("Failed to persist triage state", error);
  }
}

function buildResurfaceEntries() {
  const dormant = recentFilesFlat
    .filter((file) => Number(file.ageDays) >= RESURFACE_THRESHOLD_DAYS)
    .map((file) => ({
      title: file.path.split("/").pop(),
      description: file.path,
      ageDays: file.ageDays,
      area: file.area,
      href: encodePath(file.path),
    }))
    .sort((a, b) => Number(b.ageDays || 0) - Number(a.ageDays || 0))
    .filter((entry) => !isResurfaceSnoozed(entry));
  if (dormant.length) {
    resurfaceEntries = dormant.slice(0, 12);
  } else {
    resurfaceEntries = cards.slice(0, 6).map((card) => ({
      title: card.title,
      description: card.description,
      area: card.root,
      ageDays: 0,
      href: encodePath(card.links?.[0]?.href || card.root),
    }));
  }
  resurfaceIndex = 0;
  renderResurfaceCard();
}

function renderResurfaceCard() {
  if (!resurfaceCard) return;
  const filter = resurfaceFilter?.value || "all";
  const filtered = resurfaceEntries.filter((entry) => filter === "all" || entry.area === filter);
  if (!filtered.length) {
    resurfaceCard.innerHTML = "<p>All clear — add more files to LifeHub to see resurfaced suggestions.</p>";
    return;
  }
  const entry = filtered[resurfaceIndex % filtered.length];
  const ageLabel = entry.ageDays ? `${Math.round(entry.ageDays)} days untouched` : "Recently updated";
  resurfaceCard.innerHTML = `
    <h3>${entry.title}</h3>
    <p>${entry.description || ""}</p>
    <div class="resurface-meta">
      <span>${entry.area || ""}</span>
      <span>${ageLabel}</span>
    </div>
    ${entry.href ? `<a href="${entry.href}" target="_blank" rel="noopener">Open</a>` : ""}
  `;
}

function rotateResurface(delta = 1) {
  const filter = resurfaceFilter?.value || "all";
  const filtered = resurfaceEntries.filter((entry) => filter === "all" || entry.area === filter);
  if (!filtered.length) return;
  resurfaceIndex = (resurfaceIndex + delta + filtered.length) % filtered.length;
  renderResurfaceCard();
}

function loadResurfaceSnoozed() {
  try {
    const raw = localStorage.getItem(RESURFACE_SNOOZE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed;
    return {};
  } catch {
    return {};
  }
}

function saveResurfaceSnoozed() {
  try {
    localStorage.setItem(RESURFACE_SNOOZE_KEY, JSON.stringify(resurfaceSnoozed));
  } catch (e) {
    console.warn("Unable to save resurface snoozes", e);
  }
}

function snoozeResurfaceEntry(days = 30) {
  const filter = resurfaceFilter?.value || "all";
  const filtered = resurfaceEntries.filter((entry) => filter === "all" || entry.area === filter);
  if (!filtered.length) return;
  const entry = filtered[resurfaceIndex % filtered.length];
  const key = `${entry.area || "any"}|${entry.title}`;
  const expires = Date.now() + days * 24 * 60 * 60 * 1000;
  resurfaceSnoozed[key] = expires;
  saveResurfaceSnoozed();
  rotateResurface(1);
}

function isResurfaceSnoozed(entry) {
  if (!entry) return false;
  const key = `${entry.area || "any"}|${entry.title}`;
  const exp = resurfaceSnoozed[key];
  if (!exp) return false;
  if (Date.now() > exp) {
    delete resurfaceSnoozed[key];
    saveResurfaceSnoozed();
    return false;
  }
  return true;
}

function initScratchpad() {
  if (!scratchpadInput) return;
  try {
    scratchpadInput.value = localStorage.getItem(SCRATCHPAD_KEY) || "";
  } catch {
    scratchpadInput.value = "";
  }
  updateScratchpadStatus("Ready");
}

function handleScratchpadInput(event) {
  try {
    localStorage.setItem(SCRATCHPAD_KEY, event.target.value);
    updateScratchpadStatus("Saved");
  } catch (error) {
    console.warn("Scratchpad save failed", error);
  }
}

function copyScratchpad() {
  if (!scratchpadInput) return;
  navigator.clipboard
    ?.writeText(scratchpadInput.value)
    .then(() => updateScratchpadStatus("Copied to clipboard"))
    .catch(() => updateScratchpadStatus("Clipboard blocked"));
}

function downloadScratchpad() {
  if (!scratchpadInput) return;
  const blob = new Blob([scratchpadInput.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lifehub-scratchpad-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  updateScratchpadStatus("Downloaded");
}

function clearScratchpad() {
  if (!scratchpadInput) return;
  scratchpadInput.value = "";
  localStorage.removeItem(SCRATCHPAD_KEY);
  updateScratchpadStatus("Cleared");
}

async function promoteScratchpadToFile() {
  if (!scratchpadInput) return;
  const text = scratchpadInput.value.trim();
  if (!text) {
    updateScratchpadStatus("Nothing to promote");
    return;
  }
  const suggestedName = `LifeHub-note-${new Date().toISOString().slice(0, 10)}.md`;
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: "Markdown", accept: { "text/markdown": [".md"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      updateScratchpadStatus(`Saved ${handle.name || suggestedName}`);
      return;
    } catch (error) {
      if (error.name === "AbortError") {
        updateScratchpadStatus("Save cancelled");
        return;
      }
      console.warn("Scratchpad promote failed", error);
    }
  }
  downloadScratchpad();
  updateScratchpadStatus("Downloaded — move into LifeHub");
}

function updateScratchpadStatus(message) {
  if (!scratchpadStatus) return;
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  scratchpadStatus.textContent = `${message} · ${timestamp}`;
}

function renderBackupStatus() {
  if (!backupList) return;
  if (!backupDestinations.length) {
    backupList.innerHTML = "<li>No backup targets configured yet.</li>";
    updateTimelineSources("backups", []);
    return;
  }
  const now = Date.now();
  const timelineEntries = [];
  backupList.innerHTML = backupDestinations
    .map((destination) => {
      const last = new Date(destination.lastBackup);
      const hoursSince = last instanceof Date && !Number.isNaN(last) ? (now - last.getTime()) / 36e5 : Infinity;
      let state = destination.status || "ok";
      if (hoursSince > 168) {
        state = "danger";
      } else if (hoursSince > 48) {
        state = "warning";
      }
      const ageLabel = Number.isFinite(hoursSince) ? `${Math.round(hoursSince)}h ago` : "Unknown";
      if (!Number.isNaN(last.getTime())) {
        timelineEntries.push({
          type: "backup",
          label: destination.label || "Backup",
          meta: `Ran ${ageLabel}`,
          time: last,
        });
      }
      return `
        <li class="backup-card" data-status="${state}">
          <strong>${destination.label}</strong>
          <p>${destination.location || ""}</p>
          <small>Last backup: ${ageLabel} · Target cadence: ${destination.frequency || "n/a"}</small>
          <footer>
            <span>${destination.command || ""}</span>
            ${
              destination.command
                ? `<button type="button" data-backup-command="${encodeURIComponent(destination.command)}">Copy verify command</button>`
                : ""
            }
          </footer>
        </li>
      `;
    })
    .join("");
  updateTimelineSources("backups", timelineEntries);
}

function handleBackupListClick(event) {
  const button = event.target.closest("[data-backup-command]");
  if (!button) return;
  const command = decodeURIComponent(button.dataset.backupCommand || "");
  const originalLabel = button.textContent;
  const revert = () => setTimeout(() => (button.textContent = originalLabel), 1200);
  navigator.clipboard
    ?.writeText(command)
    .then(() => {
      button.textContent = "Copied!";
      revert();
    })
    .catch(() => {
      button.textContent = "Clipboard blocked";
      revert();
    });
}

function toggleKioskMode() {
  kioskModeEnabled = !kioskModeEnabled;
  localStorage.setItem(KIOSK_MODE_KEY, kioskModeEnabled ? "true" : "false");
  applyKioskModeState();
}

function applyKioskModeState() {
  kioskToggle?.setAttribute("aria-pressed", kioskModeEnabled ? "true" : "false");
  if (kioskToggle) {
    kioskToggle.textContent = kioskModeEnabled ? "Kiosk mode: On" : "Kiosk mode: Off";
  }
  if (kioskPauseButton) {
    kioskPauseButton.disabled = !kioskModeEnabled;
    kioskPauseButton.textContent = kioskPaused ? "Resume rotation" : "Pause rotation";
    kioskPauseButton.setAttribute("aria-pressed", kioskPaused ? "true" : "false");
  }
  document.body.classList.toggle("kiosk-mode", kioskModeEnabled);
  if (kioskModeEnabled) {
    startKioskRotation();
  } else {
    stopKioskRotation();
    kioskPaused = false;
  }
}

function startKioskRotation() {
  if (kioskPaused) return;
  const metadata = getKioskPanelMetadata();
  const panelMap = new Map(metadata.map((item) => [item.id, item.element]));
  const config = loadKioskConfig();
  let order = Array.isArray(config.order) ? config.order : [];
  if (!order.length) {
    order = metadata.map((item) => item.id);
  }
  const disabledSet = new Set(config.disabled || []);
  const rotationIds = order.filter((id) => panelMap.has(id) && !disabledSet.has(id));
  const fallbackIds = metadata.map((item) => item.id).filter((id) => !disabledSet.has(id));
  const finalIds = rotationIds.length ? rotationIds : fallbackIds.length ? fallbackIds : metadata.map((item) => item.id);
  kioskPanels = finalIds.map((id) => panelMap.get(id)).filter(Boolean);
  kioskActiveIndex = 0;
  highlightKioskPanel();
  if (kioskRotationTimer) {
    clearInterval(kioskRotationTimer);
  }
  kioskRotationTimer = setInterval(() => {
    kioskActiveIndex = (kioskActiveIndex + 1) % Math.max(kioskPanels.length, 1);
    highlightKioskPanel();
  }, kioskRotationInterval);
}

function stopKioskRotation() {
  if (kioskRotationTimer) {
    clearInterval(kioskRotationTimer);
    kioskRotationTimer = null;
  }
  kioskPanels.forEach((panel) => panel.classList.remove("kiosk-active"));
}

function highlightKioskPanel() {
  kioskPanels.forEach((panel, index) => {
    panel.classList.toggle("kiosk-active", index === kioskActiveIndex);
  });
}

function getKioskPanelMetadata() {
  const panels = Array.from(document.querySelectorAll("[data-kiosk-highlight]")).filter(
    (panel) => panel && typeof panel.querySelector === "function"
  );
  return panels.map((panel, index) => ({
    id: panel.dataset.kioskHighlight || panel.id || `panel-${index}`,
    label: panel.querySelector("h2")?.textContent?.trim() || `Panel ${index + 1}`,
    element: panel,
  }));
}

function loadKioskConfig() {
  try {
    const storedValue = localStorage.getItem(KIOSK_ORDER_KEY);
    if (!storedValue) return { order: [], disabled: [] };
    const parsed = JSON.parse(storedValue);
    if (Array.isArray(parsed)) {
      return { order: parsed, disabled: [] };
    }
    return {
      order: Array.isArray(parsed.order) ? parsed.order : [],
      disabled: Array.isArray(parsed.disabled) ? parsed.disabled : [],
    };
  } catch {
    return { order: [], disabled: [] };
  }
}

function saveKioskConfig(config) {
  try {
    localStorage.setItem(KIOSK_ORDER_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("Failed to save kiosk order", error);
  }
}

function renderKioskSettingsForm() {
  if (!kioskOrderList) return;
  const metadata = getKioskPanelMetadata();
  const metadataMap = new Map(metadata.map((item) => [item.id, item]));
  const config = loadKioskConfig();
  const order = Array.isArray(config.order) ? config.order : [];
  const disabledSet = new Set(config.disabled || []);
  const combined = [];
  order.forEach((id) => {
    if (metadataMap.has(id)) {
      combined.push(id);
    }
  });
  metadata.forEach((item) => {
    if (!combined.includes(item.id)) {
      combined.push(item.id);
    }
  });
  kioskOrderList.innerHTML = combined
    .map((id) => {
      const meta = metadataMap.get(id);
      const checked = !disabledSet.has(id);
      return `
        <li data-panel-id="${id}">
          <label><input type="checkbox" data-kiosk-enabled ${checked ? "checked" : ""} /> ${meta?.label || id}</label>
          <div class="kiosk-order-buttons">
            <button type="button" data-kiosk-move="up" aria-label="Move ${meta?.label || id} up">↑</button>
            <button type="button" data-kiosk-move="down" aria-label="Move ${meta?.label || id} down">↓</button>
          </div>
        </li>
      `;
    })
    .join("");
  if (kioskIntervalInput) {
    kioskIntervalInput.value = Math.round(kioskRotationInterval / 1000);
  }
}

function handleKioskOrderListClick(event) {
  if (!kioskOrderList) return;
  const moveButton = event.target.closest("[data-kiosk-move]");
  if (!moveButton) return;
  const item = moveButton.closest("li[data-panel-id]");
  if (!item) return;
  const direction = moveButton.dataset.kioskMove;
  if (direction === "up") {
    const previous = item.previousElementSibling;
    if (previous) {
      kioskOrderList.insertBefore(item, previous);
    }
  } else if (direction === "down") {
    const next = item.nextElementSibling;
    const insertionPoint = next?.nextElementSibling || null;
    kioskOrderList.insertBefore(item, insertionPoint);
  }
}

function saveKioskSettings() {
  if (!kioskOrderList) return;
  const items = Array.from(kioskOrderList.querySelectorAll("li[data-panel-id]"));
  const selectedIds = [];
  const disabled = [];
  items.forEach((item) => {
    const checkbox = item.querySelector("input[data-kiosk-enabled]");
    const id = item.dataset.panelId;
    if (!id) return;
    if (checkbox?.checked !== false) {
      selectedIds.push(id);
    } else {
      disabled.push(id);
    }
  });
  saveKioskConfig({ order: selectedIds, disabled });
  if (kioskIntervalInput) {
    const seconds = Math.max(5, Number(kioskIntervalInput.value) || Math.round(kioskRotationInterval / 1000));
    kioskRotationInterval = seconds * 1000;
    localStorage.setItem(KIOSK_INTERVAL_KEY, String(kioskRotationInterval));
  }
  if (kioskModeEnabled) {
    stopKioskRotation();
    startKioskRotation();
  }
  setActionFeedback("Kiosk settings updated");
}

function toggleKioskPause() {
  kioskPaused = !kioskPaused;
  kioskPauseButton?.setAttribute("aria-pressed", kioskPaused ? "true" : "false");
  kioskPauseButton && (kioskPauseButton.textContent = kioskPaused ? "Resume rotation" : "Pause rotation");
  if (kioskPaused) {
    stopKioskRotation();
  } else if (kioskModeEnabled) {
    startKioskRotation();
  }
}

function applyKioskPreset(key) {
  const preset = KIOSK_PRESETS[key];
  if (!preset) return;
  saveKioskConfig({ order: preset.order || [], disabled: preset.disabled || [] });
  renderKioskSettingsForm();
  if (kioskModeEnabled) {
    stopKioskRotation();
    startKioskRotation();
  }
  setActionFeedback(`Applied kiosk preset: ${preset.label || key}`);
}

async function triggerImmediateAutomation(task) {
  if (!task?.command) return null;
  try {
    const response = await fetch(AUTOMATION_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: [task] }),
    });
    if (!response.ok) {
      throw new Error(`Automation runner responded with ${response.status}`);
    }
    const payload = await response.json();
    return payload?.runs?.[0] || null;
  } catch (error) {
    console.warn("Immediate automation failed", error);
    return null;
  }
}

async function checkAutomationRunnerStatus() {
  if (!automationRunnerStatus) return false;
  automationRunnerStatus.textContent = "Runner: checking…";
  automationRunnerStatus.classList.remove("success", "danger");
  try {
    const res = await fetch(AUTOMATION_SERVER_URL, { method: "OPTIONS" });
    if (res?.ok || res?.status === 405 || res?.status === 204) {
      automationRunnerStatus.textContent = "Runner: reachable";
      automationRunnerStatus.classList.add("success");
      renderHealthPanel();
      return true;
    }
  } catch (error) {
    console.warn("Automation runner check failed", error);
  }
  automationRunnerStatus.textContent = "Runner: offline";
  automationRunnerStatus.classList.add("danger");
  renderHealthPanel();
  return false;
}

renderCards();
updateFocusToggle();
renderTasks();
renderPlayables();
bindEvents();
bindTimelineFilters();
loadStats();
loadWellbeing();
handleHashNavigation();
loadRecentFiles();
loadAgenda();
renderSpotlight();
startSpotlightRotation();
renderAutomationScheduler();
checkAutomationRunnerStatus();
refreshAutomationHistoryFromFile();
renderKioskSettingsForm();
prefetchSearchIndex();
handleCopilotQuery("");
renderBackupStatus();
initScratchpad();
buildTriageCards();
buildResurfaceEntries();
applyKioskModeState();
loadDownloadsWatch();
renderTimeline();
renderHealthPanel();
// Update refresh badges after all data is loaded
setTimeout(updateAllRefreshBadges, 500);
// Start auto-refresh every 5 minutes
setupAutoRefresh(5);

