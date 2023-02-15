
<template>
   <section class="Flex" id="root">

      <Viewport :viewSize="this.viewSize"/>
      
   </section>
</template>

<script>
   // Components 
   import Viewport from "./Components/Viewport.vue"

   // Scripts
   import mapEditor from "./Scripts/_MapEditorHandler.ts"

   export default {
      mixins: [
         mapEditor,
      ],

      components: {
         Viewport,
      },

      mounted() {
         mapEditor.init(
            document,
            this.mapSize,
            this.viewSize,
         );
      },

      data() {
      return {
         mapSize: {
            height: 900,
            width: 1300,
         },
         
         viewSize: {
            height: 900,
            width: 1300,
         }
      }}
   }
</script>

<style>
   html * {
      margin: 0;
      padding: 0;
      /* cursor: default; */
   }
   
   #root {
      position: fixed;
      height: 100%;
      width: 100%;
      background-color: dimgray;
   }
   
   .Flex {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-content: center;
      width: 100%;
   }

   p,
   input,
   button {
      font-family: "Verdana";
      font-size: 22px;
   }
   input,
   button {
      border: none;
      background: none;
   }

   p {
      text-align: center;
   }
</style>
