
<template>
   <section class="Flex app" id="root">

      <section class="Flex params">
         <div class="Flex favorites">
            <button/>
            <button/>
            <button/>
            <button/>

            <button/>
            <button/>
            <button/>
            <button/>

            <button/>
            <button/>
            <button/>
            <button/>
         </div>

         <select class="Flex select" name="images-select" id="1">
            <option value="file-1">Tile_0.png</option>
            <option value="file-2">Tile_1.png</option>
            <option value="file-3">Tile_2.png</option>
            <option value="file-4">Items_0.png</option>
            <option value="file-5">Items_1.png</option>
         </select>
         
         <Viewport class="sheet-VP" :canvasType="this.canvasSpec.sheet"/>
      </section>

      <section class="Flex grid">
         <div class="Flex tools">
            <button/>
            <button/>
            <button/>

            <button/>
            <button/>
            <button/>
         </div>
         
         <Viewport class="map-VP"   :canvasType="this.canvasSpec.map"  />
      </section>
      
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
               height: 400,
               width:  400,
               hoverColor: "orangeRed",
            },

            map: {
               sprite: "map-sprite",
               select: "map-select",
               height: 800,
               width:  1400,
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
   .params,
   .grid {
      height: 900px;
      align-content: space-between !important;
   }
   .favorites button,
   .tools button {
      height: 80px;
      width: 80px;
      margin: 10px;
      background-color: black;
   }
   .favorites button:active,
   .tools button:active {
      background-color: red;
   }

   .params {
      width: 400px !important;
   }
   .favorites {
      height: 300px;
      justify-content: space-around !important;
      align-content: space-around !important;
      background-color: darkturquoise;
   }
   .select {
      height: 50px;
      font-size: 18px;
   }

   .grid {
      width: 1400px !important;
   }
   .tools {
      height: 90px;
      justify-content: space-around !important;
      background-color: darkviolet;
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
   select,
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
