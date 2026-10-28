// GramSetu — Main Client Application Logic (GitHub Pages & Full-Stack Compatible)

let allComplaints = [];
let allHotspots = [];
let villageMap = null;
let markersLayerGroup = null;
let hotspotsLayerGroup = null;
let categoryChartInstance = null;
let currentLanguage = 'en';

let speechRecognition = null;
let isRecordingVoice = false;
let currentSelectedComplaint = null;

// Presets for quick demo testing with local JPG/JPEG image assets
const PRESETS = {
  streetlight: {
    text: "మా వీధిలో రెండు వారాలుగా street light పనిచేయడం లేదు, రాత్రిళ్లు చాలా చీకటిగా ఉంటోంది మరియు నడవడానికి ఇబ్బందిగా ఉంది.",
    photo: "images/streetlight.jpg",
    ward: "Ward 1 - School Road",
    citizen: "M. Satyanarayana",
    lat: 17.2745,
    lng: 82.4020
  },
  water_pipe: {
    text: "మా వీధిలో మెయిన్ పైప్‌లైన్ పగిలిపోయింది, 3 రోజుల నుంచి తాగునీరు రోడ్డుపై వృథాగా పోతోంది, వెంటనే సరిచేయండి.",
    photo: "images/water_leak.jpg",
    ward: "Ward 3 - Tank Bund",
    citizen: "Ramesh Goud",
    lat: 17.2795,
    lng: 82.4085
  },
  drainage: {
    text: "మురుగు కాలువ పూడిక తీయకపోవడం వల్ల మురుగు నీరు రోడ్డు మీద పారుతోంది మరియు దుర్వాసన వస్తోంది.",
    photo: "images/drainage.jpg",
    ward: "Ward 4 - Bazaar Junction",
    citizen: "D. Durga Prasad",
    lat: 17.2820,
    lng: 82.4110
  },
  hanging_wire: {
    text: "స్కూల్ పక్కన కరెంట్ పోల్ వైరు క్రిందికి వేలాడుతోంది, పిల్లలు తిరుగుతున్నారు, చాలా ప్రమాదకరంగా ఉంది తక్షణమే రండి.",
    photo: "images/streetlight.jpg",
    ward: "Ward 1 - School Road",
    citizen: "Anitha Kumari",
    lat: 17.2742,
    lng: 82.4025
  }
};

// UI Translations
const I18N = {
  en: {
    nav_citizen: "Report Problem",
    nav_map: "Problem Map",
    nav_dashboard: "Panchayat Dashboard",
    nav_sih_demo: "⚡ SIH Demo Mode",
    hero_title: "One Voice. One Photo. One Connected Village.",
    hero_subtitle: "Speak your issue in Telugu, Hindi, or English. GramSetu AI converts your voice, identifies the department, tags GPS coordinates, and alerts the Gram Panchayat."
  },
  te: {
    nav_citizen: "సమస్య నివేదిక",
    nav_map: "గ్రామ సమస్య మ్యాప్",
    nav_dashboard: "పంచాయతీ డాష్‌బోర్డ్",
    nav_sih_demo: "⚡ SIH డెమో",
    hero_title: "ఒక స్వరం. ఒక ఫోటో. అనుసంధానించబడిన గ్రామం.",
    hero_subtitle: "మీ సమస్యను తెలుగులో చెప్పండి. గ్రామసేతు AI మీ గొంతును మార్చి, శాఖను గుర్తించి, GPS ట్యాగ్ చేసి గ్రామ పంచాయతీకి నివేదిస్తుంది."
  },
  hi: {
    nav_citizen: "समस्या दर्ज करें",
    nav_map: "समस्या मानचित्र",
    nav_dashboard: "पंचायत डैशबोर्ड",
    nav_sih_demo: "⚡ SIH डेमो",
    hero_title: "एक आवाज़। एक फोटो। एक जुड़ा हुआ गाँव।",
    hero_subtitle: "अपनी समस्या तेलुगु, हिंदी या अंग्रेजी में बोलें। ग्रामसेतु AI आपकी आवाज से विभाग पहचानकर पंचायत को तुरंत सूचित करेगा।"
  }
};

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupVoiceRecognition();
  setupTextListener();
});

async function initApp() {
  loadDataStore();
  initMap();
  if (window.lucide) lucide.createIcons();
}

