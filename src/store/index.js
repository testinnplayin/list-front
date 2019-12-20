import Vue from 'vue'
import Vuex from 'vuex'

import repo from "../modules/repo";
import getRequests from "../ajax/get-requests";

const baseUrl = "http://localhost:3000/list-elements";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sListElements : [],
    errMsg : null
  },
  mutations: {
    resetListElements (state) {
      state.sListElements = [];
    },
    setErrorMsg (state, errMsg) {
      if (errMsg) {
        state.errMsg = errMsg
      }
    },
    setListElements (state, dataArr) {
      state.sListElements = state.sListElements.concat(dataArr);
    },
    setOldListElements (state, data) {
      state.sListElements = data;
    }
  },
  actions: {
    syncWBack (context) {
      getRequests.getStreamedResources(`${baseUrl}/stream`)
        .then(data => {
          console.log("arrival of new data ", new Date());
          context.commit("resetListElements");
          // we set up the three colons in the back-end code for easier chunk splitting
          let arrOfJSON = data.split(":::");
          // drops final "" that causes a JSON parse error
          arrOfJSON = arrOfJSON.slice(0, arrOfJSON.length - 1);
          arrOfJSON.forEach(jsonArr => {
              const dataArr = JSON.parse(jsonArr);
              context.commit("setListElements", dataArr);
              repo.promptForUpdating(dataArr);
          });
        })
        .catch(err => context.commit("setErrorMsg", err));
    }
  },
  getters : {
    getListElements (state) {
      return state.sListElements;
    }
  }
})
