const API_BASE_URL = "http://localhost:3001";

const API_ENDPOINTS = {
  featuredProperties: "/api/properties?limit=50",
  searchProperties: "/api/properties",
  propertyDetails: (id) => `/api/properties/${id}`,
  relatedProperties: "/api/properties/related",
  movingServices: "/api/moving/services"
};

const STORAGE_KEYS = {
  favourites: "favourites",
  assistantSession: "assistantSession"
};

const DEFAULT_FILTERS = {
  location: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  sort: "newest"
};

const PAGE_CONFIG = {
  pageSize: 12,
  relatedLimit: 4
};



const locationAutocompleteState = {
  suggestions: [],
  isLoading: false,
  pendingPromise: null
};

function normalizeLocationSuggestion(value) {
  const text = String(value ?? "").trim();
  return text.replace(/\s+/g, " ");
}

function collectLocationSuggestions(properties) {
  const seen = new Set();
  const suggestions = [];

  (Array.isArray(properties) ? properties : []).forEach((property) => {
    const title = normalizeLocationSuggestion(property?.title);
    const location = normalizeLocationSuggestion(property?.location);
    const primaryText = title || location;

    if (!primaryText) {
      return;
    }

    const key = primaryText.toLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    suggestions.push({
      suggestion: title ? `${title}${location ? ` — ${location}` : ""}` : location,
      value: location,
      title,
      location,
      propertyId: property?.id || null
    });
  });

  return suggestions.sort((left, right) => left.suggestion.localeCompare(right.suggestion));
}

async function ensureLocationAutocompleteSuggestions() {
  if (locationAutocompleteState.suggestions.length) {
    return locationAutocompleteState.suggestions;
  }

  if (locationAutocompleteState.pendingPromise) {
    return locationAutocompleteState.pendingPromise;
  }

  locationAutocompleteState.isLoading = true;
  locationAutocompleteState.pendingPromise = fetchJson(
    `${API_BASE_URL}${API_ENDPOINTS.searchProperties}?limit=100`,
    {},
    { success: true, message: "Loaded demo suggestions", data: { properties: getDemoPropertyList() } }
  )
    .then((payload) => {
      const properties = payload?.data?.properties || [];
      const suggestions = collectLocationSuggestions(properties);
      locationAutocompleteState.suggestions = suggestions;
      return suggestions;
    })
    .finally(() => {
      locationAutocompleteState.isLoading = false;
      locationAutocompleteState.pendingPromise = null;
    });

  return locationAutocompleteState.pendingPromise;
}

const DEMO_PROPERTIES = [
  {
    id: "prop-001",
    title: "Bright 3-Bedroom Condo",
    location: "Tampines",
    price: 980000,
    propertyType: "Condo",
    bedrooms: 3,
    bathrooms: 2,
    floorArea: 1200,
    images: ["images/houses/lentoria_condo.jpg"],
    description: "A bright and modern condo close to MRT and schools.",
    amenities: ["Pool", "Gym", "Security"],
    featured: true,
    postedDate: "2026-06-15"
  },
  {
    id: "prop-002",
    title: "Modern 2-Bedroom HDB",
    location: "Yishun",
    price: 680000,
    propertyType: "HDB",
    bedrooms: 2,
    bathrooms: 2,
    floorArea: 980,
    images: ["images/houses/woodleigh_HDB.jpg"],
    description: "Spacious and practical with excellent amenities nearby.",
    amenities: ["Parking", "Playground", "MRT"],
    featured: true,
    postedDate: "2026-06-20"
  },
  {
    id: "prop-003",
    title: "Garden Terrace House",
    location: "Bishan",
    price: 1450000,
    propertyType: "Landed",
    bedrooms: 4,
    bathrooms: 3,
    floorArea: 1800,
    images: ["images/houses/Bidadari_estate.jpg"],
    description: "A generous landed home with a lush garden and outdoor lounge.",
    amenities: ["Garden", "Private Parking", "Study"],
    featured: true,
    postedDate: "2026-06-25"
  }
];

const DEMO_MOVING_SERVICES = [
  {
    id: "svc-001",
    title: "Full Move Assistance",
    description: "End-to-end support for your relocation.",
    price: 450,
    category: "Premium",
    image: "images/moving/fullmove.jpg",
    ctaLabel: "Book now",
    ctaUrl: "moving-booking.html",
    featured: true,
    duration: "4 hours"
  },
  {
    id: "svc-002",
    title: "Packing & Unpacking",
    description: "Careful packing with premium materials.",
    price: 220,
    category: "Standard",
    image: "images/moving/packing&unpacking.jpg",
    ctaLabel: "Get a quote",
    ctaUrl: "moving-booking.html",
    featured: true,
    duration: "2 hours"
  }
];

const state = {
  currentPage: 1,
  currentSearchFilters: { ...DEFAULT_FILTERS },
  searchResults: [],
  selectedProperty: null,
  favourites: [],
  loadingState: false,
  errorState: null
};

const assistantSuggestedPrompts = [
  "Find a condo near an MRT station",
  "Show me homes under $1.5M",
  "I want a 3-bedroom place with a pool"
];

const assistantState = {
  assistantOpen: false,
  conversationHistory: [],
  currentPreferences: null,
  currentRecommendations: [],
  assistantConfidenceScore: null,
  assistantConfidenceStatus: null,
  assistantConfidenceExplanation: null,
  assistantConfidenceFactors: [],
  activeChatSessionId: null,
  isAssistantLoading: false,
  pendingClarificationField: null,
  pendingClarificationContext: null,
  selectedPropertyId: null,
  lastSearchContext: {},
  panelOpen: false,
  preferences: null,
  loadingState: false,
  confidenceScore: null
};

// Global diagnostic error handlers (Phase 1 - non-destructive)
window.addEventListener("error", (event) => {
  try {
    console.error("Window error:", event.error || event.message, event);
    showError("An unexpected error occurred. Check the console for details.");
    state.errorState = String((event.error && event.error.message) || event.message || "window_error");
  } catch (e) {
    console.error("Error in global error handler", e);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  try {
    console.error("Unhandled promise rejection:", event.reason);
    showError("An internal error occurred. Check the console for details.");
    state.errorState = String((event.reason && event.reason.message) || event.reason || "unhandledrejection");
  } catch (e) {
    console.error("Error in unhandledrejection handler", e);
  }
});

function initApp() {
  initAssistantFeature();
  renderNavigation(document.getElementById("site-nav"));
  renderFooter(document.getElementById("site-footer"));
  bindMenuToggle();
  state.favourites = getFavourites();

  const pageName = getPageName();
  if (pageName === "home") {
    initHomePage();
  } else if (pageName === "search") {
    initSearchPage();
  } else if (pageName === "property") {
    initPropertyPage();
  } else if (pageName === "mortgage") {
    initMortgagePage();
  } else if (pageName === "favourites") {
    initFavouritesPage();
  } else if (pageName === "moving") {
    initMovingPage();
  }
}

function getPageName() {
  return document.body.dataset.page || "home";
}

function initAssistantFeature() {
  const restoredState = restoreAssistantSession();

  if (!restoredState) {
    persistAssistantSession();
  }

  initAssistantLauncher();
  initAssistantChat();
  renderAssistantConversation(assistantState.conversationHistory);
  setAssistantTypingState(Boolean(assistantState.isAssistantLoading || assistantState.loadingState));

  return assistantState;
}

function initAssistantLauncher() {
  const launcher = document.getElementById("assistant-launcher");
  const panel = document.getElementById("assistant-panel");
  const closeButton = document.getElementById("assistant-close");

  if (!launcher || !panel) {
    return;
  }

  const applyPanelState = () => {
    const shouldOpen = Boolean(assistantState.assistantOpen || assistantState.panelOpen);
    panel.hidden = !shouldOpen;
    panel.setAttribute("aria-hidden", String(!shouldOpen));
    launcher.setAttribute("aria-expanded", String(shouldOpen));
    launcher.setAttribute("data-open", String(shouldOpen));
    panel.classList.toggle("is-open", shouldOpen);
    panel.classList.toggle("is-closed", !shouldOpen);
  };

  applyPanelState();

  launcher.addEventListener("click", () => {
    const nextState = !Boolean(assistantState.assistantOpen || assistantState.panelOpen);
    updateAssistantState({ assistantOpen: nextState, panelOpen: nextState });
    applyPanelState();
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      updateAssistantState({ assistantOpen: false, panelOpen: false });
      applyPanelState();
    });
  }
}

