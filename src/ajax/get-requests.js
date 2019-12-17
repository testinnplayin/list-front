"use strict";

const getOpts = {
    method : "GET"
};

export default {
    getResouresNormal (url) {
        let reqOpts = getOpts;
        const getReq = new Request(url, reqOpts);

        fetch(getReq)
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                return response;
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
            .catch(err => console.error("Error while fetching normally ", err));
    }
}