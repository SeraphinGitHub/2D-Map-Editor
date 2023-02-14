
export const scrollCam = () => {

   // viewport.x = updatePlayer.x -viewport.width/2;
   // viewport.y = updatePlayer.y -viewport.height/2;
   
   // // Viewport bounderies
   // let vpLeftCol   = Math.floor(viewport.x /CellSize);
   // let vpRightCol  = Math.ceil((viewport.x +viewport.width) /CellSize);
   // let vpTopRow    = Math.floor(viewport.y /CellSize);
   // let vpBottomRow = Math.ceil((viewport.y +viewport.height) /CellSize);

   // // Map bounderies ==> no repeat
   // if(vpLeftCol < 0) vpLeftCol = 0;
   // if(vpTopRow  < 0) vpTopRow  = 0;
   // if(vpRightCol  > columns) vpRightCol   = columns;
   // if(vpBottomRow > rows)    vpBottomRow = rows;
   
   // // ================ DEBUG ================
   // // ctx.player.strokeStyle = "red";
   // // ctx.player.strokeRect(0, 0, viewport.width, viewport.height);
   // // ================ DEBUG ================

   // for(let x = vpLeftCol; x < vpRightCol; x++) {
   //    for(let y = vpTopRow; y < vpBottomRow; y++) {
         
   //       refreshMap();
   //    }
   // }
}