function initAssistantChat() {
  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-input");

  if (!form || !input) {
    return;
  }

  ensureAssistantSummaryUI();
  renderAssistantPromptChips();
  renderAssistantPreferenceSummary(assistantState.currentPreferences, {
    percentage: assistantState.assistantConfidenceScore,
    explanation: assistantState.assistantConfidenceExplanation,
    status: assistantState.assistantConfidenceStatus
  });
  form.addEventListener("submit", handleAssistantSubmit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}

function ensureAssistantSummaryUI() {
  const panel = document.getElementById("assistant-panel");
  const messagesContainer = document.getElementById("assistant-messages");

  if (!panel || !messagesContainer) {
    return null;
  }

  let summary = document.getElementById("assistant-summary");

  if (!summary) {
    summary = document.createElement("section");
    summary.id = "assistant-summary";
    summary.className = "assistant-panel__summary";
    summary.hidden = true;
    panel.insertBefore(summary, messagesContainer);
  }

  return summary;
}

function renderAssistantPromptChips() {
  const panel = document.getElementById("assistant-panel");
  const messagesContainer = document.getElementById("assistant-messages");

  if (!panel || !messagesContainer) {
    return;
  }

  let suggestionsContainer = document.getElementById("assistant-suggestions");

  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement("div");
    suggestionsContainer.id = "assistant-suggestions";
    suggestionsContainer.className = "assistant-panel__suggestions";
    panel.insertBefore(suggestionsContainer, messagesContainer);
  }

  suggestionsContainer.innerHTML = "";

  assistantSuggestedPrompts.forEach((prompt) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "assistant-panel__suggestion";
    chip.textContent = prompt;
    chip.addEventListener("click", () => {
      const input = document.getElementById("assistant-input");
      if (input) {
        input.value = prompt;
        input.focus();
      }
    });

    suggestionsContainer.appendChild(chip);
  });

  updateAssistantPromptVisibility();
}

function updateAssistantPromptVisibility() {
  const suggestionsContainer = document.getElementById("assistant-suggestions");

  if (!suggestionsContainer) {
    return;
  }

  suggestionsContainer.hidden = Boolean(assistantState.conversationHistory.length);
}

function handleAssistantSubmit(event) {
  event.preventDefault();

  const input = document.getElementById("assistant-input");
  const message = input?.value?.trim();

  if (!message) {
    return;
  }

  addUserMessage(message);
  input.value = "";
  updateAssistantPromptVisibility();
  setAssistantTypingState(true);

  window.setTimeout(() => {
    const isClarificationReply = Boolean(assistantState.pendingClarificationContext);
    const parsedPreferences = parseUserPreferences(message);
    const preferences = isClarificationReply
      ? mergePreferenceUpdates(assistantState.currentPreferences, parsedPreferences)
      : parsedPreferences;
    const confidence = calculateAssistantConfidence(preferences);
    const clarificationField = getClarificationField(preferences, confidence);
    const clarificationPrompt = clarificationField
      ? requestClarificationForUncertainPreferences(preferences, clarificationField)
      : null;

    updateAssistantState({
      currentPreferences: preferences,
      preferences,
      assistantConfidenceScore: confidence.percentage,
      assistantConfidenceStatus: confidence.status,
      assistantConfidenceExplanation: confidence.explanation,
      assistantConfidenceFactors: confidence.factors || [],
      pendingClarificationField: clarificationField || null,
      pendingClarificationContext: clarificationField ? { field: clarificationField, originalMessage: message } : null
    });

    renderAssistantPreferenceSummary(preferences, confidence);
    setAssistantTypingState(false);

    if (clarificationPrompt) {
      addAssistantMessage(clarificationPrompt);
      return;
    }

    addAssistantMessage("I understand your request. I am analysing your preferences...");
  }, 800);
}

function mergePreferenceUpdates(existingPreferences = {}, newPreferences = {}) {
  const mergedPreferences = { ...(existingPreferences || {}) };

  const scalarFields = ["location", "propertyType", "bedrooms", "bathrooms", "budget", "tenure", "developer", "propertyAge"];
  scalarFields.forEach((field) => {
    const incomingValue = newPreferences?.[field];
    const existingValue = existingPreferences?.[field];

    if (incomingValue !== null && incomingValue !== undefined && incomingValue !== "") {
      mergedPreferences[field] = incomingValue;
    } else if (existingValue !== null && existingValue !== undefined && existingValue !== "") {
      mergedPreferences[field] = existingValue;
    }
  });

  if (newPreferences?.floorArea) {
    mergedPreferences.floorArea = newPreferences.floorArea;
  }

  const arrayFields = ["facilities", "nearbyAmenities"];
  arrayFields.forEach((field) => {
    const existingValues = Array.isArray(existingPreferences?.[field]) ? existingPreferences[field] : [];
    const incomingValues = Array.isArray(newPreferences?.[field]) ? newPreferences[field] : [];
    const combinedValues = [...new Set([...(existingValues || []), ...(incomingValues || [])])];
    mergedPreferences[field] = combinedValues;
  });

  const existingRawInput = existingPreferences?.rawInput;
  const incomingRawInput = newPreferences?.rawInput;
  if (existingRawInput && incomingRawInput) {
    mergedPreferences.rawInput = `${existingRawInput} | ${incomingRawInput}`;
  } else {
    mergedPreferences.rawInput = existingRawInput || incomingRawInput || "";
  }

  return mergedPreferences;
}

function getClarificationField(preferences = {}, confidenceResult = {}) {
  const importantFields = ["location", "propertyType", "budget"];
  const confidenceFields = Array.isArray(confidenceResult?.factors) ? confidenceResult.factors : [];

  const missingField = importantFields.find((field) => {
    const match = confidenceFields.find((entry) => entry.name === field);
    return !match || Number(match.score) < 75;
  });

  return missingField || null;
}

function requestClarificationForUncertainPreferences(preferences = {}, field = null) {
  const text = String(preferences.rawInput || "").toLowerCase();

  if (field === "location" || text.includes("north") || text.includes("somewhere")) {
    return "Do you mean Yishun, Woodlands, Sembawang or another area?";
  }

  if (field === "propertyType") {
    return "Would you prefer a condo, HDB or landed home?";
  }

  if (field === "budget") {
    return "What is your maximum budget?";
  }

  return "Could you share a bit more detail about the area or budget so I can narrow it down?";
}

