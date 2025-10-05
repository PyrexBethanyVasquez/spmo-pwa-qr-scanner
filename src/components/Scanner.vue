<template>
  <div class="scanner-page-pro">
    <header class="app-header">
  <div class="header-left">
    <ion-icon name="qr-code-outline" class="header-icon"></ion-icon>
    <h1>Ease See Scan</h1>
  </div>
  <div class="header-end">
    <button class="logout-icon-btn" @click="logout" title="Logout">
      <ion-icon name="log-out-outline"></ion-icon>
    </button>
  </div>
</header>


    <div class="load-section">
      <button 
        class="action-btn primary-btn" 
        :class="{ 'loading': isLoadingAll }"
        @click="loadAllItems"
        :disabled="isLoadingAll"
      >
        <ion-icon :name="isLoadingAll ? 'sync-outline' : 'cloud-download-outline'"></ion-icon>
        {{ isLoadingAll ? 'Loading...' : 'Load All Items Offline' }}
      </button>
      <p v-if="loadingMsg" class="status-msg" :class="{'error': loadingMsg.includes('Failed') || loadingMsg.includes('Error')}">
        {{ loadingMsg }}
      </p>
      <p class="cache-status" v-if="cachedItems.length > 0 && !loadingMsg">
        <ion-icon name="layers-outline"></ion-icon> 
        Cached: <b>{{ cachedItems.length }}</b> items for offline use.
      </p>
    </div>
    
    <div class="scanner-container">
      <div class="scanner-viewport" :class="{ 'scanning-error': streamError }">
        <qrcode-stream 
          @decode="onDecode" 
          @error="onCameraError"
          :track="paintBoundingBox"
        >
          <div v-if="!result && !streamError" class="scanner-overlay">
            <div class="scanner-line"></div>
            <p class="overlay-text">Place QR code within the frame.</p>
          </div>
        </qrcode-stream>
      </div>

      <div class="feedback-area">
        <p v-if="result" class="scan-result success">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          Scanned: <b>{{ result }}</b>
        </p>
        <p v-if="streamError" class="feedback-msg error">
          <ion-icon name="videocam-off-outline"></ion-icon>
          Camera Error: {{ streamError }}
        </p>
        <p v-if="itemErrorMsg" class="feedback-msg warning">
          <ion-icon name="alert-circle-outline"></ion-icon>
          {{ itemErrorMsg }}
        </p>
      </div>
    </div>

    <div v-if="item" class="item-card shadow-md">
      <h3>
        <ion-icon name="cube-outline"></ion-icon>
        Item Details
      </h3>
      <ul class="item-details">
        <li>
          <span class="detail-label"><ion-icon name="document-text-outline"></ion-icon> Name:</span> 
          <span class="detail-value">{{ item.name }}</span>
        </li>
         <li>
          <span class="detail-label"><ion-icon name="bookmark-outline"></ion-icon> Model:</span> 
         <span class="detail-value">{{ item.model_brand }}</span>
        </li>
         <li>
          <span class="detail-label"><ion-icon name="document-text-outline"></ion-icon> Property No:</span> 
          <span class="detail-value">{{ item.property_no }}</span>
        </li>
        <li>
          <span class="detail-label"><ion-icon name="document-text-outline"></ion-icon> Serial No:</span> 
          <span class="detail-value">{{ item.serial_no }}</span>
        </li>
         <li>
          <span class="detail-label"><ion-icon name="location-outline"></ion-icon> Location:</span> 
          <span class="detail-value">{{ item.location }}</span>
        </li>
         
        <li>
          <span class="detail-label"><ion-icon name="alert-circle-outline"></ion-icon> Status:</span> 
          <span class="detail-value status">
            {{ item?.action?.action_name || 'Unknown' }}
          </span>
        </li>
         <li>
          <span class="detail-label"><ion-icon name="calendar-outline"></ion-icon> Date Acquired:</span> 
          <span class="detail-value">{{ item.date_acquired }}</span>
        </li>
      </ul>
    </div>

  
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { QrcodeStream } from 'vue3-qrcode-reader'
import { supabase } from '../clients/supabase.js'
import { useRouter } from 'vue-router'
import localforage from 'localforage'

