// ============================================
// CasaVid App JavaScript
// ============================================

// ============================================
// Configuration - Google Sheets Logging
// ============================================
const GOOGLE_SHEETS_URL = '';

// ============================================
// Tracking Initialization
// ============================================
function initTracking() {
  if (typeof CASAVID_CONFIG !== 'undefined' && CASAVID_CONFIG.CLARITY_PROJECT_ID) {
    initClarity(CASAVID_CONFIG.CLARITY_PROJECT_ID);
  }
  if (typeof CASAVID_CONFIG !== 'undefined' && CASAVID_CONFIG.META_PIXEL_ID) {
    initMetaPixel(CASAVID_CONFIG.META_PIXEL_ID);
  }
}

function initClarity(projectId) {
  if (!projectId) return;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", projectId);
}

function initMetaPixel(pixelId) {
  if (!pixelId) return;
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', pixelId);
  fbq('track', 'PageView');
}

function trackEvent(eventName, eventData = {}) {
  if (window.clarity) {
    window.clarity('event', eventName);
  }
  if (window.fbq) {
    fbq('trackCustom', eventName, eventData);
  }
}

// ============================================
// Typewriter Effect
// ============================================
const typewriterPhrases = [
  "Sell Properties Faster with Video",
  "No Videographer Needed",
  "AI Narration That Sells",
  "From Photos to Video in Minutes",
  "Professional Tours Made Easy"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typewriterElement = document.getElementById('typewriter');

function typeWriter() {
  if (!typewriterElement) return;
  
  const currentPhrase = typewriterPhrases[phraseIndex];
  
  if (isDeleting) {
    typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
  }
  
  let delay = isDeleting ? 50 : 100;
  
  if (!isDeleting && charIndex === currentPhrase.length) {
    delay = 3000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
    delay = 500;
  }
  
  setTimeout(typeWriter, delay);
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTracking();
  typeWriter();
  initMessagePage();
  initDashboard();
});

// ============================================
// Mobile Menu Toggle
// ============================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// ============================================
// FAQ Accordion
// ============================================
function toggleAccordion(element) {
  const content = element.nextElementSibling;
  const icon = element.querySelector('.accordion-icon');
  const allContents = document.querySelectorAll('.accordion-content');
  const allIcons = document.querySelectorAll('.accordion-icon');
  
  allContents.forEach(c => {
    if (c !== content) c.classList.remove('show');
  });
  allIcons.forEach(i => {
    if (i !== icon) i.textContent = '+';
  });
  
  content.classList.toggle('show');
  icon.textContent = content.classList.contains('show') ? '−' : '+';
}

// ============================================
// Dashboard Functions
// ============================================
let uploadedPhotos = [];

function initDashboard() {
  const dashboard = document.querySelector('.dashboard');
  if (!dashboard) return;
  
  updatePhotoCount();
}

function updatePhotoCount() {
  const countEl = document.getElementById('photoCount');
  if (countEl) {
    countEl.textContent = uploadedPhotos.length;
  }
}

// ============================================
// Photo Upload Handling
// ============================================
function handlePhotosSelect(input) {
  const files = Array.from(input.files);
  const maxPhotos = 10;
  const remaining = maxPhotos - uploadedPhotos.length;
  
  if (files.length > remaining) {
    alert(`You can only upload ${remaining} more photo(s). Maximum is ${maxPhotos}.`);
    files.splice(remaining);
  }
  
  files.forEach(file => {
    if (uploadedPhotos.length < maxPhotos) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPhotos.push({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
        renderPhotosGrid();
        updatePhotoCount();
      };
      reader.readAsDataURL(file);
    }
  });
  
  input.value = '';
}

function renderPhotosGrid() {
  const grid = document.getElementById('photosGrid');
  if (!grid) return;
  
  grid.innerHTML = uploadedPhotos.map((photo, index) => `
    <div class="photo-thumb">
      <img src="${photo.dataUrl}" alt="${photo.name}">
      <button class="photo-thumb-remove" onclick="removePhoto(${index})">×</button>
    </div>
  `).join('');
}

function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotosGrid();
  updatePhotoCount();
}

// ============================================
// Generate Video (Demo)
// ============================================
function handleGenerate() {
  if (uploadedPhotos.length === 0) {
    alert('Please upload at least 1 property photo');
    return;
  }
  
  const videoLength = document.querySelector('input[name="videoLength"]:checked')?.value || '30';
  const voiceStyle = document.querySelector('input[name="voiceStyle"]:checked')?.value || 'professional-male';
  const propertyType = document.getElementById('propertyType')?.value || 'house';
  const bedrooms = document.getElementById('bedrooms')?.value || '3';
  const bathrooms = document.getElementById('bathrooms')?.value || '2';
  
  trackEvent('generate_video_started', {
    photoCount: uploadedPhotos.length,
    videoLength,
    voiceStyle,
    propertyType
  });
  
  showProcessingModal();
}

