const button = document.querySelector("button")
const modal = document.querySelector("dialog")
const buttonClose = document.querySelector("dialog  button")


button.addEventListener("click", function(){ 
  modal.showModal();
});

buttonClose.addEventListener("click", function(){
  modal.close();
});