function setAssistantTypingState(isLoading = false) {
  const typingIndicator = document.getElementById("assistant-typing");
  const messagesContainer = document.getElementById("assistant-messages");
  const emptyState = document.getElementById("assistant-empty-state");

  if (typingIndicator) {
    typingIndicator.hidden = !isLoading;
    typingIndicator.setAttribute("aria-hidden", String(!isLoading));
  }

  if (emptyState && isLoading) {
    emptyState.hidden = true;
  }

  updateAssistantState({ loadingState: isLoading });

  if (isLoading && messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function renderAssistantConversation(messages = []) {
  const container = document.getElementById("assistant-messages");
  const emptyState = document.getElementById("assistant-empty-state");

  if (!container) {
    return;
  }

  const safeMessages = Array.isArray(messages) ? messages : [];
  container.querySelectorAll(".assistant-message-wrapper").forEach((element) => element.remove());
  updateAssistantPromptVisibility();

  if (!safeMessages.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  safeMessages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = "assistant-message-wrapper";

    const bubble = document.createElement("div");
    bubble.className = `assistant-message assistant-message--${message.role === "user" ? "user" : "assistant"}`;
    bubble.textContent = message.content || "";

    const time = document.createElement("p");
    time.className = "assistant-message__time";
    time.textContent = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    container.appendChild(wrapper);
  });

  container.scrollTop = container.scrollHeight;
}

function addAssistantMessage(content, timestamp = new Date().toISOString()) {
  const message = {
    role: "assistant",
    content,
    timestamp
  };

  assistantState.conversationHistory = [...assistantState.conversationHistory, message];
  renderAssistantConversation(assistantState.conversationHistory);
  persistAssistantSession();
  return message;
}

function addUserMessage(content, timestamp = new Date().toISOString()) {
  const message = {
    role: "user",
    content,
    timestamp
  };

  assistantState.conversationHistory = [...assistantState.conversationHistory, message];
  renderAssistantConversation(assistantState.conversationHistory);
  persistAssistantSession();
  return message;
}

function parseUserPreferences(input = "") {
  const text = String(input || "").toLowerCase().trim();
  const preferences = {
    rawInput: input,
    location: null,
    propertyType: null,
    bedrooms: null,
    bathrooms: null,
    budget: null,
    floorArea: null,
    facilities: [],
    nearbyAmenities: [],
    tenure: null,
    developer: null,
    propertyAge: null
  };

  const locationPatterns = [
    { value: "Yishun", keywords: ["yishun"] },
    { value: "Tampines", keywords: ["tampines"] },
    { value: "Bishan", keywords: ["bishan"] },
    { value: "Woodlands", keywords: ["woodlands"] },
    { value: "Sembawang", keywords: ["sembawang"] },
    { value: "Jurong", keywords: ["jurong"] },
    { value: "Orchard", keywords: ["orchard"] },
    { value: "Bukit Timah", keywords: ["bukit timah", "bukit-timah"] }
  ];

  const typeMap = {
    condo: "Condo",
    condominium: "Condo",
    hdb: "HDB",
    flat: "HDB",
    landed: "Landed",
    terrace: "Landed",
    house: "Landed"
  };

  const facilityMap = {
    "swimming pool": "Swimming Pool",
    swimming: "Swimming Pool",
    pool: "Swimming Pool",
    gym: "Gym",
    bbq: "BBQ Pit",
    tennis: "Tennis Court",
    parking: "Parking",
    security: "Security"
  };

  const amenityMap = {
    mrt: "MRT",
    station: "MRT",
    school: "School",
    schools: "School",
    mall: "Shopping Mall",
    malls: "Shopping Mall",
    shopping: "Shopping Mall",
    park: "Park"
  };

  locationPatterns.forEach((pattern) => {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      preferences.location = pattern.value;
    }
  });

  Object.entries(typeMap).forEach(([keyword, value]) => {
    if (text.includes(keyword)) {
      preferences.propertyType = value;
    }
  });

  const bedroomMatch = text.match(/(\d+)\s*(room|rooms|bedroom|bedrooms|br)/i);
  if (bedroomMatch) {
    preferences.bedrooms = Number(bedroomMatch[1]);
  }

  const bathroomMatch = text.match(/(\d+)\s*(bathroom|bathrooms|bath|ba)/i);
  if (bathroomMatch) {
    preferences.bathrooms = Number(bathroomMatch[1]);
  }

  const budgetMatch = text.match(/(?:under|below|up to|less than|budget|max(?:imum)?|price|cost)\s*(?:of\s*)?\$?([0-9,.]+)\s*(million|m|k)?/i);
  if (budgetMatch) {
    let budgetValue = Number(budgetMatch[1].replace(/,/g, ""));
    const unit = (budgetMatch[2] || "").toLowerCase();
    if (unit === "million" || unit === "m") {
      budgetValue *= 1000000;
    } else if (unit === "k") {
      budgetValue *= 1000;
    }
    preferences.budget = budgetValue;
  }

  const floorAreaMatch = text.match(/(\d+)\s*(sqft|sq ft|sqm|m2|square feet|square metres|square meter|square meters)/i);
  if (floorAreaMatch) {
    preferences.floorArea = {
      value: Number(floorAreaMatch[1]),
      unit: floorAreaMatch[2].toLowerCase()
    };
  }

  Object.entries(facilityMap).forEach(([keyword, value]) => {
    if (text.includes(keyword)) {
      preferences.facilities.push(value);
    }
  });

  Object.entries(amenityMap).forEach(([keyword, value]) => {
    if (text.includes(keyword)) {
      preferences.nearbyAmenities.push(value);
    }
  });

  if (/freehold/i.test(text)) {
    preferences.tenure = "Freehold";
  } else if (/leasehold/i.test(text)) {
    preferences.tenure = "Leasehold";
  }

  const developerMatch = text.match(/developer\s+([a-z0-9 .&-]+)/i) || text.match(/by\s+([a-z0-9 .&-]+)/i);
  if (developerMatch) {
    preferences.developer = developerMatch[1].trim();
  }

  const propertyAgeMatch = text.match(/(\d+)\s*(year|years|yr|yrs)\s*(old|ago)/i);
  if (propertyAgeMatch) {
    preferences.propertyAge = Number(propertyAgeMatch[1]);
  }

  return preferences;
}

function evaluatePreferenceConfidence(preferences = {}) {
  const fields = [
    { field: "location", value: preferences.location, confidence: preferences.location ? 0.95 : 0.2 },
    { field: "propertyType", value: preferences.propertyType, confidence: preferences.propertyType ? 0.95 : 0.2 },
    { field: "bedrooms", value: preferences.bedrooms, confidence: preferences.bedrooms ? 0.9 : 0.2 },
    { field: "bathrooms", value: preferences.bathrooms, confidence: preferences.bathrooms ? 0.85 : 0.2 },
    { field: "budget", value: preferences.budget, confidence: preferences.budget ? 0.95 : 0.2 },
    { field: "floorArea", value: preferences.floorArea, confidence: preferences.floorArea ? 0.8 : 0.2 },
    { field: "facilities", value: preferences.facilities?.length ? preferences.facilities : null, confidence: preferences.facilities?.length ? 0.85 : 0.2 },
    { field: "nearbyAmenities", value: preferences.nearbyAmenities?.length ? preferences.nearbyAmenities : null, confidence: preferences.nearbyAmenities?.length ? 0.85 : 0.2 },
    { field: "tenure", value: preferences.tenure, confidence: preferences.tenure ? 0.8 : 0.2 },
    { field: "developer", value: preferences.developer, confidence: preferences.developer ? 0.75 : 0.2 },
    { field: "propertyAge", value: preferences.propertyAge, confidence: preferences.propertyAge ? 0.75 : 0.2 }
  ];

  const extractedFields = fields.filter((entry) => {
    const value = entry.value;
    return value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
  });
  const completeness = fields.length ? extractedFields.length / fields.length : 0;

  const ambiguityPenalty = preferences.location ? 0 : 0.1;
  const missingCorePenalty = [preferences.location, preferences.propertyType, preferences.budget].filter(Boolean).length < 3 ? 0.1 : 0;
  const averageConfidence = extractedFields.length
    ? extractedFields.reduce((sum, entry) => sum + entry.confidence, 0) / extractedFields.length
    : 0;
  const adjustedScore = Math.max(0, Math.min(1, completeness * 0.6 + averageConfidence * 0.4 - ambiguityPenalty - missingCorePenalty));

  return {
    fields,
    completeness,
    ambiguityPenalty,
    missingCorePenalty,
    averageConfidence,
    adjustedScore
  };
}

function calculateAssistantConfidence(preferences = {}) {
  const confidenceResult = evaluatePreferenceConfidence(preferences);
  const percentage = Math.round(confidenceResult.adjustedScore * 100);
  const explanation = generateAssistantConfidenceExplanation({
    percentage,
    completeness: confidenceResult.completeness,
    averageConfidence: confidenceResult.averageConfidence,
    extractedCount: confidenceResult.fields.filter((entry) => {
      const value = entry.value;
      return value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
    }).length,
    totalFields: confidenceResult.fields.length
  });

  let status = "high";
  if (percentage < 70) {
    status = "low";
  } else if (percentage < 85) {
    status = "medium";
  }

  return {
    percentage,
    status,
    explanation,
    completeness: confidenceResult.completeness,
    averageConfidence: confidenceResult.averageConfidence,
    ambiguityPenalty: confidenceResult.ambiguityPenalty,
    missingCorePenalty: confidenceResult.missingCorePenalty,
    factors: confidenceResult.fields.map((entry) => ({
      name: entry.field,
      score: Math.round(entry.confidence * 100),
      detail: entry.value ? `${entry.field} was extracted.` : `${entry.field} is still missing.`
    }))
  };
}

function generateAssistantConfidenceExplanation(confidenceResult = {}) {
  const percentage = Number(confidenceResult.percentage ?? 0);
  const extractedCount = Number(confidenceResult.extractedCount ?? 0);
  const totalFields = Number(confidenceResult.totalFields ?? 0);

  if (!totalFields) {
    return "The assistant needs a bit more detail before it can judge the request confidently.";
  }

  if (percentage >= 85) {
    return `High confidence because the assistant extracted ${extractedCount} out of ${totalFields} preference signals clearly.`;
  }

  if (percentage >= 70) {
    return `Medium confidence because the main request is understood, but a few preference details are still incomplete.`;
  }

  return `Lower confidence because several key preferences are missing or unclear, so the assistant may need a follow-up.`;
}

