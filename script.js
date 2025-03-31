const usersData = {
    "15347693665": {
        "nome": "Luiza",
        "tipoCarga": "Alimentos.",
        "embarqueLocal": "Uberlândia.",
        "embarqueResponsavel": "Eduarda.",
        "desembarqueLocal": "Londrina.",
        "desembarqueResponsavel": "Augusto.",
        "paradasProgramadas": "Sem paradas."
    }
};

document.addEventListener("DOMContentLoaded", function() {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let currentContext = "";
    let lastOptionSelected = "";

    // Função principal
    function processUserMessage(message) {
        if (!cpf) {
            cpf = message;
            if (usersData[cpf]) {
                displayMessage(`Como posso ajudar ${usersData[cpf].nome}?\n1 - Embarque\n2 - Rota\n3 - Desembarque\n4 - Pós-viagem\n5 - Canais de contato`, "bot-message");
            } else {
                displayMessage("CPF não encontrado. Digite novamente:", "bot-message");
                cpf = "";
            }
            return;
        }

        if (!currentContext) {
            handleMainMenu(message);
            return;
        }

        handleContextResponses(message);
    }

    // Envio de mensagem
    document.getElementById("send-button").addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message) {
            displayMessage(message, "user-message");
            userInput.value = "";
            processUserMessage(message);
        }
    });

    // Exibição de mensagens
    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "message " + className;
        messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Menus principais
    function handleMainMenu(option) {
        const menus = {
            "1": ["embarque", "Escolha do Embarque:\n1 - Local/Responsável\n2 - Tipo de carga\n3 - Foto\n4 - KM inicial"],
            "2": ["rota", "Escolha da Rota:\n1 - Melhor caminho\n2 - Paradas\n3 - GPS\n4 - Observações\n5 - Custos"],
            "3": ["desembarque", "Escolha do Desembarque:\n1 - Local/Responsável\n2 - Foto\n3 - KM final"],
            "4": ["", "Para pós-viagem, contate Otávio: (34) 99894-2493"],
            "5": ["contato", "Canais de Contato:\n1 - Emergências\n2 - Supervisor\n3 - Ouvidoria"]
        };

        if (menus[option]) {
            currentContext = menus[option][0];
            displayMessage(menus[option][1], "bot-message");
        } else {
            displayMessage("Opção inválida. Digite de 1 a 5.", "bot-message");
        }
    }

    // Respostas contextuais
    function handleContextResponses(option) {
        const user = usersData[cpf];
        const responses = {
            "embarque": {
                "1": `Local: ${user.embarqueLocal}<br>Responsável: ${user.embarqueResponsavel}`,
                "2": `Tipo de carga: ${user.tipoCarga}`,
                "3": "Envie a foto da carga.",
                "4": "Digite o KM inicial:"
            },
            "rota": {
                "1": "Baixe o Waze: <a href='https://www.waze.com' target='_blank'>https://www.waze.com</a>",
                "2": `Paradas: ${user.paradasProgramadas}`,
                "3": "Acompanhe no GPS do Waze",
                "4": "Digite suas observações:",
                "5": "Digite os custos:"
            },
            "desembarque": {
                "1": `Local: ${user.desembarqueLocal}<br>Responsável: ${user.desembarqueResponsavel}`,
                "2": "Envie a foto da carga.",
                "3": "Digite o KM final:"
            },
            "contato": {
                "1": "Emergências 24h:\n192\nSOS Estradas:\n0800 055 5510 (DER-SP)\n0800 773 6699 (CCR RodoAnel)",
                "2": "Supervisor Otávio: (34) 9 9894-2493",
                "3": "Ouvidoria: ouvidoria@empresa.com.br"
            }
        };

        if (responses[currentContext] && responses[currentContext][option]) {
            displayMessage(responses[currentContext][option], "bot-message");
        } else {
            displayMessage("Opção inválida.", "bot-message");
        }
    }
});
