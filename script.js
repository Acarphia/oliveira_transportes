//Use esse modelo
const usersData = {
    //CPF:
    "15347693665": {
        nome: "Luiza",
        tipoCarga: "Alimentos.",
        embarqueLocal: "Uberlândia.",
        embarqueResponsavel: "Eduarda.",
        desembarqueLocal: "Londrina.",
        desembarqueResponsavel: "Augusto.",
        paradasProgramadas: "Sem paradas."
    },
};

document.addEventListener("DOMContentLoaded", function () {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = "";
    let lastOptionSelected = "";
    let expectingTextInput = false;

    // Enviar mensagem
    function sendMessage(message) {
        if (message !== "") {
            displayMessage(message, "user-message");
            userInput.value = ""; // Limpa o campo de texto após o envio
        }
    }

    // Botão enviar
    sendButton.addEventListener('click', function() {
        const message = userInput.value.trim();
        sendMessage(message);
    });

    // Tecla Enter
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = userInput.value.trim();
            sendMessage(message);
        }
    });

    // Timer para contagem de inatividade
    let inactivityTimer = null;
    let countdownTimer = null;

    // Inicia o contador de inatividade
    function startInactivityTimer() {
        // Se houver um timer anterior, limpa
        if (inactivityTimer) clearTimeout(inactivityTimer);

        // Inicia o timer de inatividade
        inactivityTimer = setTimeout(function() {
            resetSession();
            displayMessage("Escolha uma das opções abaixo para continuar:\n1 - Embarque\n2 - Rota\n3 - Desembarque\n4 - Pós-viagem\n5 - Canais de contato", "bot-message");
        }, 30000); // 30 segundos de inatividade
    }

    // Exibe a mensagem inicial novamente
    setTimeout(function () {
        displayMessage("Olá! Sou o assistente virtual da Oliveira Transportes. Digite seu CPF, somente em números.", "bot-message");
    }, 2000); // Exibe após 2 segundos

    // Reseta a sessão
    function resetSession() {
        cpf = "";
        currentContext = "";
        lastOptionSelected = "";
        expectingTextInput = false;
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (countdownTimer) clearInterval(countdownTimer);
    }

    // Exibe a mensagem no chat
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

    // Botão de anexo
    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    // Envio de imagem
    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            if (!cpf) {
                displayMessage("Formato inválido. Por favor, digite seu CPF, somente números.", "bot-message");
                fileInput.value = "";
                return;
            }

            if (expectingTextInput) {
                displayMessage("Formato inválido. Por favor, digite a informação solicitada.", "bot-message");
                fileInput.value = "";
            } else {
                sendImage(fileInput.files[0]);
                fileInput.value = "";
            }
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

    // Processa a mensagem
    if (!cpf) {
        handleCPFInput(message);
        return;
    }

    if (!currentContext) {
        handleMainMenu(message.toLowerCase());
        return;
    }

    handleContextResponses(message);
});

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
            "1": "Ligue para a Emergência 24h: (34) 99999-9999.",
            "2": "Ligue para o supervisor: (34) 98888-8888.",
            "3": "Ouvidoria: ouvidoria@empresa.com.br"
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
            displayMessage("Escolha uma das opções abaixo para continuar:\n1 - Embarque\n2 - Rota\n3 - Desembarque\n4 - Pós-viagem\n5 - Canais de contato", "bot-message");
        }, 2000);
    }

    // Inicia o timer de inatividade
    startInactivityTimer();
});