function renderAssistantPreferenceSummary(preferences = null, confidenceResult = null) {
  const summary = ensureAssistantSummaryUI();

  if (!summary) {
    return;
  }

  const hasPreferences = preferences && Object.values(preferences).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "object" && value !== null) {
      return Boolean(Object.keys(value).length);
    }

    return Boolean(value);
  });

  if (!hasPreferences && !confidenceResult?.percentage) {
    summary.hidden = true;
    summary.innerHTML = "";
    return;
  }

  const chips = [];
  const chipDefinitions = [
    { label: "Location", value: preferences?.location },
    { label: "Type", value: preferences?.propertyType },
    { label: "Bedrooms", value: preferences?.bedrooms },
    { label: "Budget", value: preferences?.budget ? `$${preferences.budget.toLocaleString()}` : null },
    { label: "Floor Area", value: preferences?.floorArea ? `${preferences.floorArea.value} ${preferences.floorArea.unit}` : null },
    { label: "Facilities", value: Array.isArray(preferences?.facilities) ? preferences.facilities.join(", ") : null },
    { label: "Nearby", value: Array.isArray(preferences?.nearbyAmenities) ? preferences.nearbyAmenities.join(", ") : null },
    { label: "Tenure", value: preferences?.tenure },
    { label: "Developer", value: preferences?.developer },
    { label: "Age", value: preferences?.propertyAge ? `${preferences.propertyAge} years` : null }
  ];

  chipDefinitions.forEach((chip) => {
    if (chip.value) {
      chips.push(`<span class="assistant-panel__chip">${chip.label}: ${chip.value}</span>`);
    }
  });

  summary.innerHTML = `
    <div class="assistant-panel__confidence">
      <p class="assistant-panel__confidence-label">Assistant Confidence Score</p>
      <p class="assistant-panel__confidence-score">${confidenceResult?.percentage ?? 0}%</p>
      <p class="assistant-panel__confidence-explanation">${confidenceResult?.explanation || "The assistant is reviewing your request."}</p>
    </div>
    <div class="assistant-panel__chips">${chips.join("")}</div>
  `;
  summary.hidden = false;
}

function updateAssistantState(patch = {}) {
  Object.assign(assistantState, patch);
  if (patch.assistantOpen !== undefined) {
    assistantState.panelOpen = Boolean(patch.assistantOpen);
  }
  if (patch.panelOpen !== undefined) {
    assistantState.assistantOpen = Boolean(patch.panelOpen);
  }
  persistAssistantSession();
  return assistantState;
}

function persistAssistantSession() {
  try {
    localStorage.setItem(STORAGE_KEYS.assistantSession, JSON.stringify(assistantState));
  } catch (error) {
    // Ignore persistence failures silently.
  }
}

function restoreAssistantSession() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEYS.assistantSession);
    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState);
    if (!parsedState || typeof parsedState !== "object") {
      return null;
    }

    const restoredAssistantOpen = parsedState.assistantOpen ?? parsedState.panelOpen ?? false;
    const restoredConversationHistory = Array.isArray(parsedState.conversationHistory) ? parsedState.conversationHistory : [];
    const restoredRecommendations = Array.isArray(parsedState.currentRecommendations) ? parsedState.currentRecommendations : [];
    const restoredFactors = Array.isArray(parsedState.assistantConfidenceFactors) ? parsedState.assistantConfidenceFactors : [];

    Object.assign(assistantState, {
      assistantOpen: Boolean(restoredAssistantOpen),
      panelOpen: Boolean(restoredAssistantOpen),
      conversationHistory: restoredConversationHistory,
      currentPreferences: parsedState.currentPreferences ?? parsedState.preferences ?? null,
      currentRecommendations: restoredRecommendations,
      assistantConfidenceScore: parsedState.assistantConfidenceScore ?? parsedState.confidenceScore ?? null,
      assistantConfidenceStatus: parsedState.assistantConfidenceStatus ?? null,
      assistantConfidenceExplanation: parsedState.assistantConfidenceExplanation ?? null,
      assistantConfidenceFactors: restoredFactors,
      activeChatSessionId: parsedState.activeChatSessionId ?? null,
      isAssistantLoading: Boolean(parsedState.isAssistantLoading ?? parsedState.loadingState),
      pendingClarificationField: parsedState.pendingClarificationField ?? null,
      pendingClarificationContext: parsedState.pendingClarificationContext ?? null,
      selectedPropertyId: parsedState.selectedPropertyId ?? null,
      lastSearchContext: parsedState.lastSearchContext ?? {},
      preferences: parsedState.currentPreferences ?? parsedState.preferences ?? null,
      loadingState: Boolean(parsedState.isAssistantLoading ?? parsedState.loadingState),
      confidenceScore: parsedState.assistantConfidenceScore ?? parsedState.confidenceScore ?? null
    });

    return assistantState;
  } catch (error) {
    return null;
  }
}

function bindMenuToggle() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

async function fetchJson(url, options = {}, fallbackValue = null) {
  console.info("fetchJson: fetching", url);

  try {
    const response = await fetch(url, options);
    console.info("fetchJson: response status", response.status, response.statusText, url);

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (!payload || payload.success === false) {
      throw new Error(payload?.message || "The request returned an invalid response.");
    }

    if (!payload?.data) {
      throw new Error("The request did not include any data.");
    }

    return payload;
  } catch (error) {
    console.error("fetchJson: error fetching", url, error);
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    throw new Error(error.message || "Unable to load content right now.");
  }
}

function getFavourites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favourites);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveFavourites() {
  localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(state.favourites));
}

function isFavourite(propertyId) {
  return state.favourites.some((item) => item.id === propertyId);
}

function toggleFavourite(property) {
  const exists = state.favourites.find((item) => item.id === property.id);
  if (exists) {
    state.favourites = state.favourites.filter((item) => item.id !== property.id);
  } else {
    state.favourites = [
      {
        ...property,
        favouriteAddedAt: new Date().toISOString()
      },
      ...state.favourites
    ];
  }

  saveFavourites();
  return state.favourites;
}

function renderPropertyCard(property) {
  const card = document.createElement("article");
  card.className = "property-card card";

  if (!property || typeof property !== "object") {
    return card;
  }

  card.propertyData = property;

  const title = typeof property.title === "string" ? property.title.trim() : "";
  const location = typeof property.location === "string" ? property.location.trim() : "";
  const propertyType = typeof property.propertyType === "string" ? property.propertyType.trim() : "";
  const image = Array.isArray(property.images) && property.images.some((value) => typeof value === "string" && value.trim())
    ? property.images.find((value) => typeof value === "string" && value.trim())
    : "";
  const priceValue = property.price;
  const bedroomsValue = property.bedrooms;
  const bathroomsValue = property.bathrooms;
  const floorAreaValue = property.floorArea;
  const nearestMrtValue = typeof property.nearestMrt === "string" ? property.nearestMrt.trim() : "";
  const tenureValue = typeof property.tenure === "string" ? property.tenure.trim() : "";

  if (image) {
    const imageElement = document.createElement("img");
    imageElement.className = "property-card__image";
    imageElement.src = image;
    imageElement.alt = title || "Property image";
    imageElement.loading = "lazy";
    card.appendChild(imageElement);
  }

  if (title) {
    const titleElement = document.createElement("h3");
    titleElement.className = "property-card__title";
    titleElement.textContent = title;
    card.appendChild(titleElement);
  }

  if (location) {
    const metaElement = document.createElement("p");
    metaElement.className = "property-card__meta";
    metaElement.textContent = location;
    card.appendChild(metaElement);
  }

  if (priceValue !== null && priceValue !== undefined && priceValue !== "") {
    const priceElement = document.createElement("p");
    priceElement.className = "property-card__price";
    priceElement.textContent = formatCurrency(priceValue);
    card.appendChild(priceElement);
  }

  const detailItems = [];

  if (propertyType) {
    detailItems.push(propertyType);
  }

  if (Number.isFinite(Number(bedroomsValue)) && Number(bedroomsValue) > 0) {
    detailItems.push(`${Number(bedroomsValue)} bd`);
  }

  if (Number.isFinite(Number(bathroomsValue)) && Number(bathroomsValue) > 0) {
    detailItems.push(`${Number(bathroomsValue)} ba`);
  }

  if (Number.isFinite(Number(floorAreaValue)) && Number(floorAreaValue) > 0) {
    detailItems.push(formatArea(Number(floorAreaValue)));
  }

  if (detailItems.length) {
    const detailsElement = document.createElement("div");
    detailsElement.className = "property-card__details";

    detailItems.forEach((detailItem) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = detailItem;
      detailsElement.appendChild(tag);
    });

    card.appendChild(detailsElement);
  }

  const secondaryDetails = [tenureValue, nearestMrtValue].filter(Boolean);
  if (secondaryDetails.length) {
    const summaryElement = document.createElement("p");
    summaryElement.className = "property-card__meta";
    summaryElement.textContent = secondaryDetails.join(" • ");
    card.appendChild(summaryElement);
  }

  const actionsElement = document.createElement("div");
  actionsElement.className = "property-card__actions";

  const favouriteButton = document.createElement("button");
  favouriteButton.className = `button button--outline favourite-button ${isFavourite(property.id) ? "active" : ""}`;
  favouriteButton.type = "button";
  favouriteButton.dataset.favouriteId = property.id;
  favouriteButton.setAttribute("aria-pressed", String(isFavourite(property.id)));
  favouriteButton.setAttribute("aria-label", `Save ${title || "property"} to favourites`);
  favouriteButton.textContent = isFavourite(property.id) ? "Saved" : "Favourite";
  actionsElement.appendChild(favouriteButton);

  const detailsLink = document.createElement("a");
  detailsLink.className = "button button--primary";
  detailsLink.href = `property.html?id=${property.id}`;
  detailsLink.textContent = "View Details";
  actionsElement.appendChild(detailsLink);

  card.appendChild(actionsElement);
  return card;
}

