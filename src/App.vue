
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
         </div>


         <!-- <div class="flexCenter add-file-container">
            <img class="imagePreview">

            <input type="file" name="image" id="file" accept="image/*" @change="preview()" ref="addFile">
            <button class="image-btn" @click="$refs.addFile.click()" type="button">Ajouter une image</button>
            <button class="publish-btn" @click.prevent="postArticle()" type="submit">Publier</button>
         </div>

         <label for="slider">Slider:</label>
         <input type="range" id="slider" name="slider" min="0" max="100" value="50" step="10">


         <label for="slider">Slider:</label>
         <input type="range" id="slider" name="slider" min="10" max="50" value="25" step="10"> -->



         <select class="Flex select" name="images-select" id="1">
            <option value="file-1">Tile_0.png</option>
            <option value="file-2">Tile_1.png</option>
            <option value="file-3">Tile_2.png</option>
            <option value="file-4">Items_0.png</option>
            <option value="file-5">Items_1.png</option>
         </select>
         
         <Viewport class="sheet-VP" :grid="this.sheet"/>
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
         
         <Viewport class="map-VP"   :grid="this.map"  />
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
            this.sheet,
            this.map,
         );
      },

      data() {
      return {
         file: null,

         sheet: {
            properties: {
               name:        "sheet",
               height:      300,
               width:       500,
               hoverColor:  "red",
               isAssignable: true,
            },

            settings: {
               source:      "./tiles_0.png",
               textureSize: 200,
               spriteSize:  60,
            },
         },

         map: {
            properties: {
               name:        "map",
               height:      800,
               width:       1400,
               hoverColor:  "yellow",
               isAssignable: false,
            },
            
            settings: {
               cellSize:    100,
               worldWidth:  4000,
               worldHeight: 3000,
            },
         },
      }},

      methods: {            
         // preview() {
         //    const file = document.getElementById("file").files;

         //    if(file.length > 0) {
         //       const fileReader = new FileReader();
               
         //       fileReader.onload = (event) => {
         //          const imagePreview = document.querySelector(".imagePreview");
         //          imagePreview.setAttribute("src", event.target.result);
         //       }

         //       fileReader.readAsDataURL(file[0]);
         //    } this.file = this.$refs.addFile.files[0];
         // },


         // postArticle() {
            
         //    console.log(this.file); // ******************************************************
         // },
      }
      
   }
</script>

<style>
   
   /* ***** Tempory ***** */
   .add-file-container input[type=file] {
      display: none;
   }
   .image-btn {
      background-color: blue;
   }
   .publish-btn {
      background-color: red;
   }
   .imagePreview {
      margin: auto;
      margin-top: 5px;
      object-fit: cover;
      width: 50%;
      max-height: 120px;
      max-width: 150px;
   }


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
      width: 500px !important;
   }
   .favorites {
      height: 200px;
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
