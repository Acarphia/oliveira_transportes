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
            displayMessage("Escolha uma opção relacionada ao Embarque da Carga:\na - Local e responsável pelo embarque\nb - Tipo de carga\nc - Registro fotográfico da carga no embarque\nd - KM inicial registrado", "bot-message");
            if (message === "a") { // Local e responsável pelo embarque
                const { embarqueLocal, embarqueResponsavel } = usersData[cpf];
                displayMessage(`O seu local para embarque é ${embarqueLocal} e o responsável pelo embarque é ${embarqueResponsavel}.`, "bot-message");
            } else if (message === "b") { // Tipo de carga
                const { tipoCarga } = usersData[cpf];
                displayMessage(`O seu tipo de carga é ${tipoCarga}.`, "bot-message");
            } else if (message === "c") { // Registro fotográfico da carga no embarque
                displayMessage(`Envie a foto da carga.`, "bot-message");
            } else if (message === "d") { // KM inicial registrado
                displayMessage(`Registre o KM inicial.`, "bot-message");
            }
        } else if (message === "2") {
                displayMessage("Escolha uma opção da Rota da Viagem:\na - Melhor caminho e condições\nb - Paradas programadas\nc - Viagem no GPS\nd - Observações da carga\ne - Registro de custos", "bot-message");
                if (message === "a") {
                    displayMessage("Melhor caminho e condições: ");
                } else if (message === "b") {
                    displayMessage("Paradas programadas: ", "bot-message");
                } else if (message === "c") {
                    displayMessage("Viagem no GPS: ", "bot-message");
                } else if (message === "d") {
                    displayMessage("Registre observações sobre a carga (animal machucado, vazamento, etc.)", "bot-message");
                } else if (message === "e") {
                    displayMessage("Registre custos (abastecimento, manutenção, estadia, etc.)", "bot-message");
                }
         } else if (message === "3") {
            displayMessage("Escolha uma opção relacionada ao Desembarque da Carga:\na - Local e responsável pelo desembarque\nb - Registro fotográfico da carga no desembarque\nc - KM final registrado", "bot-message");
            if (message === "a") { // Local e responsável pelo desembarque
                const { desembarqueLocal, desembarqueResponsavel } = usersData[cpf];
                displayMessage(`O local de desembarque é ${desembarqueLocal} e o responsável pelo desembarque é ${desembarqueResponsavel}.`, "bot-message");
            } else if (message === "b") { // Registro fotográfico no desembarque
                displayMessage(`Envie a foto da carga.`, "bot-message");
            } else if (message === "c") { // KM final registrado
                displayMessage(`Registre o KM final.`, "bot-message");
            }
        } else if (message === "4") {
            displayMessage("Para procedimentos pós-viagem favor mandar mensagem para o Otávio, (34) 99894-2493"); 
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
