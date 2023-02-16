
<template>
   <section :style="style" class="Flex viewport">

      <canvas :class='`canvas-${this.canvasType.sprite}`'/>
      <canvas :class='`canvas-${this.canvasType.select}`'/>

   </section>
</template>

<script>
   export default {
      props: {
         canvasType: Object,
      },
      
      data() {
      return {
         style: `
            height: ${this.canvasType.height}px;
            width:  ${this.canvasType.width}px;
         `,
      }},
   }
</script>


<style scoped>

   .viewport {
      position: relative;
      background-color: black;
      /* overflow-y: scroll; */
   }

   .viewport canvas {
      position: absolute;
      height: 100%;
      width: 100%;
   }
</style>
