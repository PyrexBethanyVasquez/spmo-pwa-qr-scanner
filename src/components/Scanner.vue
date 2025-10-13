<template>
  <div class="scanner-page-pro">
    <header class="app-header">
      <div class="header-left">
        <!-- Hamburger Menu -->
        <button class="hamburger" @click="toggleSidebar">
         <ion-icon name="menu-outline"></ion-icon>
        </button>

        <!-- Logo -->
        
        <h1>Ease See Scan</h1>
      </div>

      <!-- Sync Button -->
      <div class="sync-section">
        <button class="sync-icon-btn" 
                :disabled="!isOnline" 
                @click="syncPendingUpdates"
                title="Sync Pending Updates">
          <ion-icon name="sync-outline" class="spinning"></ion-icon>
          <span class="update-count">{{ pendingUpdates.length }}</span>
          <span v-if="!isOnline" class="offline-label">(Offline)</span>
        </button>
      </div>
    </header>


      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <div class="user-avatar">
            <ion-icon name="person-circle-outline"></ion-icon>
          </div>
          <div class="user-info">
            <p class="user-name">{{ user?.user_metadata?.full_name || user?.email }}</p>
            <span class="role-badge" :class="role">{{ role }}</span>
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <button @click="logout" class="logout-btn">
            <ion-icon name="log-out-outline"></ion-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>


     <div class="overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>

    <!-- Load Items -->
    <main class="content">
    <div class="load-section">
      <button
        class="action-btn primary-btn"
        :class="{ loading: isLoadingAll }"
        @click="loadAllItems"
        :disabled="isLoadingAll"
      >
        <ion-icon :name="isLoadingAll ? 'sync-outline' : 'cloud-download-outline'"></ion-icon>
        {{ isLoadingAll ? "Loading..." : "Load All Items Offline" }}
      </button>
      <p v-if="loadingMsg" class="status-msg">{{ loadingMsg }}</p>
      <p v-if="errorLoadingMsg" class="status-msg error">{{ errorLoadingMsg }}</p>
      <p class="cache-status" v-if="cachedItems.length > 0 && !loadingMsg">
        <ion-icon name="layers-outline"></ion-icon>
        Cached: <b>{{ cachedItems.length }}</b> items for offline use.
      </p>
    </div>

    <!-- Scanner -->
    <div class="scanner-container">
      <div class="scanner-viewport" :class="{ 'scanning-error': streamError }">
        <qrcode-stream @decode="onDecode" @error="onCameraError" :track="paintBoundingBox">
          <div v-if="!result && !streamError" class="scanner-overlay">
            <div class="scanner-line"></div>
            <p class="overlay-text">Place QR code within the frame.</p>
          </div>
        </qrcode-stream>
      </div>

      <!-- Feedback -->
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

    <!-- Item Modal -->
    <div v-if="item" class="slide-up-modal-overlay" @click.self="closeModal">
      <div class="slide-up-modal">
        <header class="modal-header">
          <h3><ion-icon name="cube-outline"></ion-icon> Item Details</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

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
            <span class="detail-label"><ion-icon name="calendar-outline"></ion-icon> Date Acquired:</span>
            <span class="detail-value">{{ item.date_acquired }}</span>
          </li>
          <li>
            <span class="detail-label"><ion-icon name="alert-circle-outline"></ion-icon> Status:</span>
            <span class="detail-value status">{{ item?.action?.action_name || "Unknown" }}</span>
          </li>

          <!-- Status Update -->
          <li class="status-update">
            <label class="status-label">Change Status:</label>
            <div class="custom-select-btn" @click="toggleDropdown = true">
              {{ selectedStatusName || "-- Select Action --" }}
              <ion-icon name="chevron-up-outline" v-if="toggleDropdown"></ion-icon>
              <ion-icon name="chevron-down-outline" v-else></ion-icon>
            </div>

            <!-- Dropdown -->
            <transition name="slide-up">
              <div v-if="toggleDropdown" class="slide-up-modal-overlay" @click.self="toggleDropdown = false">
                <div class="slide-up-modal">
                  <ul>
                    <li v-for="action in actionOptions" :key="action.action_id" @click="selectAction(action)">
                      {{ action.action_name }}
                    </li>
                  </ul>
                </div>
              </div>
            </transition>

            <button class="update-btn" :disabled="!selectedStatus" @click="confirmUpdateStatus">
              Update Status
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="updateloadingMsg" class="toast-notification">
      <ion-icon name="checkmark-circle-outline" class="toast-icon"></ion-icon>
      <p>{{ updateloadingMsg }}</p>
    </div>

    <div class="user-log" v-if="userLogs.length">
      <h3>User Update Log</h3>
      <ul>
        <li v-for="(log, index) in userLogs" :key="index">
          <ion-icon name="create-outline"></ion-icon>
          <b>{{ log.itemName }}</b> ({{ log.itemNo }}) → <i>{{ log.newStatus }}</i>
          <span class="log-time">{{ log.time }}</span>
        </li>
      </ul>
    </div>

    <div v-if="loadingMsg" class="toast-notification">
      <ion-icon name="checkmark-circle-outline" class="toast-icon"></ion-icon>
      <span>{{ loadingMsg }}</span>
      <button @click="loadingMsg = null" class="toast-close">&times;</button>
    </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { QrcodeStream } from "vue3-qrcode-reader";
