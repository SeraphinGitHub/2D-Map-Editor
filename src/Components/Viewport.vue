
<template>
   <section class="Flex viewport" :style="style">

      <canvas class="canvas-map"/>
      <canvas class="canvas-select"/>

   </section>
</template>

<script>
   export default {
      props: {
         size: Object,
      },
      
      data() {
      return {
         style: `
            height: ${this.size.height}px;
            width:  ${this.size.width}px;
         `,
      }},
   }
</script>


<style scoped>

   .viewport {
      position: relative;
      background-color: black;
   }

   .viewport canvas {
      position: absolute;
      height: 100%;
      width: 100%;
   }

</style>
