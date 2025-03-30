let cpf = "";
let chatBox = document.getElementById("chat-box");
let userInput = document.getElementById("user-input");

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
    if (message === "") return;

    // Mostrar mensagem do usuário
    displayMessage(message, "user-message");

    // Limpar campo de input
    userInput.value = "";

    // Se ainda não for solicitado CPF
    if (!cpf) {
        cpf = message;
        if (usersData[cpf]) {
            displaymessage(`Que bom ver você ${usersData[cpf].nome}, como posso ajudar hoje?\n1 - Embarque da Carga\n2 - Rota da Viagem\n3 - Desembarque da Carga\n4 - Pós-Viagem\n5 - Fale Conosco", "bot-message");`, "bot-message");
        } else {
            displayMessage("CPF não encontrado. Tente novamente.", "bot-message");
        }
    } else {
        // Respostas para as opções depois do CPF
        if (message === "1") {
            displayMessage("Escolha uma opção relacionada ao embarque da carga:\n1 - Local e responsável pelo embarque\n2 - Tipo de carga\n3 - Registro fotográfico da carga\n4 - KM inicial registrado", "bot-message");
        } else if (message === "2") {
            displayMessage("Escolha uma opção relacionada à rota da viagem:\n1 - Melhor caminho e condições das estradas\n2 - Paradas para descanso, alimentação e abastecimento\n3 - Viagem pré-registrada no GPS\n4 - Observações sobre a carga\n5 - Registro de custos", "bot-message");
        } else if (message === "3") {
            displayMessage("Escolha uma opção relacionada ao desembarque da carga:\n1 - Local e responsável pelo desembarque\n2 - Registro fotográfico no desembarque\n3 - KM final registrado", "bot-message");
        } else if (message === "4") {
            displayMessage("Para questões pós-viagem, mande mensagem para +55 34 9894-2493.", "bot-message");
        } else if (message === "5") {
            displayMessage("Por favor, envie sua dúvida ou solicitação. Nossa equipe entrará em contato o mais breve possível.", "bot-message");
        } else {
            displayMessage("Opção inválida. Por favor, digite um número de 1 a 5.", "bot-message");
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
