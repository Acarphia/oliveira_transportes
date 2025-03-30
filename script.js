let cpf = "";
let chatBox = document.getElementById("chat-box");
let userInput = document.getElementById("user-input");
let fileInput = document.getElementById("file-input");

const usersData = {
    "15347693665": {
        nome: "Luiza",
        tipoCarga: "",
        observacoesCarga: "",
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

    // Mostrar mensagem do usuário
    displayMessage(message, "user-message");

    // Limpar campo de input
    userInput.value = "";

    // Se houver foto, exibe
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            const img = document.createElement('img');
            img.src = reader.result;
            img.style.width = '200px'; // Limitar o tamanho da imagem
            chatBox.appendChild(img);
            chatBox.scrollTop = chatBox.scrollHeight;
        };
        reader.readAsDataURL(file);
        fileInput.value = ""; // Limpar o campo de arquivo após o envio
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
            displayMessage("Escolha uma opção relacionada ao embarque da carga:\n1 - Local e responsável pelo embarque\n2 - Tipo de carga\n3 - Observações sobre a carga\n4 - Registro fotográfico da carga no embarque\n5 - KM inicial registrado", "bot-message");
            if (message === "1") { // Local e responsável pelo embarque
                const { embarqueLocal, embarqueResponsavel } = usersData[cpf];
                displayMessage(`O seu local para embarque é ${embarqueLocal} e o responsável pelo embarque é ${embarqueResponsavel}.`, "bot-message");
            } else if (message === "2") { // Tipo de carga
                const { tipoCarga } = usersData[cpf];
                displayMessage(`O seu tipo de carga é ${tipoCarga}.`, "bot-message");
            } else if (message === "3") { // Observações sobre a carga
                const { observacoesCarga } = usersData[cpf];
                displayMessage(`As observações sobre a carga são: ${observacoesCarga}.`, "bot-message");
            } else if (message === "4") { // Registro fotográfico da carga no embarque
                displayMessage(`Mande a foto da carga.`, "bot-message");
            }
        } else if (message === "3") {
            displayMessage("Escolha uma opção relacionada ao desembarque da carga:\n1 - Local e responsável pelo desembarque\n2 - Registro fotográfico da carga no desembarque\n3 - KM final registrado", "bot-message");
            if (message === "1") { // Local e responsável pelo desembarque
                const { desembarqueLocal, desembarqueResponsavel } = usersData[cpf];
                displayMessage(`O local de desembarque é ${desembarqueLocal} e o responsável pelo desembarque é ${desembarqueResponsavel}.`, "bot-message");
            } else if (message === "2") { // Registro fotográfico no desembarque
                displayMessage(`Mande a foto da carga.`, "bot-message");
            }
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
