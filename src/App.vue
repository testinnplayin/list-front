<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>|
      <router-link to="/list">See List</router-link>
    </div>
    <router-view @handleButtonClick="handleButtonClick" :list-elements="listElements" :stale="stale"  />
  </div>
</template>

<script>
// import { mapActions, mapGetters, mapMutations } from "vuex";
import getRequests from "./ajax/get-requests";

import repo from "./modules/repo";

export default {
	name : "App",
	data () {
		return {
			dateRange : null,
			hasHitBottom : false,
			listElements : [],
			stale : true
		};
	},
	computed : {
		// NOTE: keep for streaming
		// ...mapGetters(["getListElements"]),
		// listElements () {
		// 	return this.$store.getters.getListElements;
		// },
		// sortedListElements () {
		// 	const listElements = this.listElements;

		// 	if (listElements) {
		// 		return listElements.sort((a, b) => {
		// 			return a.local_timestamp - b.local_timestamp;
		// 		});
		// 	}
		// }
	},
	created () {
		const rName = this.$route.name;

        window.addEventListener("scroll", this.handleScroll);

		if (rName === "list") {
			if (!window.indexedDB) {
				console.warn("This browser does not support indexedDB!");
			} else {
				this.promptForInitialization();
			}
		}
	},
    destroyed () {
        window.removeEventListener("scroll", this.handleScroll);
    },
	methods : {
		// ...mapActions(["syncWBack"]),
		// ...mapMutations(["setOldListElements"]),
		fetchNewPage () {
			const dateRange = this.dateRange;

			if (dateRange) {
				repo.fetchPage(dateRange)
					.then(newData => {
						this.hasHitBottom = false;

						let newElArray = newData.list_elements.map(el => el);
						const lng = newElArray.length;
						const copyOfOld = this.listElements.map(el => el);
						const arrOfOldIds = copyOfOld.map(el => el._id);
						
						let tempElArr = [];

						for (let i = 0; i < lng; i++) {
							const el = newElArray[i];
							const oldInd = arrOfOldIds.indexOf(el._id);

							if (oldInd < 0) {
								tempElArr.push(newElArray[i]);
							}
						}

						this.listElements = this.listElements.concat(tempElArr);
					})
					.catch(err => console.error("Error while fetching new page ", err));
			}
		},
		fetchState () {
			repo.fetchState()
				.then(oldData => {
					console.log("arrival of oldData ", new Date());
					this.listElements = oldData.listElements;
					// this.$store.commit("setOldListElements", oldData.listElements);
					if (oldData.stale) {
						this.promptForSync();
					}
				})
				.catch(err => console.error(`Error while fetching data from iDB: ${err}`));
		},
		handleButtonClick () {
			this.fetchNewPage();
		},
		promptForInitialization () {
			repo.initializeDB()
				.then(() => {
					console.log("first write started ", new Date());
					this.setUpIDB();
				})
				.catch(err => console.error("Error while initializing database ", err));
		},
		promptForSync () {
			// keep for streaming call
			// this.syncWBack();
			// keep for normal blob call
			// repo.syncWBack()
			// 	.then(newData => {
			// 		console.log("new data arrival timestamp ", new Date());
			// 		this.listElements = newData.listElements;
			// 		this.stale = newData.stale;
			// 	})
			// 	.catch(err => console.error(`Error while synching with back ${err}`));

			repo.fetchPage()
				.then(data => {
					this.listElements = data.list_elements;
					// this.updateDateRange();
					this.stale = data.stale;
				})
				.catch(err => console.error("Error while fetching new data ", err));
		},
		setUpIDB () {
			repo.setUpIDB()
				.then(() => {
					console.log("first write finished ", new Date());
					this.fetchState();
				})
				.catch(err => console.error(`Error while setting up object store ${err}`));
		}
	},
	watch : {
		"$route" () {
			const rName = this.$route.name;

			if (rName === "list") {
				console.log("changed to list view");
				this.promptForInitialization();
			}
		},
		listElements () {
			const listElements = this.listElements;
			const lng = listElements.length;

			if (lng > 0) {
				const lastElement = listElements[lng - 1];
				this.dateRange = lastElement.createdAt;
			}
		}
	}
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