function renderMovingServiceCard(service, container) {
  if (!container) {
    return;
  }

  const image = service.image || "images/moving/fullmove.jpg";
  const card = document.createElement("article");
  card.className = "service-card card";
  card.innerHTML = `
    <img class="service-card__image" src="${encodeURI(image)}" alt="${service.title}" loading="lazy" />
    <h3 class="service-card__title">${service.title}</h3>
    <p class="service-card__meta">${service.category || "Service"}</p>
    <p>${service.description}</p>
    <p class="property-card__price">${formatCurrency(service.price)}</p>
    <div class="property-card__actions">
      <a class="button button--primary" href="${service.ctaUrl || "moving.html"}">${service.ctaLabel || "Learn more"}</a>
    </div>
  `;

  container.appendChild(card);
}

function getDemoPropertyList() {
  return DEMO_PROPERTIES.map((property) => ({ ...property }));
}

function getDemoPropertyById(propertyId) {
  return getDemoPropertyList().find((property) => property.id === propertyId) || getDemoPropertyList()[0];
}

function getDemoRelatedProperties(propertyType = "") {
  const properties = getDemoPropertyList();
  if (!propertyType) {
    return properties.slice(0, PAGE_CONFIG.relatedLimit);
  }

  return properties.filter((property) => property.propertyType === propertyType).slice(0, PAGE_CONFIG.relatedLimit);
}

function resolvePropertyList(payload) {
  const properties = Array.isArray(payload?.data?.properties) ? payload.data.properties : [];
  return properties.length ? properties : getDemoPropertyList();
}

function resolvePropertyDetails(payload, propertyId) {
  const property = payload?.data?.property;
  if (property && typeof property === "object") {
    return property;
  }

  return getDemoPropertyById(propertyId);
}

function getMovingServices(payload) {
  const services = Array.isArray(payload?.data?.services) ? payload.data.services : [];
  return services.length ? services : DEMO_MOVING_SERVICES;
}

function renderNavigation(container) {
  if (!container) {
    return;
  }

  const links = [
    { label: "Home", href: "index.html" },
    { label: "Search Properties", href: "search.html" },
    { label: "Mortgage Calculator", href: "mortgage.html" },
    { label: "Moving Services", href: "moving.html" },
    { label: "Favourites", href: "favourites.html" }
  ];

  const currentPage = getPageName();
  const currentPath = window.location.pathname.replace(/\/$/, "");
  const markup = links
    .map((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, "");
      const isActive = linkPath === currentPath || (currentPage === "home" && linkPath.endsWith("/index.html"));
      return `<a href="${link.href}" class="${isActive ? "active" : ""}">${link.label}</a>`;
    })
    .join("");

  container.innerHTML = markup;
}

function renderFooter(container) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="container">
      <div>
        <h3>Quick links</h3>
        <p><a href="index.html">Home</a></p>
        <p><a href="search.html">Search</a></p>
        <p><a href="mortgage.html">Mortgage</a></p>
      </div>
      <div>
        <h3>Contact</h3>
        <p>hello@moveease.sg</p>
        <p>+65 6123 4567</p>
      </div>
      <div>
        <h3>About</h3>
        <p>Helping Singaporeans move with ease.</p>
      </div>
    </div>
  `;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatArea(value) {
  return `${Number(value || 0).toLocaleString()} sqft`;
}

function formatPrice(value) {
  return formatCurrency(value);
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("en-SG");
}

function showLoading(container) {
  if (!container) {
    return;
  }
  container.hidden = false;
  container.textContent = "Loading content...";
}

function hideLoading(container) {
  if (!container) {
    return;
  }
  container.hidden = true;
  container.textContent = "";
}

function showError(message, type = "error") {
  const errorElement = document.getElementById("error-state");
  if (!errorElement) {
    return;
  }
  errorElement.hidden = false;
  errorElement.dataset.type = type;
  errorElement.textContent = message;
}

function clearError() {
  const errorElement = document.getElementById("error-state");
  if (!errorElement) {
    return;
  }
  errorElement.hidden = true;
  errorElement.textContent = "";
}

function parseSearchParams(queryString = window.location.search) {
  const params = new URLSearchParams(queryString);
  return {
    location: params.get("location") || "",
    propertyType: params.get("propertyType") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    bedrooms: params.get("bedrooms") || "",
    bathrooms: params.get("bathrooms") || "",
    sort: params.get("sort") || "newest",
    page: Number(params.get("page") || 1)
  };
}

function updateSearchParams(params = {}) {
  const currentParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value == null) {
      currentParams.delete(key);
    } else {
      currentParams.set(key, String(value));
    }
  });
  return currentParams.toString() ? `?${currentParams.toString()}` : "";
}

function validateSearchFilters(filters) {
  const errors = [];
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || 0);

  if (filters.minPrice && filters.maxPrice && minPrice > maxPrice) {
    errors.push("Minimum price cannot be greater than maximum price.");
  }

  if (filters.bedrooms && Number(filters.bedrooms) < 1) {
    errors.push("Bedrooms must be at least 1.");
  }

  if (filters.bathrooms && Number(filters.bathrooms) < 1) {
    errors.push("Bathrooms must be at least 1.");
  }

  return errors;
}

function filterProperties(properties, filters = {}) {
  const locationQuery = String(filters.location || "").trim().toLowerCase();
  const propertyType = String(filters.propertyType || "").trim().toLowerCase();
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || 0);
  const bedrooms = Number(filters.bedrooms || 0);
  const bathrooms = Number(filters.bathrooms || 0);

  return properties.filter((property) => {
    const location = String(property.location || "").toLowerCase();
    const type = String(property.propertyType || "").toLowerCase();
    const price = Number(property.price || 0);
    const bedroomCount = Number(property.bedrooms || 0);
    const bathroomCount = Number(property.bathrooms || 0);

    if (locationQuery && !location.includes(locationQuery)) {
      return false;
    }
    if (propertyType && type !== propertyType) {
      return false;
    }
    if (minPrice && price < minPrice) {
      return false;
    }
    if (maxPrice && price > maxPrice) {
      return false;
    }
    if (bedrooms && bedroomCount < bedrooms) {
      return false;
    }
    if (bathrooms && bathroomCount < bathrooms) {
      return false;
    }
    return true;
  });
}

function sortProperties(properties, sortBy) {
  const list = [...properties];
  switch (sortBy) {
    case "price_asc":
      return list.sort((a, b) => a.price - b.price);
    case "price_desc":
      return list.sort((a, b) => b.price - a.price);
    case "area_desc":
      return list.sort((a, b) => (b.floorArea || 0) - (a.floorArea || 0));
    case "area_asc":
      return list.sort((a, b) => (a.floorArea || 0) - (b.floorArea || 0));
    default:
      return list.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
  }
}

function renderPagination(totalPages, currentPage) {
  const pagination = document.getElementById("pagination-controls");
  if (!pagination) {
    return;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pageNumbers = [];
  for (let page = 1; page <= totalPages; page += 1) {
    pageNumbers.push(`<button type="button" class="${page === currentPage ? "active" : ""}" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`);
  }

  const prevButton = `<button type="button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage <= 1 ? "disabled" : ""}>Prev</button>`;
  const nextButton = `<button type="button" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>`;

  pagination.innerHTML = `${prevButton}${pageNumbers.join("")}${nextButton}`;

  pagination.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = Number(button.dataset.page);
      if (Number.isFinite(page) && page > 0) {
        changePage(page);
      }
    });
  });
}

