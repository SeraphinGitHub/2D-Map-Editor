
<template>
   <section class="Flex app" id="root">

      <!-- /* ***** Tempory ***** */ -->
      <button class="center-btn">Center Grid</button>
      <!-- /* ***** Tempory ***** */ -->

      <Viewport class="sheet-VP" :canvasType="this.canvasSpec.sheet"/>
      <Viewport class="map-VP"   :canvasType="this.canvasSpec.map"  />
      
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
         const DOM = {
            sheetVP: document.querySelector(".sheet-VP"),
            mapVP:   document.querySelector(".map-VP"),

            centerBtn: document.querySelector(".center-btn"), // <== ***** Tempory *****
         };

         mapEditor.init(
            DOM,
            this.canvasSpec,
         );
      },

      data() {
      return {         
         canvasSpec: {
            sheet: {
               sprite: "sheet-sprite",
               select: "sheet-select",
               height: 800,
               width:  400,
               gridColor: "turquoise",
               hoverColor: "orangeRed",
            },

            map: {
               sprite: "map-sprite",
               select: "map-select",
               height: 800,
               width:  1200,
               gridColor: "turquoise",
               hoverColor: "yellow",
            },
         },
      }},
      
   }
</script>

<style>
   
   /* ***** Tempory ***** */
   .app {
      justify-content: space-around !important;
   }
   .center-btn {
      position: absolute;
      top: 7px;
      right: 25%;
      height: 50px;
      width: 200px;
      border: double 5px dimgray;
      border-radius: 15px;
      transform: translate(-50%);
      background: linear-gradient(to bottom, dodgerblue, white, dodgerblue);
   }
   .center-btn:active {
      top: 10px;
      right: 24.7%;
      background: linear-gradient(to bottom, darkviolet, white, darkviolet);
   }
   /* ***** Tempory ***** */



   html * {
      margin: 0;
      padding: 0;
      /* cursor: default; */
   }
   
   #root {
      position: fixed;
      height: 100%;
      width: 100%;
      background-color: rgb(40, 40, 40);

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
