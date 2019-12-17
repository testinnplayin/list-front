"use strict";

const oStoreName = "list_elements";

export default {
    insertObjects (db, objects) {
        return new Promise((resolve, reject) => {
            let transaction = db.transaction([oStoreName], "readwrite");
            let objectStore = transaction.objectStore(oStoreName);

            const lng = objects.length;
            let counter = 0;

            while(counter < lng) {
                const obj = objects[counter];
                const request = objectStore.add(obj);
                
                counter ++;

                request.onsuccess = e => {
                    if (counter === lng) {
                        resolve();
                    }
                };

                request.onerror = e => {
                    reject(e.target.errorCode);
                };
            }
        });
    },
    updateObjects (db, objects) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([oStoreName], "readwrite");
            const objectStore = transaction.objectStore(oStoreName);

            const lng = objects.length;

            for (let i = 0; i < lng; i++) {
                const obj = objects[i];
                const request = objectStore.put(obj);

                request.onerror = e => {
                    reject(e.target.errorCode);
                };

                request.onsuccess = e => {
                    if (i == lng) {
                        resolve();
                    }
                };
            }
        });
    }
};