async function changePage(pageNumber) {
  const filters = { ...state.currentSearchFilters, page: pageNumber };
  state.currentPage = pageNumber;
  const query = updateSearchParams(filters);
  window.history.replaceState({}, "", `${window.location.pathname}${query}`);
  await loadSearchResults();
}

function attachFavouriteHandlers(container) {
  container.querySelectorAll("[data-favourite-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const propertyId = button.getAttribute("data-favourite-id");
      const card = button.closest(".property-card");
      const property = (card && card.propertyData) || state.searchResults.find((item) => item.id === propertyId) || state.selectedProperty;
      if (!property) {
        return;
      }

      toggleFavourite(property);
      const isSaved = isFavourite(property.id);
      button.classList.toggle("active", isSaved);
      button.setAttribute("aria-pressed", String(isSaved));
      button.textContent = isSaved ? "Saved" : "Favourite";

      if (document.body.dataset.page === "favourites" && !isSaved) {
        card?.remove();
        if (!container.querySelector(".property-card")) {
          container.innerHTML = '<p class="status-message">You have not saved any properties yet.</p>';
        }
      }
    });
  });
}

function initHeroSlideshow() {
  const slideshow = document.querySelector(".hero__bg");
  const slides = Array.from(slideshow?.querySelectorAll(".hero__bg-slide") || []);

  if (!slideshow || !slides.length) {
    return null;
  }

  let currentIndex = 0;
  let intervalId = null;
  let isVisible = true;

  const setActiveSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("hero__bg-slide--active", slideIndex === index);
    });
  };

  const preloadSlide = (index) => {
    const slide = slides[index];
    if (!slide) {
      return;
    }

    const src = slide.getAttribute("data-src") || slide.getAttribute("src") || "";
    if (!src) {
      return;
    }

    if (!slide.getAttribute("src")) {
      slide.setAttribute("src", src);
    }

    const img = new Image();
    img.src = src;
  };

  const startRotation = () => {
    if (intervalId !== null) {
      return;
    }

    intervalId = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      setActiveSlide(currentIndex);
    }, 6000);
  };

  const stopRotation = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isVisible = false;
      stopRotation();
      return;
    }

    isVisible = true;
    if (slides.length > 1) {
      startRotation();
    }
  };

  preloadSlide(currentIndex);
  setActiveSlide(currentIndex);

  if (slides.length > 1) {
    startRotation();
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return {
    stop: stopRotation,
    start: startRotation,
    setActiveSlide
  };
}

function initFeaturedPropertyCarousel(container) {
  const wrapper = container?.closest(".property-carousel");
  if (!wrapper || !container) {
    return;
  }

  const previousButton = wrapper.querySelector("[data-carousel-prev]");
  const nextButton = wrapper.querySelector("[data-carousel-next]");

  if (!previousButton || !nextButton) {
    return;
  }

  const getScrollStep = () => {
    const card = container.querySelector(".property-card");
    if (!card) {
      return 320;
    }

    const cardRect = card.getBoundingClientRect();
    return cardRect.width + 20;
  };

  const updateButtons = () => {
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    previousButton.disabled = container.scrollLeft <= 8;
    nextButton.disabled = container.scrollLeft >= maxScroll - 8;
  };

  previousButton.addEventListener("click", () => {
    container.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    container.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });

  container.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
}

async function initHomePage() {
  const container = document.getElementById("featured-properties");
  const loading = document.getElementById("loading-state");
  const error = document.getElementById("error-state");

  initHeroSlideshow();

  if (!container) {
    return;
  }

  showLoading(loading);
  clearError();

  const form = document.getElementById("home-search-form");
  if (form) {
    initLocationAutocomplete(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());
      const query = new URLSearchParams({
        location: values.location || "",
        propertyType: values.propertyType || "",
        minPrice: values.minPrice || "",
        maxPrice: values.maxPrice || "",
        bedrooms: values.bedrooms || "",
        bathrooms: values.bathrooms || ""
      });
      window.location.href = `search.html?${query.toString()}`;
    });
  }

  try {
    const payload = await fetchJson(
      `${API_BASE_URL}${API_ENDPOINTS.featuredProperties}`,
      {},
      { success: true, message: "Loaded featured properties", data: { properties: getDemoPropertyList() } }
    );
    console.info("initHomePage: fetched payload", { url: `${API_BASE_URL}${API_ENDPOINTS.featuredProperties}`, payload });
    const properties = resolvePropertyList(payload);
    container.innerHTML = "";
    if (!properties.length) {
      container.innerHTML = '<p class="status-message">No featured homes are available right now.</p>';
      hideLoading(loading);
      return;
    }

    properties.forEach((property) => {
      container.appendChild(renderPropertyCard(property));
    });
    attachFavouriteHandlers(container);
    initFeaturedPropertyCarousel(container);
    hideLoading(loading);
  } catch (catchError) {
    hideLoading(loading);
    container.innerHTML = '<p class="status-message">Showing featured homes from the local showcase.</p>';
  }

  try {
    const preview = document.getElementById("moving-preview");
    const payload = await fetchJson(`${API_BASE_URL}${API_ENDPOINTS.movingServices}`);
    const services = getMovingServices(payload);
    if (preview) {
      preview.innerHTML = "";
      services.slice(0, 3).forEach((service) => renderMovingServiceCard(service, preview));
    }
  } catch (catchError) {
    const preview = document.getElementById("moving-preview");
    if (preview) {
      preview.innerHTML = "";
      getMovingServices().slice(0, 3).forEach((service) => renderMovingServiceCard(service, preview));
    }
    if (error) {
      error.textContent = catchError.message || "Showing recommended moving services.";
      error.hidden = false;
    }
  }
}

function getLevenshteinDistance(left, right) {
  const leftLength = left.length;
  const rightLength = right.length;
  const matrix = Array.from({ length: leftLength + 1 }, () => Array(rightLength + 1).fill(0));

  for (let index = 0; index <= leftLength; index += 1) {
    matrix[index][0] = index;
  }

  for (let index = 0; index <= rightLength; index += 1) {
    matrix[0][index] = index;
  }

  for (let leftIndex = 1; leftIndex <= leftLength; leftIndex += 1) {
    for (let rightIndex = 1; rightIndex <= rightLength; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      matrix[leftIndex][rightIndex] = Math.min(
        matrix[leftIndex - 1][rightIndex] + 1,
        matrix[leftIndex][rightIndex - 1] + 1,
        matrix[leftIndex - 1][rightIndex - 1] + substitutionCost
      );
    }
  }

  return matrix[leftLength][rightLength];
}

function rankLocationMatches(query, suggestions) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const scoredSuggestions = suggestions.map((suggestionItem) => {
    const suggestionText = typeof suggestionItem === "string" ? suggestionItem : suggestionItem.suggestion;
    const normalizedSuggestion = suggestionText.toLowerCase();
    const suggestionWords = normalizedSuggestion.split(/\s+/);

    let score = 0;

    if (normalizedSuggestion === normalizedQuery) {
      score += 100;
    } else if (normalizedSuggestion.startsWith(normalizedQuery)) {
      score += 60;
    }

    const wordStartsWithQuery = suggestionWords.some((word) => word.startsWith(normalizedQuery));
    if (wordStartsWithQuery) {
      score += 35;
    }

    if (normalizedSuggestion.includes(normalizedQuery)) {
      score += 20;
    }

    if (normalizedQuery.length >= 3) {
      const distance = getLevenshteinDistance(normalizedQuery, normalizedSuggestion);
      const maxDistance = Math.max(2, Math.floor(normalizedQuery.length / 3));
      if (distance <= maxDistance) {
        score += Math.max(10, 20 - distance * 4);
      }
    }

    return { ...suggestionItem, suggestion: suggestionText, score };
  });

  return scoredSuggestions
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.suggestion.localeCompare(right.suggestion))
    .slice(0, 8);
}