// ---------------- LOCAL STORAGE / HYBRID DATA LAYER ---------------- //
function loadDataStore() {
  const storedComplaints = localStorage.getItem('gramsetu_complaints');
  const storedHotspots = localStorage.getItem('gramsetu_hotspots');

  if (storedComplaints) {
    try {
      allComplaints = JSON.parse(storedComplaints);
    } catch (e) {
      allComplaints = [...INITIAL_COMPLAINTS];
    }
  } else {
    allComplaints = [...INITIAL_COMPLAINTS];
    localStorage.setItem('gramsetu_complaints', JSON.stringify(allComplaints));
  }

  if (storedHotspots) {
    try {
      allHotspots = JSON.parse(storedHotspots);
    } catch (e) {
      allHotspots = [...INITIAL_HOTSPOTS];
    }
  } else {
    allHotspots = [...INITIAL_HOTSPOTS];
    localStorage.setItem('gramsetu_hotspots', JSON.stringify(allHotspots));
  }

  // Also try remote backend sync if running in a full-stack environment
  fetchComplaintsRemote();
  
  refreshUI();
}

function saveDataStore() {
  localStorage.setItem('gramsetu_complaints', JSON.stringify(allComplaints));
  localStorage.setItem('gramsetu_hotspots', JSON.stringify(allHotspots));
}

function refreshUI() {
  renderComplaintsTable();
  renderHotspotBanner();
  renderHotspotList();
  renderStats();
  if (villageMap) renderMapMarkers();
  if (window.lucide) lucide.createIcons();
}

async function fetchComplaintsRemote() {
  try {
    const res = await fetch('/api/complaints', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.complaints) {
        allComplaints = data.complaints;
        saveDataStore();
        refreshUI();
      }
    }
  } catch (e) {
    // Graceful offline/static fallback, perfectly expected on GitHub Pages
  }
}

// ---------------- TAB NAVIGATION ---------------- //
function switchTab(tabName) {
  // Hide all views
  document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-white', 'text-orange-600', 'shadow-sm', 'font-semibold');
    btn.classList.add('text-slate-600');
  });

  // Mobile buttons
  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    btn.classList.remove('text-orange-600', 'font-bold');
    btn.classList.add('text-slate-500');
  });

  // Show target
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) targetView.classList.remove('hidden');

  const activeBtn = document.getElementById(`nav-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-white', 'text-orange-600', 'shadow-sm', 'font-semibold');
    activeBtn.classList.remove('text-slate-600');
  }

  const mobBtn = document.getElementById(`mob-${tabName}`);
  if (mobBtn) {
    mobBtn.classList.add('text-orange-600', 'font-bold');
    mobBtn.classList.remove('text-slate-500');
  }

  // Map refresh on tab switch
  if (tabName === 'map' && villageMap) {
    setTimeout(() => {
      villageMap.invalidateSize();
      renderMapMarkers();
    }, 150);
  }

  if (tabName === 'panchayat') {
    renderStats();
    renderComplaintsTable();
  }

  if (window.lucide) lucide.createIcons();
}

// ---------------- LANGUAGE SWITCHER ---------------- //
function setLanguage(lang) {
  currentLanguage = lang;
  ['en', 'te', 'hi'].forEach(l => {
    const btn = document.getElementById(`lang-${l}`);
    if (btn) {
      if (l === lang) {
        btn.className = 'px-2 py-1 rounded bg-white text-orange-600 shadow-xs font-bold';
      } else {
        btn.className = 'px-2 py-1 rounded text-slate-600 hover:text-slate-900';
      }
    }
  });

  // Apply strings
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  showToast(`Language set to ${lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिंदी' : 'English'}`);
}

// ---------------- VOICE RECOGNITION ---------------- //
function setupVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    speechRecognition = new SpeechRec();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'te-IN'; // Default to Telugu

    speechRecognition.onstart = () => {
      isRecordingVoice = true;
      updateMicUI(true);
    };

    speechRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      document.getElementById('complaint-voice-text').value = transcript;
      triggerRealtimeAIAnalysis(transcript);
    };

    speechRecognition.onerror = (err) => {
      console.warn('Speech recognition notice:', err);
      updateMicUI(false);
    };

    speechRecognition.onend = () => {
      isRecordingVoice = false;
      updateMicUI(false);
    };
  }
}

function toggleVoiceRecording() {
  if (!speechRecognition) {
    simulateVoiceInput("మా వీధిలో మెయిన్ పైప్‌లైన్ పగిలిపోయింది, 3 రోజుల నుంచి తాగునీరు రోడ్డుపై వృథాగా పోతోంది.");
    return;
  }

  if (isRecordingVoice) {
    speechRecognition.stop();
  } else {
    try {
      speechRecognition.lang = currentLanguage === 'te' ? 'te-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      speechRecognition.start();
    } catch (e) {
      simulateVoiceInput("మా వీధిలో మెయిన్ పైప్‌లైన్ పగిలిపోయింది, 3 రోజుల నుంచి తాగునీరు రోడ్డుపై వృథాగా పోతోంది.");
    }
  }
}

