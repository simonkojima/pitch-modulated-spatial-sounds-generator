<template>
    <div class="c_background">
        <h1 class="c_generatingText">Generating...</h1>
    </div>
</template>

<script>
    export default{
        name: "GeneratingScreen"
    }
</script>

<style scoped>
.c_background{
    position:fixed;
    padding:0;
    margin:0;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    background:rgba(203, 203, 203, 0.5);
}

.c_generatingText{
    font-size: 50px;
    left: 40%;
    top: 40%;
    position: absolute;
    text-align: center;
}

</style>