function initLocationAutocomplete(form) {
  let input = form.elements.location;
  // Fallback: find the input inside an element with class `autocomplete-field`
  if (!input) {
    const fallback = form.querySelector('.autocomplete-field input[name="location"]');
    if (fallback) {
      input = fallback;
    }
  }
  if (!input) {
    return;
  }

  // Ensure we attach the listbox to the nearest `.autocomplete-field` container
  // so positioning (position: relative) from CSS continues to work.
  const outerContainer = input.closest('.autocomplete-field') || input.parentNode;
  const wrapper = document.createElement("div");
  wrapper.className = "autocomplete";
  // If input is already directly inside the outer container, replace in-place,
  // otherwise insert wrapper before the input then move the input into it.
  if (input.parentNode !== outerContainer) {
    outerContainer.insertBefore(wrapper, input);
  } else {
    input.parentNode.insertBefore(wrapper, input);
  }
  wrapper.appendChild(input);

  const listboxId = "location-autocomplete-list";
  const listbox = document.createElement("div");
  listbox.className = "autocomplete__list";
  listbox.id = listboxId;
  listbox.setAttribute("role", "listbox");
  listbox.hidden = true;
  listbox.style.display = "none";
  wrapper.appendChild(listbox);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", listboxId);
  input.setAttribute("aria-expanded", "false");

  let activeIndex = -1;

  void ensureLocationAutocompleteSuggestions().then(() => {
    if (String(input.value || "").trim()) {
      renderSuggestions(input.value);
    }
  });

  const renderSuggestions = (query) => {
    const q = String(query || "").trim();
    if (!q) {
      hideSuggestions();
      return;
    }

    const suggestionSource = locationAutocompleteState.suggestions.length
      ? locationAutocompleteState.suggestions
      : [];

    const visibleSuggestions = rankLocationMatches(q, suggestionSource);

    if (!visibleSuggestions.length && !locationAutocompleteState.isLoading) {
      void ensureLocationAutocompleteSuggestions().then(() => {
        if (String(input.value || "").trim()) {
          renderSuggestions(input.value);
        }
      });
    }

    if (!visibleSuggestions.length) {
      listbox.innerHTML = '<div class="autocomplete__empty" role="option">No locations found</div>';
      listbox.hidden = false;
      listbox.style.display = "grid";
      input.setAttribute("aria-expanded", "true");
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }

    listbox.innerHTML = visibleSuggestions
      .map((item, index) => `
        <button class="autocomplete__option" type="button" id="${listboxId}-option-${index}" role="option" data-index="${index}" data-property-id="${item.propertyId || ""}" data-suggestion-value="${item.value || ""}" aria-selected="${index === activeIndex}">
          ${item.suggestion}
        </button>
      `)
      .join("");
    listbox.hidden = false;
    listbox.style.display = "grid";
    input.setAttribute("aria-expanded", "true");
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
  };

  const hideSuggestions = () => {
    listbox.hidden = true;
    listbox.style.display = "none";
    listbox.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");
  };

  input.addEventListener("input", () => {
    const trimmed = String(input.value || "").trim();
    if (!trimmed) {
      hideSuggestions();
      return;
    }
    renderSuggestions(input.value);
  });

  input.addEventListener("focus", () => {
    // focus
    const trimmed = String(input.value || "").trim();
    if (!trimmed) {
      hideSuggestions();
      return;
    }
    renderSuggestions(input.value);
  });

  input.addEventListener("keydown", (event) => {
    const options = Array.from(listbox.querySelectorAll(".autocomplete__option"));

    if (!options.length) {
      if (event.key === "Escape") {
        hideSuggestions();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % options.length;
      options.forEach((option, index) => {
        option.classList.toggle("is-active", index === activeIndex);
        option.setAttribute("aria-selected", String(index === activeIndex));
      });
      input.setAttribute("aria-activedescendant", options[activeIndex].id);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + options.length) % options.length;
      options.forEach((option, index) => {
        option.classList.toggle("is-active", index === activeIndex);
        option.setAttribute("aria-selected", String(index === activeIndex));
      });
      input.setAttribute("aria-activedescendant", options[activeIndex].id);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      applySuggestion(options[activeIndex]);
    } else if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  const applySuggestion = (option) => {
    if (!option) {
      return;
    }

    const propertyId = option.dataset.propertyId;
    if (propertyId) {
      window.location.assign(`property.html?id=${encodeURIComponent(propertyId)}`);
      return;
    }

    input.value = option.dataset.suggestionValue || option.textContent.trim();
    hideSuggestions();
  };

  listbox.addEventListener("click", (event) => {
    const option = event.target.closest(".autocomplete__option");
    if (!option) {
      return;
    }

    applySuggestion(option);
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      hideSuggestions();
    }
  });
}

async function initSearchPage() {
  const container = document.getElementById("search-results");
  const loading = document.getElementById("loading-state");
  const form = document.getElementById("search-form");
  if (!container || !form) {
    return;
  }

  initLocationAutocomplete(form);

  const params = parseSearchParams();
  state.currentSearchFilters = { ...DEFAULT_FILTERS, ...params };
  state.currentPage = Number(params.page || 1);

  const filters = state.currentSearchFilters;
  form.elements.location.value = filters.location || "";
  form.elements.propertyType.value = filters.propertyType || "";
  form.elements.minPrice.value = filters.minPrice || "";
  form.elements.maxPrice.value = filters.maxPrice || "";
  form.elements.bedrooms.value = filters.bedrooms || "";
  form.elements.bathrooms.value = filters.bathrooms || "";
  form.elements.sort.value = filters.sort || "newest";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const errors = validateSearchFilters(values);
    if (errors.length) {
      showError(errors[0], "validation_error");
      return;
    }

    state.currentSearchFilters = { ...DEFAULT_FILTERS, ...values, page: 1 };
    const query = updateSearchParams(state.currentSearchFilters);
    window.history.replaceState({}, "", `${window.location.pathname}${query}`);
    await loadSearchResults();
  });

  await loadSearchResults();
}

async function loadSearchResults() {
  const container = document.getElementById("search-results");
  const loading = document.getElementById("loading-state");
  const pagination = document.getElementById("pagination-controls");
  if (!container) {
    return;
  }

  showLoading(loading);
  clearError();

  const queryParams = new URLSearchParams();
  Object.entries(state.currentSearchFilters).forEach(([key, value]) => {
    if (value && value !== "newest") {
      queryParams.set(key, String(value));
    }
  });
  queryParams.set("page", String(state.currentPage));
  queryParams.set("limit", String(PAGE_CONFIG.pageSize));

  try {
    const payload = await fetchJson(
      `${API_BASE_URL}${API_ENDPOINTS.searchProperties}?${queryParams.toString()}`,
      {},
      { success: true, message: "Loaded search results", data: { properties: getDemoPropertyList() } }
    );
    console.info("loadSearchResults: fetched payload", { url: `${API_BASE_URL}${API_ENDPOINTS.searchProperties}?${queryParams.toString()}`, payload });
    const properties = resolvePropertyList(payload);
    const filteredProperties = filterProperties(properties, state.currentSearchFilters);
    const sortedProperties = sortProperties(filteredProperties, state.currentSearchFilters.sort || "newest");
    const totalItems = sortedProperties.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_CONFIG.pageSize));
    const safePage = Math.min(state.currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_CONFIG.pageSize;
    const pagedProperties = sortedProperties.slice(startIndex, startIndex + PAGE_CONFIG.pageSize);

    state.currentPage = safePage;
    state.searchResults = sortedProperties;
    container.innerHTML = "";

    if (!pagedProperties.length) {
      container.innerHTML = '<p class="status-message">No properties matched your current filters.</p>';
      if (pagination) {
        pagination.innerHTML = "";
      }
      hideLoading(loading);
      return;
    }

    pagedProperties.forEach((property) => {
      container.appendChild(renderPropertyCard(property));
    });
    attachFavouriteHandlers(container);
    renderPagination(totalPages, state.currentPage);
    hideLoading(loading);
  } catch (catchError) {
    hideLoading(loading);
    showError(catchError.message || "Unable to load search results.", "api_error");
  }
}

