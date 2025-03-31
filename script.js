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

    // Botão de anexo
    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    // Envio de imagem - agora verifica se é permitido
    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
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
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

    // Botão enviar - CORREÇÃO PRINCIPAL AQUI
    sendButton.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message !== "" || fileInput.files.length > 0) {
            // Exibe a mensagem do usuário antes de processar
            if (message !== "") {
                displayMessage(message, "user-message");
                userInput.value = "";
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
        }
    });

    // Tecla Enter
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = userInput.value.trim();
            if (message !== "") {
                displayMessage(message, "user-message");
                userInput.value = "";
                
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
        }
    });
    
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
    }

    function handleEmbarqueResponses(message, user) {
        // Verifica se é uma resposta a uma solicitação anterior
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

        // Se não for resposta, trata como nova opção
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
            displayMessage("Opção inválida", "bot-message");
        }
    }

    function handleRotaResponses(message, user) {
        // Verifica se é uma resposta a uma solicitação anterior
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

        // Se não for resposta, trata como nova opção
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
            displayMessage("Opção inválida", "bot-message");
        }
    }

    function handleDesembarqueResponses(message, user) {
        // Verifica se é uma resposta a uma solicitação anterior
        if (lastOptionSelected === "2" && message !== "2") {
            displayMessage("Registro fotográfico recebido.", "bot-message");
            lastOptionSelected = "";
            resetContextAfterDelay();
            return;
        } else if (lastOptionSelected === "3" && message !== "3") {
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

        // Se não for resposta, trata como nova opção
        lastOptionSelected = message;
        expectingTextInput = false;
        
        const responses = {
            "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
            "2": "Envie a foto no desembarque.",
            "3": "Digite o KM final:"
        };
        
        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
            if (message === "3") {
                expectingTextInput = true;
            }
        } else {
            displayMessage("Opção inválida", "bot-message");
        }
    }

    function handleContatoResponses(message) {
        const responses = {
            "1": "Emergências 24h: 192\nSOS Estradas: 0800 055 5510",
            "2": "Supervisor: Otávio - (34) 99894-2493",
            "3": "Ouvidoria: ouvidoria@oliveiratransportes.com"
        };
        
        if (responses[message]) {
            displayMessage(responses[message], "bot-message");
            resetContextAfterDelay();
        } else {
            displayMessage("Opção inválida", "bot-message");
        }
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
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
