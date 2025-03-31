document.addEventListener("DOMContentLoaded", function () {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = "";
    let lastOptionSelected = "";

    // Botão de anexo
    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    // Envio de imagem
    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            sendImage(fileInput.files[0]);
            fileInput.value = "";
        }
    });

    function sendImage(file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'user-message');
            
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');
            
            const img = document.createElement('img');
            img.src = reader.result;
            
            imgContainer.appendChild(img);
            messageDiv.appendChild(imgContainer);
            chatBox.appendChild(messageDiv);
            
            chatBox.scrollTop = chatBox.scrollHeight;
            
            setTimeout(() => {
                displayMessage("Foto enviada.", "bot-message");
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

    // Botão enviar
    sendButton.addEventListener('click', function() {
        sendMessage();
    });

    // Tecla Enter
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Dados dos usuários
    const usersData = {
        "15347693665": {
            nome: "Luiza",
            tipoCarga: "Alimentos.",
            embarqueLocal: "Uberlandia.",
            embarqueResponsavel: "Eduarda.",
            desembarqueLocal: "Londrina.",
            desembarqueResponsavel: "Augusto.",
            paradasProgramadas: "Sem paradas."
        },
    };

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "" && !fileInput.files.length) return;

        // Exibe a mensagem do usuário
        displayMessage(message, "user-message");
        userInput.value = "";

        // Lógica do chatbot
        if (!cpf) {
            handleCPFInput(message);
            return;
        }

        if (!currentContext) {
            handleMainMenu(message.toLowerCase());
            return;
        }

        handleContextResponses(message);
    }

    function handleCPFInput(message) {
        cpf = message;
        if (usersData[cpf]) {
            displayMessage(`Como posso ajudar ${usersData[cpf].nome}?
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
        } else {
            displayMessage("CPF não encontrado. Digite novamente.", "bot-message");
            cpf = "";
        }
    }

    function handleMainMenu(message) {
        switch(message) {
            case "1":
                currentContext = "embarque";
                displayMenu("embarque");
                break;
            case "2":
                currentContext = "rota";
                displayMenu("rota");
                break;
            case "3":
                currentContext = "desembarque";
                displayMenu("desembarque");
                break;
            case "4":
                displayMessage("Para pós-viagem, contate Otávio: (34) 99894-2493", "bot-message");
                break;
            case "5":
                currentContext = "contato";
                displayMenu("contato");
                break;
            default:
                displayMessage("Opção inválida. Escolha de 1 a 5.", "bot-message");
        }
    }

    function displayMenu(menuType) {
        const menus = {
            embarque: "Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Registro fotográfico\n4 - KM inicial",
            rota: "Escolha uma opção da Rota:\n1 - Melhor caminho\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Custos",
            desembarque: "Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Registro fotográfico\n3 - KM final",
            contato: "Escolha um canal:\n1 - Emergências 24h\n2 - Supervisor\n3 - Ouvidoria"
        };
        displayMessage(menus[menuType], "bot-message");
    }

    function handleContextResponses(message) {
        const user = usersData[cpf];
        
        if (currentContext === "embarque") {
            handleEmbarqueResponses(message, user);
        } else if (currentContext === "rota") {
            handleRotaResponses(message, user);
        } else if (currentContext === "desembarque") {
            handleDesembarqueResponses(message, user);
        } else if (currentContext === "contato") {
            handleContatoResponses(message);
        }
        
        // Verifica se é uma resposta a um registro solicitado
        if (lastOptionSelected === "3" && currentContext === "embarque" && message !== "3") {
            displayMessage("Registro fotográfico recebido.", "bot-message");
            lastOptionSelected = "";
        } else if (lastOptionSelected === "4" && currentContext === "embarque" && message !== "4") {
            displayMessage("KM inicial registrado: " + message, "bot-message");
            lastOptionSelected = "";
        } else if (lastOptionSelected === "4" && currentContext === "rota" && message !== "4") {
            displayMessage("Observações registradas: " + message, "bot-message");
            lastOptionSelected = "";
        } else if (lastOptionSelected === "2" && currentContext === "desembarque" && message !== "2") {
            displayMessage("Registro fotográfico recebido.", "bot-message");
            lastOptionSelected = "";
        } else if (lastOptionSelected === "3" && currentContext === "desembarque" && message !== "3") {
            displayMessage("KM final registrado: " + message, "bot-message");
            lastOptionSelected = "";
        }
        
        resetContextAfterDelay();
    }

    function handleEmbarqueResponses(message, user) {
        lastOptionSelected = message;
        const responses = {
            "1": `Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel}`,
            "2": `Tipo de carga: ${user.tipoCarga}`,
            "3": "Envie a foto da carga no embarque.",
            "4": "Registre o KM inicial."
        };
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function handleRotaResponses(message, user) {
        lastOptionSelected = message;
        const responses = {
            "1": "Baixe o aplicativo Waze, disponível para Android e IOS, ou acesse o link: https://www.waze.com/pt-BR/live-map/",
            "2": `Paradas: ${user.paradasProgramadas}`,
            "3": "Baixe o aplicativo Waze, disponível para Android e IOS, ou acesse o link: https://www.waze.com/pt-BR/live-map/",
            "4": "Registre observações.",
            "5": "Registre os custos."
        };
        
        // Se a última opção foi 5 (custos) e a mensagem atual é um número
        if (lastOptionSelected === "5" && !isNaN(message) && message.trim() !== "") {
            displayMessage("Custos registrados: R$ " + parseFloat(message).toFixed(2).replace('.', ','), "bot-message");
            lastOptionSelected = "";
            return;
        }
        
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function handleDesembarqueResponses(message, user) {
        lastOptionSelected = message;
        const responses = {
            "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
            "2": "Envie a foto da carga no desembarque.",
            "3": "Registre o KM final."
        };
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function handleContatoResponses(message) {
        const responses = {
            "1": "Emergências 24h: 192\nSOS Estradas: 0800 055 5510",
            "2": "Supervisor: Otávio - (34) 99894-2493",
            "3": "Ouvidoria: ouvidoria@oliveiratransportes.com"
        };
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function resetContextAfterDelay() {
        setTimeout(() => {
            if (currentContext && !lastOptionSelected) {
                currentContext = "";
                displayMessage(`Escolha outra categoria:
1 - Embarque
2 - Rota
3 - Desembarque
4 - Pós-viagem
5 - Canais`, "bot-message");
            }
        }, 10000);
    }

    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        
        if (typeof content === 'string') {
            messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        } else if (content instanceof HTMLElement) {
            messageDiv.appendChild(content);
        }
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