function showProcessingModal() {
  const modal = document.getElementById('processingModal');
  
  if (modal) modal.classList.add('active');
  
  setTimeout(() => {
    window.location.href = 'pricing.html';
  }, 3000);
}

// ============================================
// Analytics Context
// ============================================
function getAnalyticsContext() {
  const locale = navigator.language || 'unknown';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const country = (locale.split('-')[1] || '').toUpperCase() || 'unknown';
  return {
    locale,
    timezone: tz,
    countryGuess: country,
    platform: navigator.platform || 'unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    url: window.location.href,
    referrer: document.referrer || 'direct'
  };
}

async function getIpContext() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();
    return {
      ip: data.ip || 'unknown',
      country: data.country_name || 'unknown',
      countryCode: data.country || 'unknown',
      city: data.city || 'unknown',
      region: data.region || 'unknown'
    };
  } catch (e) {
    return { ip: 'unknown', country: 'unknown', countryCode: 'unknown', city: 'unknown', region: 'unknown' };
  }
}

// ============================================
// Google Sheets Logging
// ============================================
async function logToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_URL) {
    console.log('📊 Google Sheets URL not configured. Data logged locally only:', data);
    return;
  }
  
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    console.log('📊 Logged to Google Sheets:', data);
  } catch (error) {
    console.error('Failed to log to Google Sheets:', error);
  }
}

// ============================================
// Pricing Page - Purchase Flow
// ============================================
let selectedPlanName = '';
let selectedPlanPrice = 0;

async function recordPurchaseInterest(planName, price) {
  if (!planName) return;
  selectedPlanName = planName;
  selectedPlanPrice = Number(price);

  const ipContext = await getIpContext();
  const interaction = {
    timestamp: new Date().toISOString(),
    app: 'casavid',
    plan: planName,
    price: Number(price),
    action: 'clicked_get_started',
    userAgent: navigator.userAgent,
    ...getAnalyticsContext(),
    ...ipContext
  };

  let interactions = JSON.parse(localStorage.getItem('casavid_interactions') || '[]');
  interactions.push(interaction);
  localStorage.setItem('casavid_interactions', JSON.stringify(interactions));
  
  await logToGoogleSheets(interaction);
  
  trackEvent('purchase_interest', { plan: planName, price: price });
  
  if (window.fbq) {
    fbq('track', 'Purchase', { value: price, currency: 'USD' });
  }
  
  console.log('📊 Purchase Interest Recorded:', interaction);
}

function initMessagePage() {
  const page = document.getElementById('messagePage');
  if (!page) return;
  
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan') || '';
  const price = params.get('price') || '';
  const label = plan ? `${plan} ($${price}/mo)` : 'your selected';
  const el = document.getElementById('selectedPlan');
  if (el) el.textContent = label;
  
  recordPurchaseInterest(plan, price);
}

async function handlePurchase(planName, price) {
  const params = new URLSearchParams({ plan: planName, price: String(price) });
  window.location.href = `message.html?${params.toString()}`;
}

async function handleEmailSubmit(event) {
  event.preventDefault();
  
  const email = document.getElementById('notifyEmail').value;
  
  if (email) {
    const ipContext = await getIpContext();

    const submission = {
      timestamp: new Date().toISOString(),
      app: 'casavid',
      email: email,
      plan: selectedPlanName,
      price: selectedPlanPrice,
      action: 'email_submitted',
      userAgent: navigator.userAgent,
      ...getAnalyticsContext(),
      ...ipContext
    };
    
    let submissions = JSON.parse(localStorage.getItem('casavid_emails') || '[]');
    submissions.push(submission);
    localStorage.setItem('casavid_emails', JSON.stringify(submissions));
    
    await logToGoogleSheets(submission);
    
    trackEvent('email_submitted', { email: email, plan: selectedPlanName });
    
    console.log('📧 Email Submission Recorded:', submission);
    
    alert('Thanks! We\'ll notify you when CasaVid is ready to launch! 🏠');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// ============================================
// Utility: View all recorded data (for debugging)
// ============================================
function viewData() {
  const interactions = JSON.parse(localStorage.getItem('casavid_interactions') || '[]');
  const emails = JSON.parse(localStorage.getItem('casavid_emails') || '[]');
  console.log('📊 All Interactions:', interactions);
  console.log('📧 All Email Submissions:', emails);
  return { interactions, emails };
}

window.viewData = viewData;

// ============================================
// Close modals on Escape key
// ============================================
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const processingModal = document.getElementById('processingModal');
    if (processingModal) processingModal.classList.remove('active');
  }
});
