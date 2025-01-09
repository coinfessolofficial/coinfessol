import { createClient } from '@supabase/supabase-js'

const TERMS_ACCEPTED_KEY = 'coinfessol_terms_accepted';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize global variables
let votedConfessions = new Set();
let userAchievements = new Set();
let lastConfessionDate = null;
let streakCount = 0;
let confessionCount = 0;

const textarea = document.getElementById('confession');
const charCount = document.getElementById('charCount');
const confessionCountElement = document.getElementById('confessionCount');
const achievementElement = document.getElementById('achievement');

function checkTermsAcceptance() {
  const termsAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
  const termsModal = document.getElementById('termsModal');
  const mainContent = document.getElementById('mainContent');
  
  if (termsAccepted === 'true') {
    termsModal.classList.add('hidden');
    mainContent.classList.remove('hidden');
  } else {
    termsModal.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
}

function acceptTerms() {
  localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
  checkTermsAcceptance();
}

function rejectTerms() {
  window.location.href = 'https://www.google.com';
}

const wisdomPhrases = [
  "In silence lies the seed of truth.",
  "Every secret shared lightens the heart's burden.",
  "The whispers of many become the wisdom of all.",
  "Through confession, we find connection.",
  "In sharing our shadows, we find our light.",
  "The digital scroll remembers what the mind seeks to forget.",
  "Truth flows like data through the streams of time.",
  "In the mirror of others' confessions, we see ourselves.",
  "Every keystroke echoes in the halls of digital memory.",
  "The weight of a secret is measured in bytes."
];

const prophecyFragments = [
  "When the digital stars align...",
  "In the depths of the binary sea...",
  "As the code weaves patterns unseen...",
  "Through the veils of data streams...",
  "When wisdom and confession merge..."
];

const hiddenLore = [
  "The first Keeper spoke in pure binary...",
  "Ancient servers still echo with forgotten confessions...",
  "Some say the Crimson Code writes itself...",
  "In the deepest archives, secrets transform into stars...",
  "The original source remains a mystery..."
];

function showAchievement(message) {
  if (userAchievements.has(message)) return;

  userAchievements.add(message);
  achievementElement.textContent = message;
  achievementElement.classList.add('show');
  
  setTimeout(() => {
    achievementElement.classList.remove('show');
  }, 3000);
}

function revealWisdom() {
  const container = document.querySelector('.wisdom-container');
  const randomIndex = Math.floor(Math.random() * wisdomPhrases.length);
  container.textContent = wisdomPhrases[randomIndex];
  
  setTimeout(() => {
    container.textContent = '[ Click to receive ancient wisdom ]';
  }, 3000);
}

function revealProphecy(element) {
  const randomIndex = Math.floor(Math.random() * prophecyFragments.length);
  element.textContent = prophecyFragments[randomIndex];
  element.classList.add('revealed');
  
  setTimeout(() => {
    element.textContent = '[ Decode prophecy fragment ]';
    element.classList.remove('revealed');
  }, 3000);
}

function triggerMysticEffect(element) {
  element.classList.add('resonating');
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    if (Math.random() > 0.7) {
      star.classList.add('active');
      setTimeout(() => star.classList.remove('active'), 2000);
    }
  });
  
  setTimeout(() => {
    element.classList.remove('resonating');
  }, 2000);
}

function revealHiddenLore(element) {
  const randomIndex = Math.floor(Math.random() * hiddenLore.length);
  element.textContent = hiddenLore[randomIndex];
  element.classList.add('revealed');
  
  setTimeout(() => {
    element.textContent = '[ Click to uncover hidden knowledge ]';
    element.classList.remove('revealed');
  }, 3000);
}

function createConstellation() {
  const grid = document.getElementById('constellationGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    if (Math.random() > 0.8) {
      star.classList.add('active');
    }
    grid.appendChild(star);
  }
}

function toggleChapter(chapter) {
  const wasActive = chapter.classList.contains('active');
  
  // Close all chapters
  document.querySelectorAll('.lore-chapter').forEach(ch => {
    ch.classList.remove('active');
  });
  
  // If the clicked chapter wasn't active, open it
  if (!wasActive) {
    chapter.classList.add('active');
    showAchievement('Seeker of Knowledge');
  }
}

function updateStreak() {
  const today = new Date().toDateString();
  
  if (lastConfessionDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastConfessionDate === yesterday.toDateString()) {
      streakCount++;
      if (streakCount === 3) showAchievement('Three Day Streak');
      if (streakCount === 7) showAchievement('Week of Whispers');
      if (streakCount === 30) showAchievement('Month of Mysteries');
    } else if (lastConfessionDate !== today) {
      streakCount = 1;
    }
  } else {
    streakCount = 1;
  }
  
  lastConfessionDate = today;
  localStorage.setItem('lastConfessionDate', lastConfessionDate);
  localStorage.setItem('streakCount', streakCount);
}

