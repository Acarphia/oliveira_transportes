 document.addEventListener("DOMContentLoaded", function () {
    // Evitar inicialização múltipla
    if (window.chatInitialized) return;
    window.chatInitialized = true;
    
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = "";
    let lastOptionSelected = "";
    let expectingTextInput = false;
    
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

    // Função para processar mensagens do usuário
    function processUserMessage(message) {
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

    // Função básica para enviar mensagem (corrigida)
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        
        displayMessage(message, "user-message");
        userInput.value = "";
        
        // Processa a mensagem do usuário
        processUserMessage(message);
        return false; // Impede comportamento padrão
    }

    // Corrigindo os eventos de envio
    if (sendButton) {
        // Remover qualquer listener anterior caso exista
        sendButton.removeEventListener('click', sendMessage);
        
        // Adicionar novo listener com garantia de funcionamento
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    // Corrigindo o evento de Enter
    if (userInput) {
        // Remover listener anterior caso exista
        userInput.removeEventListener('keypress', function(){});
        
        // Adicionar novo listener com garantia de funcionamento
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Timer para contagem de inatividade
    let inactivityTimer = null;
    
    // Inicia o contador de inatividade
    function startInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            resetSession();
            displayMessage("Escolha uma das opções abaixo para continuar:\n1 - Embarque\n2 - Rota\n3 - Desembarque\n4 - Pós-viagem\n5 - Canais de contato", "bot-message");
        }, 10000);
    }

    // Reseta a sessão
    function resetSession() {
        cpf = "";
        currentContext = "";
        lastOptionSelected = "";
        expectingTextInput = false;
        if (inactivityTimer) clearTimeout(inactivityTimer);
    }

    // Exibe a mensagem no chat
    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        startInactivityTimer(); // Reinicia o timer a cada mensagem
    }

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
                if (lastOptionSelected === "3" && currentContext === "embarque") {
                    lastOptionSelected = "";
                    resetContextAfterDelay();
                } else if (lastOptionSelected === "2" && currentContext === "desembarque") {
                    lastOptionSelected = "";
                    resetContextAfterDelay();
                }
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

    // Configurar evento de arquivo, se existir
    if (fileInput && attachButton) {
        attachButton.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                sendImage(fileInput.files[0]);
            }
        });
    }

    // Lida com a entrada de CPF
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
            displayMessage("CPF não encontrado.", "bot-message");
            cpf = "";
        }
    }

    // Menu principal
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

    // Exibe o menu de opções baseado no contexto
    function displayMenu(menuType) {
        const menus = {
            embarque: "Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Registro fotográfico\n4 - KM inicial",
            rota: "Escolha uma opção da Rota:\n1 - Melhor caminho\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Custos",
            desembarque: "Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Registro fotográfico\n3 - KM final",
            contato: "Escolha um canal:\n1 - Emergências 24h\n2 - Supervisor\n3 - Ouvidoria"
        };
        displayMessage(menus[menuType], "bot-message");
    }

    // Lida com as respostas do usuário conforme o contexto
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
    }

    // Lida com as respostas no contexto de Embarque
    function handleEmbarqueResponses(message, user) {
        if (lastOptionSelected === "3" && message !== "3") {
            displayMessage("Registro fotográfico recebido.", "bot-message");
            lastOptionSelected = "";
            resetContextAfterDelay();
            return;
        } else if (lastOptionSelected === "4" && message !== "4") {
            if (!isNaN(message) && message.trim() !== "") {
                displayMessage("KM inicial registrado: " + message, "bot-message");
                lastOptionSelected = "";
                resetContextAfterDelay();
                return;
            } else {
                displayMessage("Formato inválido. Digite apenas números para o KM.", "bot-message");
                return;
            }
        }

        lastOptionSelected = message;
        expectingTextInput = false;

        const responses = {
            "1": `Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel}`,
            "2": `Tipo de carga: ${user.tipoCarga}`,
            "3": "Envie a foto da carga.",
            "4": "Digite o KM inicial:"
        };

        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
            if (message === "4") {
                expectingTextInput = true;
            }
        } else {
            displayMessage("Opção inválida.", "bot-message");
        }
    }

    // Lida com as respostas no contexto de Rota
    function handleRotaResponses(message, user) {
        if (lastOptionSelected === "4" && message !== "4") {
            displayMessage("Observações registradas: " + message, "bot-message");
            lastOptionSelected = "";
            resetContextAfterDelay();
            return;
        } else if (lastOptionSelected === "5" && message !== "5") {
            if (!isNaN(message) && message.trim() !== "") {
                displayMessage("Custos registrados: R$ " + parseFloat(message).toFixed(2).replace('.', ','), "bot-message");
                lastOptionSelected = "";
                resetContextAfterDelay();
                return;
            } else {
                displayMessage("Formato inválido. Digite apenas números para os custos.", "bot-message");
                return;
            }
        }

        lastOptionSelected = message;
        expectingTextInput = false;

        const responses = {
            "1": "Baixe o aplicativo Waze, disponível para Android e IOS, ou acesse o link: https://www.waze.com/pt-BR/live-map/",
            "2": `Paradas: ${user.paradasProgramadas}`,
            "3": "Baixe o aplicativo Waze, disponível para Android e IOS, ou acesse o link: https://www.waze.com/pt-BR/live-map/",
            "4": "Digite suas observações:",
            "5": "Digite o valor dos custos:"
        };

        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
            if (message === "4" || message === "5") {
                expectingTextInput = true;
            }
        } else {
            displayMessage("Opção inválida.", "bot-message");
        }
    }

    // Lida com as respostas no contexto de Desembarque
    function handleDesembarqueResponses(message, user) {
        if (lastOptionSelected === "3" && message !== "3") {
            if (!isNaN(message) && message.trim() !== "") {
                displayMessage("KM final registrado: " + message, "bot-message");
                lastOptionSelected = "";
                resetContextAfterDelay();
                return;
            } else {
                displayMessage("Formato inválido. Digite apenas números para o KM.", "bot-message");
                return;
            }
        }

        lastOptionSelected = message;
        expectingTextInput = false;

        const responses = {
            "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
            "2": "Envie a foto da carga.",
            "3": "Digite o KM final:"
        };

        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
            if (message === "3") {
                expectingTextInput = true;
            }
        } else {
            displayMessage("Opção inválida.", "bot-message");
        }
    }

    // Lida com as respostas no contexto de Contato
    function handleContatoResponses(message) {
        const responses = {
            "1": "Ligue para a Emergência 24h:\n192\nSOS Estradas:\nhttps://postocidadedemarilia.com.br/telefone-de-emergencia-das-rodovias-guia/",
            "2": "Ligue para o supervisor Otávio: (34) 9 9894 2493.",
            "3": "Ouvidoria: ouvidoria@oliveiratransportes.com.br"
        };

        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
        } else {
            displayMessage("Opção inválida.", "bot-message");
        }
    }

    // Reseta o contexto após uma opção
    function resetContextAfterDelay() {
        setTimeout(function() {
            currentContext = "";
            lastOptionSelected = "";
            expectingTextInput = false;
        }, 2000);
    }
});
