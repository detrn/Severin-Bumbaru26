// ===== BUTOANE & EVENTS =====

var button = document.getElementById("reportForm");
 button.onclick = onbutton;
 function onbutton() {
     if(onbutton()){
         button.style.backgroundColor = "green";
         button.disabled=true;
     }else{
         button.style.backgroundColor = "red";
         button.disabled=false;

     }
 }
