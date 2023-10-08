document.addEventListener("DOMContentLoaded", function() {
    // Obtenha uma referência ao botão e ao elemento de texto
    const button = document.getElementById("myButton");
    const displayText = document.getElementById("displayText");

    // Adicione um ouvinte de evento para o clique no botão
    button.addEventListener("click", function() {
        // Altere o texto do elemento
        displayText.textContent = "Texto alterado!";
    });
});
