<template>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="!isLoading && listElements.length === 0">No data yet</div>
    <ul v-else
        class="list-container">
        <list-element v-for="(el, index) of listElements"
            :el="el"
            :key="index"
            :ind="index"
            :stale="stale"
            :total-lng="totalLng">
        </list-element>
        <button @click="handleButtonClick" type="button">Bring In More</button>
    </ul>
</template>

<script>
export default {
    name : "ListContainer",
    data () {
        return {
            isLoading : true
        };
    },
    components : {
        ListElement : () => import("../components/ListElement")
    },
    computed : {
        totalLng () {
            return this.listElements.length;
        }
    },
    methods : {
        handleButtonClick () {
            this.$emit("handleButtonClick");
        }
    },
    props : ["listElements", "stale"],
    watch : {
        listElements () {
            const lng = this.listElements.length;

            if (lng > 0) {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style>
.list-container {
    display: block;
    list-style: none;
    width: 100%;
}
</style>