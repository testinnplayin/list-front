"use strict";

const getOpts = {
    method : "GET"
};

export default {
    getResourcesNormal (url) {
        let reqOpts = getOpts;
        const getReq = new Request(url, reqOpts);

        return new Promise((resolve,reject) => {
            fetch(getReq)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }

                    return response;
                })
                .then(res => res.json())
                .then(data => {
                    resolve(data);
                })
                .catch(err => reject(err));
        });
    }
}