// Reactive State
const result = ref(null)
const item = ref(null)
const itemErrorMsg = ref(null) // Error message for item lookup
const loadingMsg = ref(null) // Message for item loading (cache)
const isLoadingAll = ref(false) // Loading state for 'Load All Items' button
const streamError = ref(null) // Error for camera stream (e.g., permission denied)

const router = useRouter()

// Initialize IndexedDB storage
const itemsDB = localforage.createInstance({ name: 'itemsCache' })
const cachedItems = ref([])

// --- Lifecycle Hooks ---

// Load cached items on mount
onMounted(async () => {
  const localData = await itemsDB.getItem('allItems')
  if (localData) {
    cachedItems.value = localData
  }
})

// --- Methods ---

/**
 * Handles camera stream errors (e.g., permissions, unsupported).
 * @param {Error} error
 */
const onCameraError = (error) => {
  console.error('QR Stream Error:', error)
  if (error.name === 'NotAllowedError') {
    streamError.value = 'Camera access denied. Please grant permissions.'
  } else if (error.name === 'NotFoundError') {
    streamError.value = 'No camera found on this device.'
  } else {
    streamError.value = 'An unexpected camera error occurred.'
  }
}

// User-triggered load all items for offline cache
const loadAllItems = async () => {
  isLoadingAll.value = true
  loadingMsg.value = 'Syncing inventory from server...'
  itemErrorMsg.value = null
  try {
    const { data, error } = await supabase.from('items').select(`
    *,
    action:status (action_id,action_name)
  `)
    
    if (!error && data) {
      cachedItems.value = data
      await itemsDB.setItem('allItems', data)
      loadingMsg.value = `Successfully loaded ${data.length} items for offline use.`
    } else {
      loadingMsg.value = 'Failed to load items from Supabase.'
      console.error('Supabase load error:', error)
    }
  } catch (err) {
    loadingMsg.value = 'Error loading items. Check connection.'
    console.error('Network or local storage error:', err)
  } finally {
    isLoadingAll.value = false
    setTimeout(() => loadingMsg.value = null, 4000)
  }
}

// QR Scan handler
const onDecode = (content) => {
  // Only process if the content is new or a certain delay has passed (to prevent rapid scans)
  if (result.value === content) return

  result.value = content
  itemErrorMsg.value = null
  item.value = null

  const found = cachedItems.value.find(i => i.item_no === content)

  if (found) {
    item.value = found
  } else {
    itemErrorMsg.value = navigator.onLine 
      ? `Item ID ${content} not found in database.` 
      : `Offline: Item ID ${content} not in local cache.`
  }
  
  // Clear result after a short period to allow next scan
  setTimeout(() => result.value = null, 1000); 
}

// Logout
const logout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

// Helper to paint a bounding box around the QR code (UX improvement)
const paintBoundingBox = (detectedCodes, ctx) => {
  if (!Array.isArray(detectedCodes) || !ctx) return;
  for (const detectedCode of detectedCodes) {
    const { 
      boundingBox: { x, y, width, height } 
    } = detectedCode

    ctx.lineWidth = 2
    ctx.strokeStyle = '#4A90E2' // Primary color
    ctx.strokeRect(x, y, width, height)
  }
}

// Computed property for status styling
const statusClass = (status) => {
  if (!status) return 'default'
  const normalizedStatus = String(status).toLowerCase()
  if (normalizedStatus.includes('ok') || normalizedStatus.includes('good') || normalizedStatus.includes('active')) return 'status-ok'
  if (normalizedStatus.includes('broken') || normalizedStatus.includes('fault')) return 'status-bad'
  if (normalizedStatus.includes('pending') || normalizedStatus.includes('check')) return 'status-warn'
  return 'status-default'
}
</script>

