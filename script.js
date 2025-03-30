let cpf = "";
let chatBox = document.getElementById("chat-box");
let userInput = document.getElementById("user-input");
let fileInput = document.getElementById("file-input");
let attachButton = document.getElementById("attach-button");

// Vincula o botão de anexo ao input file
attachButton.addEventListener('click', function() {
    fileInput.click();
});

const usersData = {
    "15347693665": {
        nome: "Luiza",
        tipoCarga: "",
        embarqueLocal: "",
        embarqueResponsavel: "",
        desembarqueLocal: "",
        desembarqueResponsavel: "",
        registrodeCusto: ""
    },
    // Adicione outros CPFs e informações conforme necessário
};

function sendMessage() {
    const message = userInput.value.trim();
    if (message === "" && !fileInput.files.length) return;

    // Se houver mensagem de texto, mostra no chat
    if (message) {
        displayMessage(message, "user-message");
        userInput.value = "";
    }

    // Se houver foto, exibe apenas a imagem
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '200px';
                img.style.borderRadius = '8px';
                img.classList.add('user-message');
                chatBox.appendChild(img);
                chatBox.scrollTop = chatBox.scrollHeight;
            };
            reader.readAsDataURL(file);
        } else {
            displayMessage("Por favor, envie apenas imagens.", "bot-message");
        }
        fileInput.value = "";
    }

    // Se ainda não for solicitado CPF
    if (!cpf) {
        cpf = message;
        if (usersData[cpf]) {
            displayMessage(`Como posso ajudar hoje ${usersData[cpf].nome}? \n1 - Embarque da Carga\n2 - Rota da Viagem\n3 - Desembarque da Carga\n4 - Pós-Viagem\n5 - Fale Conosco`, "bot-message");
        } else {
            displayMessage("Seu CPF não foi encontrado, digite somente com números.", "bot-message");
        }
    } else {
        // Respostas para as opções depois do CPF
        if (message === "1") {
            displayMessage("Escolha uma opção relacionada ao Embarque da Carga:\n1 - Local e responsável pelo embarque\n2 - Tipo de carga\n3 - Registro fotográfico da carga no embarque\n4 - KM inicial registrado", "bot-message");
            if (message === "1") { // Local e responsável pelo embarque
                const { embarqueLocal, embarqueResponsavel } = usersData[cpf];
                displayMessage(`O seu local para embarque é ${embarqueLocal} e o responsável pelo embarque é ${embarqueResponsavel}.`, "bot-message");
            } else if (message === "2") { // Tipo de carga
                const { tipoCarga } = usersData[cpf];
                displayMessage(`O seu tipo de carga é ${tipoCarga}.`, "bot-message");
            } else if (message === "3") { // Registro fotográfico da carga no embarque
                displayMessage(`Envie a foto da carga.`, "bot-message");
            }
            } else if (message === "4") { // KM inicial registrado
                displayMessage(`Registre o KM inicial.`, "bot-message");
            }
        } else if (message === "2") {
                displayMessage("Escolha uma opção da Rota da Viagem:\n1 - Melhor caminho e condições\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações da carga\n5 - Registro de custos", "bot-message");
                if (message === "1") {
                    displayMessage("Melhor rota: BR-116 em boas condições, evitar trecho XYZ entre 18-20h. Condições atuais: tempo seco, pista livre.", "bot-message");
                } else if (message === "2") {
                    displayMessage("Paradas obrigatórias:\n- Posto ABC (km 125) - 30min descanso\n- Restaurante XYZ (km 250) - Almoço\n- Posto DEF (km 380) - Abastecimento", "bot-message");
                } else if (message === "3") {
                    displayMessage("Rota já pré-registrada no GPS corporativo. Inicie a navegação pelo dispositivo do caminhão.", "bot-message");
                } else if (message === "4") {
                    displayMessage("Registre observações sobre a carga (animal machucado, vazamento, etc.)", "bot-message");
                } else if (message === "5") {
                    displayMessage("Registre custos (abastecimento, manutenção, estadia, etc.)", "bot-message");
                }
         } else if (message === "3") {
            displayMessage("Escolha uma opção relacionada ao Desembarque da Carga:\n1 - Local e responsável pelo desembarque\n2 - Registro fotográfico da carga no desembarque\n3 - KM final registrado", "bot-message");
            if (message === "1") { // Local e responsável pelo desembarque
                const { desembarqueLocal, desembarqueResponsavel } = usersData[cpf];
                displayMessage(`O local de desembarque é ${desembarqueLocal} e o responsável pelo desembarque é ${desembarqueResponsavel}.`, "bot-message");
            } else if (message === "2") { // Registro fotográfico no desembarque
                displayMessage(`Envie a foto da carga.`, "bot-message");
            }
            } else if (message === "3") { // KM final registrado
                displayMessage(`Registre o KM final.`, "bot-message");
            }
        } else if (message === "4") {
            displayMessage("Procedimentos pós-viagem:\n1 - Conferir planilha\n2 - Validar com motorista\n3 - Ajustar divergências\n4 - Próximas instruções", "bot-message");
            if (message === "1") {
                displayMessage("Verifique na planilha:\n- Horários\n- Custos\n- Ocorrências\n- Estado da carga", "bot-message");
            } else if (message === "2") {
                displayMessage("Confirme com o motorista:\n- Rotas alternativas\n- Problemas encontrados\n- Observações", "bot-message");
            } else if (message === "3") {
                displayMessage("Registre qualquer divergência encontrada na conferência.", "bot-message");
            } else if (message === "4") {
                displayMessage("Próximos passos:\n- Retorno à base em 2 dias\n- Manutenção agendada\n- Próxima carga: [detalhes]", "bot-message");
            } 
        } else if (message === "5") {
            displayMessage("Escolha uma opção relacionada entre os canais de contato:\n1 - Emergências 24h\n2 - Supervisor de rota\n3 - RH Motoristas\n4 - Ouvidoria", "bot-message");
            if (message === "1") {
                displayMessage("Emergências: 192 \nSOS Estradas:\n0800 055 5510 para o DER-SP\n0800 773 6699 para a CCR RodoAnel\n0800 77 01 101 para a EcoRodovias\n0800 000 0290 para a CCR ViaSul\n0800 055 9696 para o Sistema de Ajuda ao Usuário (SAU) das Renovias", "bot-message");
            } else if (message === "2") {
                displayMessage("Supervisor João - (XX) 98888-8888\nPlantão das 6h às 22h", "bot-message");
            } else if (message === "3") {
                displayMessage("RH Motoristas:\nrh.motoristas@empresa.com\n(XX) 3333-3333", "bot-message");
            } else if (message === "4") {
                displayMessage("Ouvidoria:\nouvidoria@empresa.com\n0800-XXX-XXXX", "bot-message");
            }
        }
    }
// Função para exibir a mensagem
function displayMessage(message, className) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;  // Scroll até a última mensagem
}
