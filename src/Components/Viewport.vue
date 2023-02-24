
<template>
   <section :style="viewSize" :class='`Flex viewport`'>

      <canvas :class='`canvas-${this.grid.properties.name}-sprite`'/>
      <canvas :class='`canvas-${this.grid.properties.name}-select`'/>

   </section>
</template>


<script>

   export default {
      props: {
         grid: Object,
      },
      
      data() {
      return {

         viewSize: `
            height: ${this.grid.properties.height}px;
            width:  ${this.grid.properties.width}px;
         `,
      }},
   }
</script>


<style scoped>

   .viewport {
      position: relative;
      background-color: black;
      overflow: hidden;
   }

   .viewport canvas {
      position: absolute;
   }
</style>
