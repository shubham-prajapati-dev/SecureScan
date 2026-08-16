const DB_NAME = "securescan_quarantine_db";
const STORE_NAME = "quarantined_files";
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Quarantine storage is not supported by this browser."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open quarantine storage."));
  });
}

export async function quarantineFile(file, metadata = {}) {
  const db = await openDatabase();
  const record = {
    id: metadata.id || `${Date.now()}-${file.name}-${file.size}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || "application/octet-stream",
    quarantinedAt: new Date().toISOString(),
    blob: file,
    ...metadata,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => {
      db.close();
      resolve(record);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to quarantine the file."));
    };
  });
}

export async function listQuarantinedFiles() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      db.close();
      resolve((request.result || []).sort((a, b) => new Date(b.quarantinedAt) - new Date(a.quarantinedAt)));
    };
    request.onerror = () => {
      db.close();
      reject(request.error || new Error("Unable to load quarantined files."));
    };
  });
}

export async function deleteQuarantinedFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("Unable to remove the quarantined file."));
    };
  });
}
