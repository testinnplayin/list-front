<template>
    <li>
        {{el.name}}  {{el.prop1}} {{el.prop2}} {{el.prop3}} {{el.prop4}}
    </li>
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