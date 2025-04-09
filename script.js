document.addEventListener("DOMContentLoaded", function () {
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

    function enviarParaFormspree(url, data) {
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                displayMessage("✅ Informações enviadas com sucesso!", "bot-message");
            } else {
                displayMessage("❌ Erro no envio das informações.", "bot-message");
            }
        })
        .catch(error => {
            displayMessage("⚠️ Erro de rede no envio das informações.", "bot-message");
        });
    }

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

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        displayMessage(message, "user-message");
        userInput.value = "";
        processUserMessage(message);
        return false;
    }

    if (sendButton) {
        sendButton.removeEventListener('click', sendMessage);
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }

    if (userInput) {
        userInput.removeEventListener('keypress', function(){});
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function resetSession() {
        cpf = "";
        currentContext = "";
        lastOptionSelected = "";
        expectingTextInput = false;
    }

    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.innerHTML = content.replace(/\\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
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
                displayMessage("✅ Foto enviada.", "bot-message");
                if (currentContext === "embarque" && lastOptionSelected === "3") {
                    enviarParaFormspree("https://formspree.io/f/xjkyjyke", {
                        cpf: cpf,
                        fotoEmbarque: reader.result
                    });
                } else if (currentContext === "desembarque" && lastOptionSelected === "2") {
                    enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
                        cpf: cpf,
                        fotoDesembarque: reader.result
                    });
                }
                lastOptionSelected = "";
                displayMenuAfterAction();
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

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

    function handleCPFInput(message) {
        cpf = message;
        const localData = localStorage.getItem(cpf);
        if (usersData[cpf]) {
            if (!localData) {
                localStorage.setItem(cpf, JSON.stringify(usersData[cpf]));
            }
            displayMessage(`Como posso ajudar ${usersData[cpf].nome}? ☺️
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
        } else if (localData) {
            const offlineUser = JSON.parse(localData);
            displayMessage(`Como posso ajudar ${offlineUser.nome}? ☺️
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
            usersData[cpf] = offlineUser;
        } else {
            displayMessage("CPF não encontrado.", "bot-message");
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
            embarque: "Escolha uma opção do Embarque:\\n1 - Local e responsável\\n2 - Tipo de carga\\n3 - Registro fotográfico\\n4 - KM inicial\\n0 - Voltar ao menu principal",
            rota: "Escolha uma opção da Rota:\\n1 - Melhor caminho\\n2 - Paradas programadas\\n3 - Viagem no GPS\\n4 - Observações\\n5 - Custos\\n0 - Voltar ao menu principal",
            desembarque: "Escolha uma opção do Desembarque:\\n1 - Local e responsável\\n2 - Registro fotográfico\\n3 - KM final\\n0 - Voltar ao menu principal",
            contato: "Escolha um canal:\\n1 - Emergências 24h\\n2 - Supervisor\\n3 - Ouvidoria\\n0 - Voltar ao menu principal"
        };
        displayMessage(menus[menuType], "bot-message");
    }

    function handleContextResponses(message) {
        const user = usersData[cpf];
        if (message === "0") {
            displayMainMenu();
            return;
        }

        if (currentContext === "embarque") {
            if (lastOptionSelected === "4" && message !== "4") {
                if (!isNaN(message)) {
                    displayMessage("✅ KM inicial registrado: " + message, "bot-message");
                    enviarParaFormspree("https://formspree.io/f/xjkyjyke", {
                        cpf: cpf,
                        quilometroInicial: message
                    });
                    lastOptionSelected = "";
                    displayMenuAfterAction();
                    return;
                } else {
                    displayMessage("Formato inválido.", "bot-message");
                    return;
                }
            }

            lastOptionSelected = message;
            currentContext = "embarque";
            const responses = {
                "1": `Local: ${user.embarqueLocal}\\nResponsável: ${user.embarqueResponsavel}`,
                "2": `Tipo de carga: ${user.tipoCarga}`,
                "3": "Envie a foto da carga.",
                "4": "Digite o KM inicial:"
            };
            if (responses[message]) {
                displayMessage(responses[message], "bot-message");
                if (message === "4") expectingTextInput = true;
            }
        } else if (currentContext === "rota") {
            if (lastOptionSelected === "4") {
                displayMessage("✅ Observações registradas: " + message, "bot-message");
                enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
                    cpf: cpf,
                    observacoesCarga: message
                });
                lastOptionSelected = "";
                displayMenuAfterAction();
                return;
            } else if (lastOptionSelected === "5") {
                if (!isNaN(message)) {
                    displayMessage("✅ Custos registrados: R$ " + message, "bot-message");
                    enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
                        cpf: cpf,
                        custos: message
                    });
                    lastOptionSelected = "";
                    displayMenuAfterAction();
                    return;
                } else {
                    displayMessage("Formato inválido.", "bot-message");
                    return;
                }
            }

            lastOptionSelected = message;
            currentContext = "rota";
            const responses = {
                "1": "Use o Waze.",
                "2": "Paradas: " + usersData[cpf].paradasProgramadas,
                "3": "Use o Waze.",
                "4": "Digite suas observações:",
                "5": "Digite os custos da viagem:"
            };
            if (responses[message]) {
                displayMessage(responses[message], "bot-message");
                if (message === "4" || message === "5") expectingTextInput = true;
            }
        } else if (currentContext === "desembarque") {
            if (lastOptionSelected === "3" && message !== "3") {
                if (!isNaN(message)) {
                    displayMessage("✅ KM final registrado: " + message, "bot-message");
                    enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
                        cpf: cpf,
                        quilometroFinal: message
                    });
                    lastOptionSelected = "";
                    displayMenuAfterAction();
                    return;
                } else {
                    displayMessage("Formato inválido.", "bot-message");
                    return;
                }
            }

            lastOptionSelected = message;
            currentContext = "desembarque";
            const responses = {
                "1": `Local: ${user.desembarqueLocal}\\nResponsável: ${user.desembarqueResponsavel}`,
                "2": "Envie a foto da carga.",
                "3": "Digite o KM final:"
            };
            if (responses[message]) {
                displayMessage(responses[message], "bot-message");
                if (message === "3") expectingTextInput = true;
            }
        } else if (currentContext === "contato") {
            const responses = {
                "1": "Ligue para a Emergência 24h:\\n192\\nSOS Estradas:\\nhttps://postocidadedemarilia.com.br/telefone-de-emergencia-das-rodovias-guia/",
                "2": "Ligue para o supervisor Otávio: (34) 9 9894 2493.",
                "3": "Ouvidoria: ouvidoria@oliveiratransportes.com.br"
            };

            if (responses[message]) {
                displayMessage(responses[message], "bot-message");
                setTimeout(() => displayMenuAfterAction(), 2000);
            } else {
                displayMessage("Opção inválida.", "bot-message");
                displayMenuAfterAction();
            }
        }
    }

    function displayMainMenu() {
        currentContext = "";
        lastOptionSelected = "";
        expectingTextInput = false;

        const user = usersData[cpf];
        displayMessage(`Como posso ajudar ${user.nome}?
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
    }

    function displayMenuAfterAction() {
        if (currentContext) {
            displayMenu(currentContext);
        } else {
            displayMainMenu();
        }
    }
});