async function submitConfession() {
  const confession = textarea.value.trim();

  if (!confession) return;

  try {
    const { error } = await supabase
      .from('confessions')
      .insert([{ content: confession }]);

    if (error) throw error;

    textarea.value = '';
    charCount.textContent = '0';
    charCount.parentElement.classList.remove('max-chars');
    
    confessionCount++;
    updateStreak();
    updateConfessionCount();
    checkAchievements();
    loadFeaturedConfessions();
    
    // Random chance for special achievement
    if (Math.random() < 0.1) {
      showAchievement('Blessed by the Crimson Code');
    }
  } catch (error) {
    console.error('Error submitting confession:', error);
  }
}

async function voteForConfession(confessionId) {
  if (votedConfessions.has(confessionId)) return;

  try {
    const { error } = await supabase.rpc('increment_votes', { 
      confession_id: confessionId
    });
    
    if (error) throw error;

    votedConfessions.add(confessionId);
    localStorage.setItem('votedConfessions', JSON.stringify([...votedConfessions]));
    loadFeaturedConfessions();
    
    // Check voting achievements
    const voteCount = votedConfessions.size;
    if (voteCount === 1) showAchievement('First Vote Cast');
    if (voteCount === 10) showAchievement('Active Voter');
    if (voteCount === 50) showAchievement('Voting Master');
  } catch (error) {
    console.error('Error voting for confession:', error);
  }
}

async function loadFeaturedConfessions() {
  try {
    const { data: topConfessions, error: topError } = await supabase
      .from('confessions')
      .select('*')
      .order('votes', { ascending: false })
      .limit(5);

    if (topError) throw topError;

    const { data: dailyConfession, error: dailyError } = await supabase
      .from('confessions')
      .select('*')
      .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
      .order('votes', { ascending: false })
      .limit(1);

    if (dailyError) throw dailyError;

    const featuredDiv = document.getElementById('featured-confessions');
    featuredDiv.innerHTML = `
      ${dailyConfession.length > 0 ? `
        <div class="featured-section">
          <h3>COINFESSOL of the Day</h3>
          <div class="confession featured">
            <pre>${escapeHtml(dailyConfession[0].content)}</pre>
            <div class="vote-section">
              <button onclick="voteForConfession('${dailyConfession[0].id}')" 
                      class="${votedConfessions.has(dailyConfession[0].id) ? 'voted' : ''}">
                Support (${dailyConfession[0].votes || 0})
              </button>
            </div>
            <div class="timestamp">${formatTimestamp(dailyConfession[0].created_at)}</div>
          </div>
        </div>
      ` : ''}
      <div class="featured-section">
        <h3>Top 5 COINFESSOLS</h3>
        ${topConfessions.map(confession => `
          <div class="confession">
            <pre>${escapeHtml(confession.content)}</pre>
            <div class="vote-section">
              <button onclick="voteForConfession('${confession.id}')"
                      class="${votedConfessions.has(confession.id) ? 'voted' : ''}">
                Support (${confession.votes || 0})
              </button>
            </div>
            <div class="timestamp">${formatTimestamp(confession.created_at)}</div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading featured confessions:', error);
  }
}

function updateConfessionCount() {
  confessionCountElement.textContent = confessionCount;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function checkAchievements() {
  if (confessionCount === 1) {
    showAchievement('First Confession');
  } else if (confessionCount === 5) {
    showAchievement('Devoted Confessor');
  } else if (confessionCount === 10) {
    showAchievement('Master of Secrets');
  } else if (confessionCount === 25) {
    showAchievement('Grand Confessor');
  } else if (confessionCount === 50) {
    showAchievement('Keeper of Secrets');
  }
}

// Character count listener
if (textarea) {
  textarea.addEventListener('input', () => {
    const length = textarea.value.length;
    charCount.textContent = length;
    
    if (length >= 500) {
      charCount.parentElement.classList.add('max-chars');
    } else {
      charCount.parentElement.classList.remove('max-chars');
    }
  });
}

// Make functions available globally
window.submitConfession = submitConfession;
window.voteForConfession = voteForConfession;
window.revealWisdom = revealWisdom;
window.revealProphecy = revealProphecy;
window.triggerMysticEffect = triggerMysticEffect;
window.revealHiddenLore = revealHiddenLore;
window.toggleChapter = toggleChapter;
window.acceptTerms = acceptTerms;
window.rejectTerms = rejectTerms;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkTermsAcceptance();
  createConstellation();
  
  // Load saved data
  const savedVotes = localStorage.getItem('votedConfessions');
  if (savedVotes) {
    votedConfessions = new Set(JSON.parse(savedVotes));
  }
  
  lastConfessionDate = localStorage.getItem('lastConfessionDate');
  streakCount = parseInt(localStorage.getItem('streakCount')) || 0;
  
  loadFeaturedConfessions();
  
  // Set up refresh interval
  setInterval(loadFeaturedConfessions, 60000); // Refresh every minute
});