<style scoped>
/* --- Global & Layout --- */
.scanner-page-pro { 
  padding: 1.5rem; 
  max-width: 520px; 
  margin: 0 auto; 
  font-family: 'Inter', sans-serif; /* Professional font */
}

/* --- Utilities --- */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* --- Header --- */
.app-header { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  justify-content: space-between;
}
.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}
.header-icon { 
  font-size: 2rem; 
  color: #4A90E2; /* Primary color */
}

/* --- Buttons & Loading Section --- */
.load-section { 
  text-align: center; 
  margin-bottom: 1.5rem; 
  padding: 0.5rem 0;
}
.action-btn { 
  padding: 0.75rem 1.5rem; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center;
  gap: 0.5rem; 
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-btn { 
  background: #4A90E2; 
  color: #fff;
}
.primary-btn:hover:not(:disabled) { 
  background: #3A7BBF;
}
.danger-btn { 
  background: #E85757; 
  color: #fff; 
}
.danger-btn:hover:not(:disabled) {
  background: #C44545;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.action-btn.loading ion-icon {
  animation: spin 1s linear infinite;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  font-size: 1.5rem;
}

/* logout icon button */
.logout-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dc2626; /* red */
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-icon-btn:hover {
  background: #b91c1c;
}


.status-msg, .cache-status {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}
.status-msg.error {
  color: #E85757;
  font-weight: 500;
}
.cache-status {
  color: #555;
}

/* --- Scanner Viewport & Overlay --- */
.scanner-container {
  margin-bottom: 1.5rem;
}
.scanner-viewport { 
  border: 2px solid #ccc; 
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 1 / 1; /* Enforce square for better UX */
}
.scanner-viewport.scanning-error {
  border-color: #E85757;
  background-color: #fcebeb;
}

/* QR Stream component styling */
:deep(.qrcode-stream-wrapper) {
  height: 100%;
}
:deep(.qrcode-stream-wrapper video) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Important for covering the viewport */
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allows clicks/taps to pass through */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scanner-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: rgba(74, 144, 226, 0.8); /* Primary color line */
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.9);
  animation: scan-move 2s infinite alternate; /* Scanning animation */
}
.overlay-text {
  position: absolute;
  bottom: 5%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* --- Feedback Area --- */
.feedback-area {
  min-height: 40px; /* Reserve space to prevent layout shift */
}
.scan-result, .feedback-msg { 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  font-weight: 500;
}
.scan-result.success { 
  color: #28a745; 
  background-color: #e6f4ea;
}
.feedback-msg.error { 
  color: #E85757; 
  background-color: #fcebeb;
}
.feedback-msg.warning { 
  color: #ffc107; 
  background-color: #fffbe6;
}

/* --- Item Card --- */
.item-card { 
  border: 1px solid #e0e0e0; 
  padding: 1.5rem; 
  border-radius: 12px; 
  margin-bottom: 1.5rem; 
  background-color: #fff;
}
.item-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4A90E2;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #eee;
}
.item-details {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item-details li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dotted #f0f0f0;
}
.item-details li:last-child {
  border-bottom: none;
}
.detail-label {
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}
.detail-value {
  font-weight: 600;
}

/* Status Badges */
.detail-value.status {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}
.status-ok {
  background-color: #d4edda;
  color: #155724;
}
.status-bad {
  background-color: #f8d7da;
  color: #721c24;
}
.status-warn {
  background-color: #fff3cd;
  color: #856404;
}
.status-default {
  background-color: #e2e3e5;
  color: #383d41;
}

/* --- Keyframe Animations --- */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes scan-move {
  0% { transform: translateY(-100px); opacity: 0.8; }
  100% { transform: translateY(100px); opacity: 0.8; }
}
</style>