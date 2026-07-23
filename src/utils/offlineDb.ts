/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PWA Offline IndexedDB & Sync Engine for Íris Clinical App
 */

export interface OfflineAction {
  id: string;
  type: 'UPDATE_PATIENT' | 'NEW_APPOINTMENT' | 'NEW_TRANSACTION' | 'ADD_EXAM_LAUDO';
  payload: any;
  timestamp: string;
  synced: boolean;
}

const DB_NAME = 'IrisClinicaPWA_DB';
const DB_VERSION = 1;
const STORE_PATIENTS = 'patients_cache';
const STORE_SYNC_QUEUE = 'offline_sync_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não é suportado neste navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PATIENTS)) {
        db.createObjectStore(STORE_PATIENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save patients to IndexedDB
export async function savePatientsToIndexedDB(patients: any[]): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PATIENTS, 'readwrite');
    const store = tx.objectStore(STORE_PATIENTS);
    
    for (const patient of patients) {
      store.put(patient);
    }
    
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Erro ao salvar no IndexedDB:', err);
    return false;
  }
}

// Get cached patients from IndexedDB
export async function getPatientsFromIndexedDB(): Promise<any[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PATIENTS, 'readonly');
    const store = tx.objectStore(STORE_PATIENTS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Erro ao ler IndexedDB:', err);
    return [];
  }
}

// Add an offline action to queue
export async function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<OfflineAction> {
  const newAction: OfflineAction = {
    ...action,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    synced: false
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.put(newAction);
  } catch (err) {
    console.warn('Erro ao enfileirar ação offline:', err);
  }

  return newAction;
}

// Get all pending actions
export async function getPendingOfflineActions(): Promise<OfflineAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve((request.result || []).filter((item: OfflineAction) => !item.synced));
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

// Clear or mark actions as synced
export async function clearSyncedOfflineActions(): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