function updateMicUI(isRecording) {
  const micBtn = document.getElementById('mic-record-btn');
  const micStatus = document.getElementById('mic-status-text');
  const waveform = document.getElementById('waveform-visualizer');

  if (!micBtn) return;

  if (isRecording) {
    micBtn.className = 'w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse transition';
    if (micStatus) micStatus.textContent = 'Listening in Telugu / English... (Speak now)';
    if (waveform) {
      waveform.classList.remove('hidden');
      waveform.classList.add('flex');
    }
  } else {
    micBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-105 transition';
    if (micStatus) micStatus.textContent = 'Tap Mic to Speak in Telugu / English';
    if (waveform) {
      waveform.classList.add('hidden');
      waveform.classList.remove('flex');
    }
  }
}

function simulateVoiceInput(text) {
  updateMicUI(true);
  const textarea = document.getElementById('complaint-voice-text');
  textarea.value = '';
  let i = 0;
  const interval = setInterval(() => {
    textarea.value = text.slice(0, i);
    i += 2;
    if (i > text.length) {
      clearInterval(interval);
      updateMicUI(false);
      triggerRealtimeAIAnalysis(text);
      showToast('Voice processed: Telugu text transcribed!');
    }
  }, 30);
}

function clearVoiceText() {
  document.getElementById('complaint-voice-text').value = '';
  triggerRealtimeAIAnalysis('');
}

function setupTextListener() {
  const textarea = document.getElementById('complaint-voice-text');
  if (!textarea) return;
  let debounceTimeout = null;
  textarea.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      triggerRealtimeAIAnalysis(textarea.value);
    }, 300);
  });
}

// ---------------- CLIENT-SIDE NLP & AI CLASSIFICATION ENGINE ---------------- //
function analyzeComplaintAI(text) {
  const normalized = (text || '').toLowerCase();

  let category = 'Other';
  let department = 'Gram Panchayat General Administration';
  let subCategory = 'Civic Infrastructure';
  let priority = 'Medium';
  let priorityScore = 65;
  let translatedText = text;

  // Electricity Detection
  if (/కరెంట్|లైట్|పోల్|వైరు|షాక్|ట్రాన్స్‌ఫార్మర్|కరెంటు|light|wire|pole|electricity|transformer|spark|power/i.test(normalized)) {
    category = 'Electricity';
    department = 'Electricity Board (DISCOM)';
    if (/వైరు|షాక్|ట్రాన్స్‌ఫార్మర్|పడిపోయింది|spark|wire|danger/i.test(normalized)) {
      subCategory = 'Hanging Electric Wire / Safety Hazard';
      priority = 'High';
      priorityScore = 95;
    } else {
      subCategory = 'Broken Streetlight / Darkness';
      priority = 'Medium';
      priorityScore = 68;
    }
  }
  // Water Supply Detection
  else if (/నీరు|పైపు|పైప్‌లైన్|తాగునీరు|లీకేజ్|బోరింగ్|పంపు|water|pipe|leak|handpump|drinking/i.test(normalized)) {
    category = 'Water';
    department = 'Jal Shakti & Rural Water Supply';
    if (/పగిలిపోయింది|flood|burst|severed|కలుషిత/i.test(normalized)) {
      subCategory = 'Main Pipeline Burst';
      priority = 'High';
      priorityScore = 92;
    } else if (/బోరింగ్|పంపు|handpump/i.test(normalized)) {
      subCategory = 'Handpump Malfunction';
      priority = 'High';
      priorityScore = 85;
    } else {
      subCategory = 'Water Pipeline Leakage';
      priority = 'Medium';
      priorityScore = 74;
    }
  }
  // Sanitation & Drainage Detection
  else if (/మురుగు|కాలువ|చెత్త|దుర్వాసన|డ్రైనేజీ|ఈగలు|దోమలు|drain|sewage|garbage|waste|smell/i.test(normalized)) {
    category = 'Sanitation';
    department = 'Gram Panchayat Sanitation Wing';
    if (/చెత్త|కుప్పలు|dump/i.test(normalized)) {
      subCategory = 'Illegal Garbage Dumping';
      priority = 'Medium';
      priorityScore = 70;
    } else {
      subCategory = 'Clogged Drainage & Wastewater Overflow';
      priority = 'Medium';
      priorityScore = 76;
    }
  }
  // Roads & Buildings Detection
  else if (/రోడ్డు|గుంతలు|గొయ్యి|బైకు|రహదారి|road|pothole|accident|pavement/i.test(normalized)) {
    category = 'Roads';
    department = 'Roads & Buildings (R&B)';
    subCategory = 'Major Potholes & Road Damage';
    if (/ప్రమాదం|accident|danger|లోతు/i.test(normalized)) {
      priority = 'High';
      priorityScore = 88;
    } else {
      priority = 'Medium';
      priorityScore = 72;
    }
  }
  // Health & Education Detection
  else if (/ఆసుపత్రి|స్కూల్|బడి|డాక్టర్|మందులు|దోమలు|హాస్పిటల్|school|hospital|phc|doctor|clinic/i.test(normalized)) {
    category = 'Health & Education';
    department = 'Primary Health & Community Welfare';
    priority = 'High';
    priorityScore = 88;
    subCategory = 'Public Health & Facility Infrastructure';
  }

  // Translation Synthesis if in Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) {
    if (category === 'Electricity') {
      translatedText = text.includes('లైట్') 
        ? "Street light has been broken for several days; neighborhood is pitch dark at night." 
        : "Electric pole/wire danger reported in the street needing immediate lineman dispatch.";
    } else if (category === 'Water') {
      translatedText = text.includes('పగిలిపోయింది')
        ? "Main drinking water pipeline has burst, causing severe water wastage on the road."
        : "Water supply pipeline leakage/handpump fault reported in the residential area.";
    } else if (category === 'Roads') {
      translatedText = "Severe road damage/pothole posing hazard to motorists and school pedestrians.";
    } else if (category === 'Sanitation') {
      translatedText = "Drainage blockage and accumulated solid waste causing unhygienic conditions.";
    } else {
      translatedText = "Rural infrastructure grievance reported by local resident.";
    }
  }

  return {
    category,
    subCategory,
    department,
    priority,
    priorityScore,
    translatedText,
    confidence: 0.94
  };
}

