// Você pode escolher e importar as funções do arquivo de acordo com o que vai usar
// Se você colocar os arquivos dentro de outra pasta, não esqueça de adicionar outro "../" aqui
import { getCourse } from "../../services/firebase/firebase.js";

// Esse "DOMContentLoaded" é um evento que acontece depois que o html carrega todos as tags (não é depois que os dados são carregados do banco de dados)
// Não esqueça de adicionar o "async" na função, isso serve pra mostrar que os dados vão ser carregados e não vão ser retornados imediatamente (também podem ocorrer erros, como falhas de conexão)
document.addEventListener("DOMContentLoaded", async function () {
    // Todas as funções do banco de dados retornam um objeto com atributos que variam de acordo com a função
    // Antes de chamar qualquer função do banco de dados, você precisa adicionar o "await", que significa que os dados vão ser atribuídos à variável assim que forem carregados.
    // O resto do código só continua depois que isso acontecer, mas outras funções podem acontecer juntas com essa assincrona.
    const course = await getCourse("Ciência da Computação");

    const p = document.getElementById("complementary hours"); // Referência à tag pela id
    p.textContent = course.name; // Modificação do conteúdo
});