import { supabase } from "../clients/supabase.js";
import { useRouter } from "vue-router";
import localforage from "localforage";

// --- Reactive State ---
const user = ref(null)
const role = ref('user')
const result = ref(null);
const item = ref(null);
const itemErrorMsg = ref(null);
const loadingMsg = ref(null);
const updateloadingMsg = ref(null);
const errorLoadingMsg = ref(null);
const isLoadingAll = ref(false);
const selectedStatus = ref("");
const toggleDropdown = ref(false);
const userLogs = ref([]);
const isOnline = ref(navigator.onLine);
const sidebarOpen = ref(false)
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value)

const cachedItems = ref([]);
const actionOptions = ref([]);
const pendingUpdates = ref([]);
const transactions = ref([])

const itemsDB = localforage.createInstance({ name: "itemsCache" });
const actionDB = localforage.createInstance({ name: "actionCache" });
const pendingUpdatesDB = localforage.createInstance({ name: "pendingUpdates" });

const router = useRouter();

// --- Online/Offline Detection ---
window.addEventListener("online", () => { isOnline.value = true; });
window.addEventListener("offline", () => { isOnline.value = false; });


// Fetch user info and role
onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  if (user.value) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .maybeSingle()
    role.value = profile?.role || 'user'
  }
})
// --- Load Cached Data ---
onMounted(async () => {
  const localItems = await itemsDB.getItem("allItems");
  if (localItems) cachedItems.value = localItems;

  const savedUpdates = await pendingUpdatesDB.getItem("updates");
  if (savedUpdates) pendingUpdates.value = savedUpdates;

  await loadActions();
  await refreshPendingUpdates();
  await fetchTransactions();
});

// --- Functions ---
const loadAllItems = async () => {
  isLoadingAll.value = true;
  loadingMsg.value = "Syncing inventory from server...";
  try {
    const { data, error } = await supabase.from("items").select(`*, action:status(action_id,action_name)`);
    if (!error && data) {
      cachedItems.value = data;
      await itemsDB.setItem("allItems", data);
      loadingMsg.value = `Loaded ${data.length} items for offline use.`;
    } else {
      errorLoadingMsg.value = "Failed to load items from Supabase.";
    }
  } catch (err) {
    errorLoadingMsg.value = "Network error. Check connection.";
  } finally {
    isLoadingAll.value = false;
    setTimeout(() => (loadingMsg.value = null), 4000);
  }
};

const loadActions = async () => {
  const localActions = await actionDB.getItem("allActions");
  if (localActions) actionOptions.value = localActions;

  if (navigator.onLine) {
    const { data, error } = await supabase.from("action").select("*");
    if (!error && data) {
      actionOptions.value = data;
      await actionDB.setItem("allActions", data);
    }
  }
};

// Update item status
const updateItemStatus = async (itemId, newStatusId) => {
  const index = cachedItems.value.findIndex(i => i.item_no === itemId);
  if (index !== -1) {
    cachedItems.value[index].status = newStatusId;
    const action = actionOptions.value.find(a => a.action_id === newStatusId);
    cachedItems.value[index].action = action || { action_id: newStatusId, action_name: 'Pending Sync' };
    item.value = cachedItems.value[index];
    await itemsDB.setItem('allItems', JSON.parse(JSON.stringify(cachedItems.value)));
  }

  if (navigator.onLine) {
    const { data, error } = await supabase
      .from("items")
      .update({ status: newStatusId })
      .eq("item_no", itemId)
      .select(`*, action:status(action_id,action_name)`);
    if (!error && data?.[0]) {
      if (index !== -1) cachedItems.value[index] = data[0];
      await itemsDB.setItem('allItems', JSON.parse(JSON.stringify(cachedItems.value)));

       const { error: txnError } = await supabase
      .from("transaction")
      .insert({
        item_no: itemId,
        action_id: newStatusId,
        user_id: (await supabase.auth.getUser()).data.user.id,
        date: new Date().toISOString()
      });

    if (txnError) {
      console.error("Failed to record transaction:", txnError);
      // Optionally queue transaction for offline sync
    }

    } else {
      await queuePendingUpdate(itemId, newStatusId);
    }
  } else {
    await queuePendingUpdate(itemId, newStatusId);
  }

  updateloadingMsg.value = "Item status updated successfully.";
  setTimeout(() => (updateloadingMsg.value = null), 3000);
};

