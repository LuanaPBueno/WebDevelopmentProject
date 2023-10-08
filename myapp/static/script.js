document.addEventListener("DOMContentLoaded", function() {
    
    const container = document.getElementById('materia-container');
    const rawData = document.getElementById('materias-data').textContent;
    const materiasData = JSON.parse(rawData);
    
    let materiaPositions = [];

    // Função para posicionar as matérias.
        function alocarColunaLinha() {
            materiasData.sort((a, b) => a.periodo - b.periodo || a.id - b.id);
            
            let periodoAtual = 1;
            let materiaAtual = -1;

            materiasData.forEach(materia => {
                const el = document.querySelector(`[data-id="${materia.id}"]`);
                
                if(materia.periodo > periodoAtual) {
                    periodoAtual = materia.periodo;
                    materiaAtual = 0;
                }
                else
                {
                    materiaAtual +=1;
                }

                let coluna = periodoAtual;
                let linha = materiaAtual;

                // Adicionar as informações na variável global
                materiaPositions.push({
                    materia: el,
                    coluna: coluna,
                    linha: linha
                });              
            });

        // Posicionando Horizontalmente
        let linhas = {};

        materiaPositions.forEach(pos => {
            if (!linhas[pos.linha]) linhas[pos.linha] = [];

            linhas[pos.linha].push(pos.materia);
        });

        Object.values(linhas).forEach((linha, idx) => {
            const linhaDiv = document.createElement('div');
            linhaDiv.className = 'linha';
            linhaDiv.style.display = 'flex';

            linha.forEach(materia => {
                linhaDiv.appendChild(materia);
            });

            container.appendChild(linhaDiv);
        });

        // Posicionando Verticalmente
        Array.from(container.children).forEach((linhaDiv, idx) => {
            linhaDiv.style.marginTop = `${idx * 50}px`;
        });

        }
    
        console.log(materiaPositions);
        
    // Função para criar divs invisíveis.
    function createInvisibleDiv(id, x, y) {
        const div = document.createElement('div');
        div.id = id;
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.opacity = '0';
        document.body.appendChild(div);
        return div;
    }

    // Função para criar setas de interdependência.
    function createArrows() {
        let uniqueID = 0;
        
        materiasData.forEach(materia => {
            materia.interdependencias.forEach(interdependenciaId => {
                const source = document.querySelector(`[data-id="${materia.id}"]`);
                const target = document.querySelector(`[data-id="${interdependenciaId}"]`);
                
                if (source && target) {
                    const sourceX = source.offsetLeft;
                    const sourceY = source.offsetTop + source.offsetHeight / 2;
    
                    const targetX = target.offsetLeft + target.offsetWidth;
                    const targetY = target.offsetTop + target.offsetHeight / 2;
                    
                    const toDiv = createInvisibleDiv(`from_${uniqueID}`, sourceX, sourceY);
                    const fromDiv = createInvisibleDiv(`to_${uniqueID}`, targetX, targetY);

                    const arrow = arrowCreate({
                        from: fromDiv,
                        to: toDiv,
                        head: {
                            func: HEAD.vee
                          }
                    });

                    document.body.appendChild(arrow.node);
                    uniqueID++;
                }
            });
        });
    }
    
    // Funções de inicialização.
    alocarColunaLinha();
    createArrows();
});
