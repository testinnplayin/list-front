<template>
    <li v-if="el && el.name" class="list-el">
        <span>{{ind}}</span> <span>Name:</span> {{el.name}} <span>Prop1:</span> {{el.prop1}} <span>Prop2:</span> {{el.prop2}} <span>Prop3:</span>{{el.prop3}} <span>Prop4:</span> {{el.prop4}}
        <br>
        <span>{{el.createdAt}}</span>
    </li>
    <li v-else>Loading....</li>
</template>

<script>
export default {
    name : "ListElement",
    created () {
        // TODO: uncomment when ready
        const totalLng = this.totalLng;
        const key = this.ind;
        if (key === totalLng - 1 && !this.stale) {
            console.log("last Element timestamp", new Date());
        } 
    },
    props : ["el", "ind", "stale", "totalLng"]
}
</script>

<style>
.list-el {
    border: 0.5px solid #ccc;
    padding: 20px;
    margin: 15px 5px;
    width: 80%;
}

.list-el span {
    font-weight: bold;
}
</style>