const fetchTransactions = async () => {
  const { data, error } = await supabase
  .from('transaction')
  .select(`
    txn_id,
    date,
    item:item_id(
      name,
      item_no,
      serial_no,
      model_brand,
      location,
      dept_id(dept_name)
    ),
    action:action_id(action_name),
    user:user_id(full_name)
  `)
  .order('date', { ascending: false });


 transactions.value = data.map(txn => ({
  id: txn.txn_id,
  date: txn.date,
  item_no: txn.item?.item_no || 'N/A',
  item_name: txn.item?.name || 'N/A',
  serial_no: txn.item?.serial_no || 'N/A',
  model_brand: txn.item?.model_brand || 'N/A',
  location: txn.item?.location || 'N/A',
  dept_name: txn.item?.dept_id?.dept_name || 'N/A',  // department from item
  status_name: txn.action?.action_name || 'Issued',
  status_id: txn.action_id,
  user_name: txn.user?.full_name || 'Admin',  // user who updated
}));

};


const refreshPendingUpdates = async () => {
  const pending = await pendingUpdatesDB.getItem("updates") || [];
  pendingUpdates.value = pending;
};

const queuePendingUpdate = async (itemId, statusId) => {
  const pending = await pendingUpdatesDB.getItem("updates") || [];
  pending.push({ item_no: itemId, status: statusId, timestamp: new Date().toISOString() });
  pendingUpdates.value = pending;
  await pendingUpdatesDB.setItem("updates", pending);
  await refreshPendingUpdates();
};

const syncPendingUpdates = async () => {
  if (!navigator.onLine) return;
  const pending = await pendingUpdatesDB.getItem("updates") || [];
  if (!pending.length) return;

  const successful = [];
  for (const update of pending) {
    const { data, error } = await supabase
      .from("items")
      .update({ status: update.status })
      .eq("item_no", update.item_no)
      .select(`*, action:status(action_id,action_name)`);

    if (!error && data?.[0]) {
      const index = cachedItems.value.findIndex(i => i.item_no === update.item_no);
      if (index !== -1) cachedItems.value[index] = data[0];
      successful.push(update);
    }
  }

  if (successful.length > 0) {
    const remaining = pending.filter(u => !successful.includes(u));
    pendingUpdates.value = remaining;
    await pendingUpdatesDB.setItem("updates", remaining);
    await itemsDB.setItem('allItems', JSON.parse(JSON.stringify(cachedItems.value)));
    updateloadingMsg.value = `${successful.length} pending updates synced successfully.`;
    setTimeout(() => (updateloadingMsg.value = null), 3000);
  }
};

// QR Decode
const onDecode = async (content) => {
  if (result.value === content) return;
  result.value = content;
  itemErrorMsg.value = null;
  item.value = null;
  selectedStatus.value = "";

  const found = cachedItems.value.find(i => i.item_no === content);
  if (found) item.value = found;
  else itemErrorMsg.value = navigator.onLine
    ? `Item ID ${content} not found.`
    : `Offline: Item ID ${content} not in cache.`;

  setTimeout(() => (result.value = null), 1000);
};

// Logout
const logout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};

// Helpers
const paintBoundingBox = (detectedCodes, ctx) => {
  if (!Array.isArray(detectedCodes) || !ctx) return;
  for (const d of detectedCodes) {
    const { boundingBox: { x, y, width, height } } = d;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#4A90E2";
    ctx.strokeRect(x, y, width, height);
  }
};

const closeModal = () => {
  item.value = null;
  selectedStatus.value = "";
  toggleDropdown.value = false;
};

const confirmUpdateStatus = async () => {
  if (!selectedStatus.value || !item.value) return;
  await updateItemStatus(item.value.item_no, selectedStatus.value);

  const selStatus = actionOptions.value.find(a => a.action_id === selectedStatus.value);
  userLogs.value.unshift({
    itemName: item.value.name,
    itemNo: item.value.item_no,
    newStatus: selStatus?.action_name || "Unknown",
    time: new Date().toLocaleString(),
  });

  selectedStatus.value = "";
  closeModal();
};

const selectedStatusName = computed(() => {
  const sel = actionOptions.value.find(a => a.action_id === selectedStatus.value);
  return sel ? sel.action_name : "";
});

const selectAction = (action) => {
  selectedStatus.value = action.action_id;
  toggleDropdown.value = false;
};
</script>

