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
                    console.log("normal response ", response);
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
    },
    getStreamedResources (url) {
        const getReq = new Request(url, getOpts);

        return new Promise((resolve, reject) => {
            // const decoder = new TextDecoder("utf-8");

            fetch(getReq)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.body;
                })
                .then(rBody => {
                    const reader = rBody.getReader();

                    return new ReadableStream({
                        start(controller) {
                            function readChunk() {
                                return reader.read()
                                    .then(({ done, value }) => {
                                        if (done) {
                                            controller.close();
                                            return;
                                        }

                                        controller.enqueue(value);

                                        return readChunk();
                                    })
                                    .catch(err => reject(err));
                            }

                            return readChunk();
                        }
                    });
                })
                .then(stream => {
                    return new Response(stream);
                })
                .then(response => resolve(response.text()))
                .catch(err => reject(err));
        });
    }
}