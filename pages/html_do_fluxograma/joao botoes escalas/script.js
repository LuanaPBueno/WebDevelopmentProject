const colors = ['blue', 'white']

// // // // // // // // // // // // //
const btn1 = document.getElementById('btn1');

var index1 = 0;

btn1.style.backgroundColor = ('white'); // Definindo a cor de fundo inicial

btn1.addEventListener('click', function onClick() {
  if(index2 != 1 && index3 != 1) {
  btn1.style.backgroundColor = colors[index1];
  index1 = index1 >= colors.length - 1 ? 0 : index1 + 1;
  }
});

// // // // // // // // // // // // //
const btn2 = document.getElementById('btn2');

var index2 = 0;

btn2.style.backgroundColor = ('white'); // Definindo a cor de fundo inicial

btn2.addEventListener('click', function onClick() {
  if(index1 != 1 && index3 != 1) {
  btn2.style.backgroundColor = colors[index2];
  index2 = index2 >= colors.length - 1 ? 0 : index2 + 1;
  }
});

// // // // // // // // // // // // //
const btn3 = document.getElementById('btn3');

var index3 = 0;

btn3.style.backgroundColor = ('white'); // Definindo a cor de fundo inicial

btn3.addEventListener('click', function onClick() {
  if(index1 != 1 && index2 != 1) {
    btn3.style.backgroundColor = colors[index3];
    index3 = index3 >= colors.length - 1 ? 0 : index3 + 1;
  }
});
