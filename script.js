document.addEventListener("DOMContentLoaded", function () {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = "";

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

    // Função para enviar imagem (CORRIGIDA)
    function sendImage(file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'user-message');
            
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');
            
            const img = document.createElement('img');
            img.src = reader.result;
            img.classList.add('image-message');
            
            imgContainer.appendChild(img);
            messageDiv.appendChild(imgContainer);
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
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

    // Função principal para enviar mensagem
    function sendMessage() {
        const message = userInput.value.trim().toLowerCase();
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
            handleMainMenu(message);
            return;
        }

        handleContextResponses(message);
    }

    // Função para lidar com o CPF
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

    // Função para o menu principal
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

    // Função para exibir menus
    function displayMenu(menuType) {
        const menus = {
            embarque: "Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Registro fotográfico\n4 - KM inicial",
            rota: "Escolha uma opção da Rota:\n1 - Melhor caminho\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Custos",
            desembarque: "Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Registro fotográfico\n3 - KM final",
            contato: "Escolha um canal:\n1 - Emergências 24h\n2 - Supervisor\n3 - Ouvidoria"
        };
        displayMessage(menus[menuType], "bot-message");
    }

    // Função para respostas contextuais
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
        
        resetContextAfterDelay();
    }

    // Funções de tratamento para cada contexto
    function handleEmbarqueResponses(message, user) {
        const responses = {
            "1": `Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel}`,
            "2": `Tipo de carga: ${user.tipoCarga}`,
            "3": "Envie a foto da carga.",
            "4": "Registre o KM inicial."
        };
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function handleRotaResponses(message, user) {
        const responses = {
            "1": "Melhor caminho: Consulte o GPS.",
            "2": `Paradas: ${user.paradasProgramadas}`,
            "3": "Acompanhe pelo GPS.",
            "4": "Registre observações.",
            "5": "Registre os custos."
        };
        displayMessage(responses[message] || "Opção inválida", "bot-message");
    }

    function handleDesembarqueResponses(message, user) {
        const responses = {
            "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
            "2": "Envie a foto no desembarque.",
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

    // Resetar contexto após 10 segundos
    function resetContextAfterDelay() {
        setTimeout(() => {
            currentContext = "";
            displayMessage(`Escolha outra categoria:
1 - Embarque
2 - Rota
3 - Desembarque
4 - Pós-viagem
5 - Canais`, "bot-message");
        }, 10000);
    }

    // Função para exibir mensagens (CORRIGIDA)
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
