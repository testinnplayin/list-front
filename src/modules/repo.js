"use strict";

import dbRequests from "../helpers/db-requests";

import getRequests from "../ajax/get-requests";

let db;

export default {
    fetchState () {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["list_elements"], "readonly");
            const oStore = transaction.objectStore("list_elements");

            const request = oStore.getAll();

            request.onerror = e => {
                reject(e.target.errorCode);
            };

            request.onsuccess = e => {
                resolve({
                    stale : true,
                    listElements : e.target.result
                });
            };
        });
    },
    initializeDB () {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open("TestList", 1);

            request.onerror = e => {
                reject(e.target.errorCode);
            };

            request.onupgradeneeded = e => {
                db = e.target.result;

                db.createObjectStore("list_elements", { keyPath : "_id" }, { unique : true });
            };

            request.onsuccess = e => {
                resolve();
            };
        });
    },
    setUpIDB () {
        const normalURL = "http://localhost:3000/list-elements";
        return new Promise((resolve, reject) => {
            if (!db) {
                reject("Database not initialized!");
            } else {
                
                    getRequests.getResourcesNormal(normalURL)
                        .then(data => {
                            const internalModel = data.list_elements.map(obj => {
                                obj.local_timestamp = new Date();
                                return obj;
                            });
                            return dbRequests.insertObjects(db, internalModel);
                        })
                        .then(() => {
                            console.log("Database filled");
                            resolve();
                        })
                        .catch(err => reject(err));
                
            }
        });
    },
    syncWBack () {
        const normalURL = "http://localhost:3000/list-elements";

        return new Promise((resolve, reject) => {
            if (!db) {
                reject("something happened to iDB!");
            } else {
                getRequests.getResourcesNormal(normalURL)
                    .then(data => {
                        console.log("data updated");
                        resolve({
                            listElements : data.list_elements,
                            stale : false
                        });
                    })
                    .then(data => {
                        return dbRequests.updateObjects(db, data.list_elements);
                    })
                    .then(() => console.log("data finished being updated"))
                    .catch(err => reject(err));
            }
        });
    }
};