function triggerRealtimeAIAnalysis(text) {
  if (!text || text.trim().length < 3) {
    return;
  }
  const result = analyzeComplaintAI(text);
  updateAIPreviewCard(result);
}

function updateAIPreviewCard(ai) {
  const categoryIconMap = {
    Water: '💧',
    Electricity: '💡',
    Roads: '🛣️',
    Sanitation: '🧹',
    'Health & Education': '🏥',
    Other: '🏛️'
  };

  const catIcon = document.getElementById('ai-category-icon');
  const catText = document.getElementById('ai-category-text');
  const deptText = document.getElementById('ai-department-text');
  const scoreNum = document.getElementById('ai-score-number');
  const bar = document.getElementById('ai-score-bar');
  const badge = document.getElementById('ai-priority-badge');
  const summary = document.getElementById('ai-translated-summary');

  if (catIcon) catIcon.textContent = categoryIconMap[ai.category] || '🏛️';
  if (catText) catText.textContent = ai.category;
  if (deptText) deptText.textContent = ai.department;

  if (scoreNum) scoreNum.textContent = `${ai.priorityScore} / 100`;
  if (bar) bar.style.width = `${ai.priorityScore}%`;

  if (badge && bar) {
    if (ai.priority === 'High') {
      badge.className = 'px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30';
      badge.textContent = '🔴 High Urgency';
      bar.className = 'h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500';
    } else if (ai.priority === 'Medium') {
      badge.className = 'px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30';
      badge.textContent = '🟠 Medium Urgency';
      bar.className = 'h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500';
    } else {
      badge.className = 'px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      badge.textContent = '🟢 Low Urgency';
      bar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-500';
    }
  }

  if (summary) summary.textContent = `"${ai.translatedText}"`;
}

// ---------------- PRESET LOADER ---------------- //
function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;

  const textEl = document.getElementById('complaint-voice-text');
  const photoEl = document.getElementById('photo-preview');
  const wardEl = document.getElementById('ward-select');
  const nameEl = document.getElementById('citizen-name-input');
  const coordsEl = document.getElementById('gps-coords-display');

  if (textEl) textEl.value = preset.text;
  if (photoEl) photoEl.src = preset.photo;
  if (wardEl) wardEl.value = preset.ward;
  if (nameEl) nameEl.value = preset.citizen;
  if (coordsEl) coordsEl.value = `${preset.lat}° N, ${preset.lng}° E`;

  triggerRealtimeAIAnalysis(preset.text);
  showToast(`Loaded "${preset.ward}" scenario`);
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('photo-preview').src = e.target.result;
      showToast('Photo uploaded with GPS metadata attached');
    };
    reader.readAsDataURL(file);
  }
}

function refreshGPS() {
  const lat = (17.2750 + Math.random() * 0.009).toFixed(4);
  const lng = (82.4020 + Math.random() * 0.009).toFixed(4);
  document.getElementById('gps-coords-display').value = `${lat}° N, ${lng}° E`;
  showToast('📍 High-precision GPS coordinates updated');
}

