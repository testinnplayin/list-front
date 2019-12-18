<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>|
      <router-link to="/list">See List</router-link>
    </div>
    <router-view :list-elements="listElements" :stale="stale"  />
  </div>
</template>

<script>
import getRequests from "./ajax/get-requests";

import repo from "./modules/repo";

export default {
	name : "App",
	data () {
		return {
			listElements : [],
			stale : true
		};
	},
	computed : {
		sortedListElements () {
			const listElements = this.listElements;

			if (listElements) {
				return listElements.sort((a, b) => {
					return a.local_timestamp - b.local_timestamp;
				});
			}
		}
	},
	created () {
		const rName = this.$route.name;

		if (rName === "list") {
			console.log("!");

			if (!window.indexedDB) {
				console.warn("This browser does not support indexedDB!");
			} else {
				this.promptForInitialization();
			}
		}
	},
	methods : {
		fetchState () {
			repo.fetchState()
				.then(oldData => {
					console.log("arrival of oldData ", new Date());
					this.listElements = oldData.listElements;

					if (oldData.stale) {
						this.promptForSync();
					}
				})
				.catch(err => console.error(`Error while fetching data from iDB: ${err}`));
		},
		promptForInitialization () {
			console.log("promptForInitialization");
			repo.initializeDB()
				.then(() => {
					console.log("first write started ", new Date());
					this.setUpIDB();
				})
				.catch(err => console.error("Error while initializing database ", err));
		},
		promptForSync () {
			repo.syncWBack()
				.then(newData => {
					console.log("new data arrival timestamp ", new Date());
					this.listElements = newData.listElements;
					this.stale = newData.stale;
				})
				.catch(err => console.error(`Error while synching with back ${err}`));
		},
		setUpIDB () {
			repo.setUpIDB()
				.then(() => {
					console.log("first write finished ", new Date());
					// this.fetchState();
				})
				.catch(err => console.error(`Error while setting up object store ${err}`));
		}
	},
	watch : {
		"$route" () {
			const rName = this.$router.name;

			if (rName === "list") {
				console.log("changed to list view");
				this.promptForInitialization();
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
