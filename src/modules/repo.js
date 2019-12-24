"use strict";

import dbRequests from "../helpers/db-requests";

import getRequests from "../ajax/get-requests";

let db;

const baseUrl = "http://localhost:3000/list-elements";

export default {
    fetchPage (dateLimit) {
        let newUrl = `${baseUrl}/pages`;
        let newData;

        if (dateLimit) {
            newUrl = `${newUrl}?date=${dateLimit}`;
        }

        return new Promise((resolve, reject) => {
            getRequests.getResourcesNormal(newUrl)
                .then(data => {
                    console.log('arrival of new data ', new Date());

                    newData = data;

                    return Promise.all(data.list_elements.map(el => dbRequests.updateObject(db, el)));
                })
                .then(() => {
                    console.log('finished updating database');
                    resolve({
                        list_elements : newData.list_elements,
                        stale : false
                    });
                })
                .catch(err => reject(err));
        });
    },
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
    promptForUpdating (data) {
        return dbRequests.updateObjects(db, data);
    },
    setUpIDB () {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject("Database not initialized!");
            } else {
                // NOTE: keep the following for streaming
                // getRequests.getStreamedResources(`${baseUrl}/stream`)
                //     .then(data => {
                //         let arrOfJSON = data.split(":::");
                //         arrOfJSON = arrOfJSON.slice(0, arrOfJSON.length - 1);
                //         return Promise.all(arrOfJSON.map(jsonObj => {
                //             const dataObj = JSON.parse(jsonObj);
                //             return dbRequests.insertObjects(db, dataObj);
                //         }));
                //     })
                //     .then(() => {
                //         console.log("Database filled");
                //         resolve();
                //     })
                //     .catch(err => reject(err));
                // NOTE: keep the following for further normal call test and page tests, just replace normalURL with baseURL for normal
                const normalURL = `${baseUrl}/pages`;
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
        const normalURL = baseUrl;

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