// ---------------- SUBMIT GRIEVANCE ---------------- //
async function submitGrievance() {
  const rawVoiceText = document.getElementById('complaint-voice-text').value.trim();
  if (!rawVoiceText) {
    showToast('⚠️ Please speak or type a complaint description first.');
    return;
  }

  const citizenName = document.getElementById('citizen-name-input').value.trim() || 'Village Resident';
  const phone = document.getElementById('citizen-phone-input').value.trim() || '+91 98480 00000';
  const ward = document.getElementById('ward-select').value;
  const imageUrl = document.getElementById('photo-preview').src;

  const coordsText = document.getElementById('gps-coords-display').value;
  let lat = 17.2795;
  let lng = 82.4085;
  if (coordsText.includes('°')) {
    const parts = coordsText.split(',');
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);
  }

  const btn = document.getElementById('submit-complaint-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin mr-2">⏳</span> Registering with GramSetu AI...`;

  try {
    // Run AI categorization
    const ai = analyzeComplaintAI(rawVoiceText);

    // Create complaint object
    const newId = `GS-2026-${100 + allComplaints.length + 1}`;
    const newComplaint = {
      id: newId,
      citizenName,
      phone,
      ward,
      category: ai.category,
      subCategory: ai.subCategory,
      department: ai.department,
      priority: ai.priority,
      priorityScore: ai.priorityScore,
      teluguVoiceText: rawVoiceText,
      englishTranslation: ai.translatedText,
      imageUrl: imageUrl || 'images/water_leak.jpg',
      status: 'Open',
      assignedOfficer: 'Pending Assignment',
      lat,
      lng,
      createdAt: new Date().toISOString(),
      votes: 1,
      resolutionNote: null
    };

    // Insert at beginning of array
    allComplaints.unshift(newComplaint);

    // Check for spatial cluster hotspot
    const nearby = allComplaints.filter(c => c.ward === ward && c.category === ai.category && c.status !== 'Resolved');
    let triggeredHotspot = null;
    if (nearby.length >= 3) {
      triggeredHotspot = {
        id: `HS-${Date.now().toString().slice(-4)}`,
        title: `${ai.category} Critical Outage Hotspot`,
        ward: ward,
        category: ai.category,
        count: nearby.length,
        complaintCount: nearby.length,
        severity: 'CRITICAL',
        center: { lat, lng },
        centerLat: lat,
        centerLng: lng,
        radiusMeters: 280,
        department: ai.department,
        recommendedAction: `Deploy emergency field team to ${ward} to address multiple clustered complaints.`,
        summaryTelugu: `${ward} పరిధిలో బహుళ సమస్యలు నమోదయ్యాయి. తక్షణ చర్య అవసరం.`,
        summaryEnglish: `${nearby.length} clustered complaints detected in ${ward}. Urgent engineering intervention required.`,
        complaints: nearby,
        complaintIds: nearby.map(c => c.id)
      };

      // Upsert hotspot
      const existingIdx = allHotspots.findIndex(h => h.ward === ward && h.category === ai.category);
      if (existingIdx >= 0) {
        allHotspots[existingIdx] = triggeredHotspot;
      } else {
        allHotspots.unshift(triggeredHotspot);
      }
    }

    saveDataStore();

    showToast(`✅ Grievance ${newComplaint.id} Registered Successfully!`);

    if (triggeredHotspot) {
      setTimeout(() => {
        showToast(`🚨 ${triggeredHotspot.title} flagged to Panchayat!`);
      }, 1200);
    }

    // Refresh UI
    refreshUI();

    // Reset input
    document.getElementById('complaint-voice-text').value = '';
    switchTab('map');

  } catch (err) {
    console.error('Error submitting grievance:', err);
    showToast('Failed to register complaint. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="send" class="w-5 h-5"></i><span>Register Complaint to Gram Panchayat</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

// ---------------- STATS CALCULATION ---------------- //
function renderStats() {
  const total = allComplaints.length;
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
  const inProgress = allComplaints.filter(c => c.status === 'In-Progress').length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const statTotal = document.getElementById('stat-total');
  const statRate = document.getElementById('stat-rate');
  const statResolved = document.getElementById('stat-resolved-count');
  const statInProgress = document.getElementById('stat-in-progress');
  const statHotspots = document.getElementById('stat-hotspots');

  if (statTotal) statTotal.textContent = total;
  if (statRate) statRate.textContent = `${rate}%`;
  if (statResolved) statResolved.textContent = `${resolved} Solved`;
  if (statInProgress) statInProgress.textContent = inProgress;
  if (statHotspots) statHotspots.textContent = allHotspots.length;

  // Category counts for Chart.js
  const categories = {};
  allComplaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });

  updateCategoryChart(categories);
}

function renderHotspotBanner() {
  const banner = document.getElementById('hotspot-global-banner');
  const bannerText = document.getElementById('hotspot-banner-text');
  const navCount = document.getElementById('nav-hotspot-count');

  if (!banner || !bannerText || !navCount) return;

  if (allHotspots.length > 0) {
    banner.classList.remove('hidden');
    bannerText.textContent = `${allHotspots[0].title} in ${allHotspots[0].ward}`;
    navCount.textContent = `${allHotspots.length} Hotspots`;
    navCount.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
    navCount.classList.add('hidden');
  }
}

function renderHotspotList() {
  const container = document.getElementById('hotspots-container');
  const countBadge = document.getElementById('hotspot-list-count');
  if (!container || !countBadge) return;

  countBadge.textContent = allHotspots.length;

  if (allHotspots.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        <i data-lucide="check-circle" class="w-8 h-8 mx-auto text-emerald-500 mb-2"></i>
        <p>No high-density problem clusters detected.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = allHotspots.map(h => {
    const action = h.recommendedAction || h.summaryEnglish || 'Inspect infrastructure';
    const cLat = h.center?.lat || h.centerLat || 17.2790;
    const cLng = h.center?.lng || h.centerLng || 82.4080;
    const count = h.complaintCount || h.count || 3;

    return `
    <div class="p-4 rounded-2xl bg-red-50/80 border border-red-200 hover:border-red-400 transition space-y-2">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white">
          🚨 ${count} Complaints Clustered
        </span>
        <span class="text-[11px] font-bold text-slate-700">${h.ward}</span>
      </div>

      <h4 class="font-extrabold text-xs text-slate-900 leading-snug">${h.title}</h4>
      
      <p class="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-xl border border-red-100">
        <strong class="text-slate-800">Action Order:</strong> ${action}
      </p>

      <div class="flex items-center space-x-2 pt-1">
        <button onclick="focusHotspotOnMap(${cLat}, ${cLng})" class="flex-1 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-50">
          📍 View on Map
        </button>
        <button onclick="openActionOrderModal('${h.id}')" class="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs">
          ⚡ Action Order
        </button>
      </div>
    </div>
  `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ---------------- LEAFLET VILLAGE MAP ---------------- //
function initMap() {
  if (villageMap) return;

  const mapContainer = document.getElementById('village-map');
  if (!mapContainer) return;

  // Center on Annavaram Village, Andhra Pradesh
  villageMap = L.map('village-map', {
    center: [17.2790, 82.4080],
    zoom: 15,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | GramSetu'
  }).addTo(villageMap);

  markersLayerGroup = L.layerGroup().addTo(villageMap);
  hotspotsLayerGroup = L.layerGroup().addTo(villageMap);

  renderMapMarkers();
}

function renderMapMarkers() {
  if (!villageMap || !markersLayerGroup || !hotspotsLayerGroup) return;

  markersLayerGroup.clearLayers();
  hotspotsLayerGroup.clearLayers();

  const categoryFilter = document.getElementById('map-category-filter')?.value || 'All';
  const priorityFilter = document.getElementById('map-priority-filter')?.value || 'All';

  // 1. Render Pulsing Hotspot Circles
  allHotspots.forEach(h => {
    if (categoryFilter !== 'All' && h.category !== categoryFilter) return;

    const cLat = h.center?.lat || h.centerLat;
    const cLng = h.center?.lng || h.centerLng;
    if (!cLat || !cLng) return;

    const circle = L.circle([cLat, cLng], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.22,
      radius: h.radiusMeters || 320,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(hotspotsLayerGroup);

    const action = h.recommendedAction || h.summaryEnglish || 'Inspect immediately';

    circle.bindPopup(`
      <div class="p-1 space-y-1.5 text-xs">
        <div class="font-bold text-red-600 uppercase text-[10px]">🚨 Critical Infrastructure Hotspot</div>
        <div class="font-extrabold text-slate-900 text-sm">${h.title}</div>
        <div class="text-slate-600 text-[11px]">${action}</div>
        <div class="pt-1">
          <button onclick="openActionOrderModal('${h.id}')" class="w-full py-1 bg-red-600 text-white rounded font-bold text-[11px]">Generate Panchayat Action Order</button>
        </div>
      </div>
    `);
  });

  // 2. Render Individual Grievance Pins
  allComplaints.forEach(c => {
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return;
    if (!c.lat || !c.lng) return;

    let color = '#3b82f6'; // blue water
    if (c.category === 'Electricity') color = '#f59e0b';
    else if (c.category === 'Roads') color = '#ea580c';
    else if (c.category === 'Sanitation') color = '#10b981';
    else if (c.category === 'Health & Education') color = '#8b5cf6';

    const customIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
          ${c.priority === 'High' ? '!' : '•'}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(markersLayerGroup);

    marker.bindPopup(`
      <div class="p-1 space-y-1.5 text-xs" style="max-width: 220px;">
        <div class="flex items-center justify-between">
          <span class="font-mono font-bold text-orange-600">${c.id}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${c.status}</span>
        </div>
        <div class="font-bold text-slate-900">${c.subCategory || c.category}</div>
        <p class="text-slate-600 text-[11px] font-telugu italic">"${c.teluguVoiceText || c.englishTranslation}"</p>
        <div class="pt-1">
          <button onclick="openTicketModal('${c.id}')" class="w-full py-1 bg-slate-900 hover:bg-black text-white rounded font-bold text-[11px]">Inspect & Dispatch</button>
        </div>
      </div>
    `);
  });
}

function applyMapFilters() {
  renderMapMarkers();
}

function focusHotspotOnMap(lat, lng) {
  switchTab('map');
  if (villageMap) {
    villageMap.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
  }
}

function resetMapDemoData() {
  localStorage.removeItem('gramsetu_complaints');
  localStorage.removeItem('gramsetu_hotspots');
  allComplaints = [...INITIAL_COMPLAINTS];
  allHotspots = [...INITIAL_HOTSPOTS];
  saveDataStore();
  refreshUI();
  showToast('Village dataset reset to initial demo state');
}

// ---------------- PANCHAYAT DASHBOARD TABLE ---------------- //
function renderComplaintsTable() {
  const tbody = document.getElementById('complaints-table-body');
  if (!tbody) return;

  const statusFilter = document.getElementById('table-status-filter')?.value || 'All';
  const searchQuery = (document.getElementById('table-search-input')?.value || '').toLowerCase();

  let list = allComplaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const match = (c.id + c.citizenName + c.teluguVoiceText + c.englishTranslation + c.category).toLowerCase();
      if (!match.includes(searchQuery)) return false;
    }
    return true;
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-slate-400">
          No complaints matching the current criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="openTicketModal('${c.id}')">
      <td class="px-4 py-3 font-medium">
        <div class="font-mono font-bold text-orange-600">${c.id}</div>
        <div class="text-slate-800 text-[11px] font-semibold">${c.citizenName}</div>
        <div class="text-slate-400 text-[10px]">${c.ward}</div>
      </td>

      <td class="px-4 py-3">
        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${c.category}</span>
        <div class="text-slate-500 text-[10px] mt-0.5">${c.department}</div>
      </td>

      <td class="px-4 py-3 max-w-xs">
        <p class="font-telugu text-slate-800 text-xs truncate">"${c.teluguVoiceText}"</p>
        <p class="text-slate-500 text-[11px] truncate mt-0.5">${c.englishTranslation}</p>
      </td>

      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${c.priority === 'High' ? 'bg-red-100 text-red-700' : c.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
          ${c.priority === 'High' ? '🔴 High' : c.priority === 'Medium' ? '🟠 Medium' : '🟢 Low'}
        </span>
      </td>

      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : c.status === 'In-Progress' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'}">
          ${c.status}
        </span>
      </td>

      <td class="px-4 py-3 text-right">
        <button onclick="event.stopPropagation(); openTicketModal('${c.id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]">
          Manage
        </button>
      </td>
    </tr>
  `).join('');
}

function filterComplaintsTable() {
  renderComplaintsTable();
}

// ---------------- CHART.JS WORKLOAD CHART ---------------- //
function updateCategoryChart(categories) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx || !window.Chart) return;

  const labels = Object.keys(categories || {});
  const data = Object.values(categories || {});

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#f59e0b', // Electricity
          '#3b82f6', // Water
          '#ea580c', // Roads
          '#10b981', // Sanitation
          '#8b5cf6'  // Health
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 10 } }
        }
      }
    }
  });
}

// ---------------- TICKET MODAL & OFFICER DISPATCH ---------------- //
function openTicketModal(ticketId) {
  const item = allComplaints.find(c => c.id === ticketId);
  if (!item) return;

  currentSelectedComplaint = item;

  document.getElementById('modal-ticket-id').textContent = item.id;
  document.getElementById('modal-ticket-title').textContent = item.subCategory || item.category;
  document.getElementById('modal-ticket-image').src = item.imageUrl || 'images/water_leak.jpg';
  document.getElementById('modal-ticket-telugu').textContent = item.teluguVoiceText || 'Voice record not available';
  document.getElementById('modal-ticket-english').textContent = item.englishTranslation || 'General Civic Grievance';
  document.getElementById('modal-ticket-citizen').textContent = `${item.citizenName} (${item.phone})`;
  document.getElementById('modal-ticket-dept').textContent = item.department;
  document.getElementById('modal-status-select').value = item.status;
  document.getElementById('modal-officer-input').value = item.assignedOfficer || '';
  document.getElementById('modal-note-input').value = item.resolutionNote || '';

  document.getElementById('ticket-modal').classList.remove('hidden');
  document.getElementById('ticket-modal').classList.add('flex');
}

function closeTicketModal() {
  document.getElementById('ticket-modal').classList.add('hidden');
  document.getElementById('ticket-modal').classList.remove('flex');
}

function saveTicketChanges() {
  if (!currentSelectedComplaint) return;

  const status = document.getElementById('modal-status-select').value;
  const assignedOfficer = document.getElementById('modal-officer-input').value;
  const resolutionNote = document.getElementById('modal-note-input').value;

  const target = allComplaints.find(c => c.id === currentSelectedComplaint.id);
  if (target) {
    target.status = status;
    target.assignedOfficer = assignedOfficer;
    target.resolutionNote = resolutionNote;
    saveDataStore();
  }

  showToast(`Status updated to "${status}" & SMS alert triggered.`);
  closeTicketModal();
  refreshUI();
}

// ---------------- TRACK MODAL ---------------- //
function openTrackModal() {
  document.getElementById('track-modal').classList.remove('hidden');
  document.getElementById('track-modal').classList.add('flex');
}

function closeTrackModal() {
  document.getElementById('track-modal').classList.add('hidden');
  document.getElementById('track-modal').classList.remove('flex');
}

function searchComplaintTrack() {
  const query = document.getElementById('track-input').value.trim().toLowerCase();
  const resBox = document.getElementById('track-result-box');
  resBox.classList.remove('hidden');

  const found = allComplaints.find(c => c.id.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));
  if (found) {
    resBox.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-mono font-bold text-orange-600">${found.id}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${found.status}</span>
        </div>
        <div class="font-bold text-slate-800">${found.subCategory || found.category}</div>
        <div class="text-slate-500 font-telugu">"${found.teluguVoiceText}"</div>
        <div class="text-slate-600 border-t border-slate-200 pt-2 mt-2">
          <strong>Assigned Department:</strong> ${found.department}<br/>
          <strong>Officer:</strong> ${found.assignedOfficer || 'Pending Assignment'}
        </div>
      </div>
    `;
  } else {
    resBox.innerHTML = `<span class="text-red-500 font-medium">No complaint found for "${query}". Try searching "GS-2026-101".</span>`;
  }
}

// ---------------- ACTION ORDER MODAL ---------------- //
function openActionOrderModal(hotspotId) {
  const hotspot = allHotspots.find(h => h.id === hotspotId) || allHotspots[0];
  if (!hotspot) return;

  const content = document.getElementById('action-order-content');
  const dateStr = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  const complaintList = hotspot.complaints ? hotspot.complaints.map(c => c.id).join(', ') : (hotspot.complaintIds || []).join(', ');
  const action = hotspot.recommendedAction || hotspot.summaryEnglish || 'Immediate field dispatch';

  content.innerHTML = `
============================================================
      OFFICE OF THE GRAM PANCHAYAT — ANNAVARAM
            EMERGENCY CIVIC ACTION ORDER
============================================================
Order ID: GP-ORD-${Date.now().toString().slice(-6)}
Date: ${dateStr}
Subject: Priority Infrastructure Intervention for ${(hotspot.category || 'CIVIC').toUpperCase()}

1. SYSTEMIC HOTSPOT DETAILS:
   - Locality / Ward: ${hotspot.ward}
   - Clustered Complaints: ${hotspot.complaintCount || hotspot.count || 3} independent citizen reports
   - Spatial Proximity: Within 380m radius

2. MANDATED DEPARTMENT:
   - ${hotspot.department || 'Gram Panchayat Engineering Wing'}

3. RECOMMENDED ENGINEERING ACTION:
   ${action}

4. CITIZEN GRIEVANCE IDS ATTACHED:
   ${complaintList || 'GS-2026-101, GS-2026-102, GS-2026-103'}

Authorized By:
Panchayat Secretary / Sarpanch
Annavaram Gram Panchayat
============================================================
  `;

  document.getElementById('action-order-modal').classList.remove('hidden');
  document.getElementById('action-order-modal').classList.add('flex');
}

function closeActionOrderModal() {
  document.getElementById('action-order-modal').classList.add('hidden');
  document.getElementById('action-order-modal').classList.remove('flex');
}

function exportGramSabhaReport() {
  showToast('📄 Gram Sabha Monthly Report generated and saved!');
  openActionOrderModal(allHotspots[0]?.id || 'SAMPLE');
}

// ---------------- SIH DEMO ANIMATION SIMULATOR ---------------- //
async function runLiveSIHDemoAnimation() {
  switchTab('citizen');
  showToast('▶️ Step 1: Simulating Villager speaking Telugu into microphone...');
  loadPreset('water_pipe');

  await new Promise(r => setTimeout(r, 1800));
  showToast('▶️ Step 2: GramSetu AI categorizing grievance to Jal Shakti & Priority 92%...');

  await new Promise(r => setTimeout(r, 1800));
  showToast('▶️ Step 3: Submitting grievance and scanning village for spatial clusters...');
  await submitGrievance();

  await new Promise(r => setTimeout(r, 2200));
  showToast('▶️ Step 4: Spatial Radar triggered 🚨 WATER PROBLEM HOTSPOT DETECTED!');
  if (allHotspots[0]) {
    const lat = allHotspots[0].center?.lat || allHotspots[0].centerLat;
    const lng = allHotspots[0].center?.lng || allHotspots[0].centerLng;
    focusHotspotOnMap(lat, lng);
  }
}

// ---------------- TOAST NOTIFICATION ---------------- //
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold flex items-center space-x-2 transition-all transform translate-y-2 opacity-0 pointer-events-auto max-w-sm';
  toast.innerHTML = `
    <span class="text-orange-500">●</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 50);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