async function initPropertyPage() {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("id");
  const loading = document.getElementById("loading-state");
  const image = document.getElementById("property-image");
  const title = document.getElementById("property-title");
  const location = document.getElementById("property-location");
  const description = document.getElementById("property-description");
  const amenitiesList = document.getElementById("property-amenities");
  const statsGrid = document.getElementById("property-stats");
  const favouriteButton = document.getElementById("property-favourite-button");
  const relatedContainer = document.getElementById("related-properties");

  if (!propertyId) {
    showError("This page needs a property id.", "validation_error");
    return;
  }

  showLoading(loading);
  clearError();

  try {
    const payload = await fetchJson(
      `${API_BASE_URL}${API_ENDPOINTS.propertyDetails(propertyId)}`,
      {},
      { success: true, message: "Loaded property details", data: { property: getDemoPropertyById(propertyId) } }
    );
    const property = resolvePropertyDetails(payload, propertyId);
    if (!property) {
      throw new Error("Property not found.");
    }

    state.selectedProperty = property;
    if (title) {
      title.textContent = property.title;
    }
    if (location) {
      location.textContent = property.location;
    }
    if (description) {
      description.textContent = property.description || "A well-presented home with plenty of comfort.";
    }
    if (image) {
      image.src = Array.isArray(property.images) && property.images.length ? property.images[0] : "https://placehold.co/800x500?text=MoveEase";
      image.alt = property.title;
    }

    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stats-item"><strong>${formatCurrency(property.price)}</strong><p>Price</p></div>
        <div class="stats-item"><strong>${property.bedrooms || 0}</strong><p>Bedrooms</p></div>
        <div class="stats-item"><strong>${property.bathrooms || 0}</strong><p>Bathrooms</p></div>
        <div class="stats-item"><strong>${formatArea(property.floorArea || 0)}</strong><p>Floor area</p></div>
      `;
    }

    if (amenitiesList) {
      amenitiesList.innerHTML = "";
      const amenities = Array.isArray(property.amenities) && property.amenities.length ? property.amenities : ["Comfortable living spaces", "Excellent location"];
      amenities.forEach((amenity) => {
        const item = document.createElement("li");
        item.textContent = amenity;
        amenitiesList.appendChild(item);
      });
    }

    const schoolList = Array.isArray(property.schools) && property.schools.length ? property.schools : [];
    const mrtList = Array.isArray(property.mrt) && property.mrt.length ? property.mrt : [];
    const infoSection = document.getElementById("property-info-details");
    if (infoSection) {
      const schoolMarkup = schoolList.length ? `<li>${schoolList.join("</li><li>")}</li>` : "<li>School details will be added soon.</li>";
      const mrtMarkup = mrtList.length ? `<li>${mrtList.join("</li><li>")}</li>` : "<li>Transport links available on request.</li>";
      infoSection.innerHTML = `
        <div class="summary-card">
          <h2>Schools nearby</h2>
          <ul class="amenities-list">${schoolMarkup}</ul>
        </div>
        <div class="summary-card">
          <h2>MRT & transport</h2>
          <ul class="amenities-list">${mrtMarkup}</ul>
        </div>
      `;
    }

    if (favouriteButton) {
      favouriteButton.classList.toggle("active", isFavourite(property.id));
      favouriteButton.textContent = isFavourite(property.id) ? "Saved" : "Save";
      favouriteButton.addEventListener("click", () => {
        toggleFavourite(property);
        favouriteButton.classList.toggle("active", isFavourite(property.id));
        favouriteButton.textContent = isFavourite(property.id) ? "Saved" : "Save";
      });
    }

    if (relatedContainer) {
      const relatedPayload = await fetchJson(
        `${API_BASE_URL}${API_ENDPOINTS.relatedProperties}?type=${encodeURIComponent(property.propertyType || "")}&limit=${PAGE_CONFIG.relatedLimit}`,
        {},
        { success: true, message: "Loaded related properties", data: { properties: getDemoRelatedProperties(property.propertyType || "") } }
      );
      const relatedProperties = Array.isArray(relatedPayload?.data?.properties) && relatedPayload.data.properties.length
        ? relatedPayload.data.properties
        : getDemoRelatedProperties(property.propertyType || "");
      relatedContainer.innerHTML = "";
      relatedProperties.forEach((relatedProperty) => {
        relatedContainer.appendChild(renderPropertyCard(relatedProperty));
      });
      attachFavouriteHandlers(relatedContainer);
    }

    hideLoading(loading);
  } catch (catchError) {
    hideLoading(loading);
    showError(catchError.message || "Unable to load this property.", "api_error");
  }
}

function initMortgagePage() {
  const form = document.getElementById("mortgage-form");
  const error = document.getElementById("mortgage-error");
  const summaryFields = {
    principal: document.getElementById("summary-principal"),
    monthly: document.getElementById("summary-monthly"),
    total: document.getElementById("summary-total"),
    interest: document.getElementById("summary-interest")
  };

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const validation = validateMortgageInputs(values);
    if (!validation.valid) {
      if (error) {
        error.hidden = false;
        error.textContent = validation.message;
      }
      return;
    }

    if (error) {
      error.hidden = true;
      error.textContent = "";
    }

    const result = calculateMortgage(values);
    renderMortgageResults(result, summaryFields);
  });

  form.addEventListener("reset", () => {
    Object.values(summaryFields).forEach((field) => {
      if (field) {
        field.textContent = "-";
      }
    });
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
  });
}

function validateMortgageInputs(values) {
  const loanAmount = Number(values.loanAmount || 0);
  const interestRate = Number(values.interestRate || 0);
  const tenure = Number(values.tenure || 0);

  if (!loanAmount || !interestRate || !tenure) {
    return { valid: false, message: "Please enter a loan amount, interest rate, and tenure." };
  }

  if (loanAmount < 100000) {
    return { valid: false, message: "Loan amount must be at least 100,000." };
  }

  if (interestRate <= 0 || interestRate > 100) {
    return { valid: false, message: "Interest rate must be between 0 and 100." };
  }

  if (tenure < 1 || tenure > 40) {
    return { valid: false, message: "Tenure must be between 1 and 40 years." };
  }

  return { valid: true };
}

function calculateMortgage(values) {
  const principal = Number(values.loanAmount || 0);
  const annualRate = Number(values.interestRate || 0) / 100;
  const months = Number(values.tenure || 0) * 12;
  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    return {
      principal,
      monthly: principal / months,
      total: principal,
      interest: 0
    };
  }

  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalRepayment = monthlyPayment * months;
  const totalInterest = totalRepayment - principal;

  return {
    principal,
    monthly: monthlyPayment,
    total: totalRepayment,
    interest: totalInterest
  };
}

function renderMortgageResults(result, summaryFields) {
  if (summaryFields.principal) {
    summaryFields.principal.textContent = formatCurrency(result.principal);
  }
  if (summaryFields.monthly) {
    summaryFields.monthly.textContent = formatCurrency(result.monthly);
  }
  if (summaryFields.total) {
    summaryFields.total.textContent = formatCurrency(result.total);
  }
  if (summaryFields.interest) {
    summaryFields.interest.textContent = formatCurrency(result.interest);
  }
}

async function initFavouritesPage() {
  const container = document.getElementById("favourites-results");
  const loading = document.getElementById("loading-state");
  const clearButton = document.getElementById("clear-favourites");

  if (!container) {
    return;
  }

  showLoading(loading);
  const favourites = getFavourites();
  state.favourites = favourites;

  if (!favourites.length) {
    container.innerHTML = '<p class="status-message">You have not saved any properties yet.</p>';
    hideLoading(loading);
    return;
  }

  container.innerHTML = "";
  favourites.forEach((property) => {
    container.appendChild(renderPropertyCard(property));
  });
  attachFavouriteHandlers(container);
  hideLoading(loading);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      state.favourites = [];
      saveFavourites();
      container.innerHTML = '<p class="status-message">Your favourites have been cleared.</p>';
    });
  }
}

async function initMovingPage() {
  const container = document.getElementById("moving-services");
  const loading = document.getElementById("loading-state");
  if (!container) {
    return;
  }

  showLoading(loading);
  try {
    const payload = await fetchJson(`${API_BASE_URL}${API_ENDPOINTS.movingServices}`);
    const services = getMovingServices(payload);
    container.innerHTML = "";
    if (!services.length) {
      container.innerHTML = '<p class="status-message">No moving services are available at the moment.</p>';
      hideLoading(loading);
      return;
    }

    services.forEach((service) => renderMovingServiceCard(service, container));
    hideLoading(loading);
  } catch (catchError) {
    container.innerHTML = "";
    getMovingServices().forEach((service) => renderMovingServiceCard(service, container));
    hideLoading(loading);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
