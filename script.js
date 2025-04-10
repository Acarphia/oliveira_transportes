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

    const usersData = {
        "15347693665": {
            nome: "Luiza",
            tipoCarga: "Alimentos.",
            embarqueLocal: "Uberlândia.",
            embarqueResponsavel: "Eduarda.",
            desembarqueLocal: "Londrina.",
            desembarqueResponsavel: "Augusto.",
            paradasProgramadas: "Sem paradas."
        }
    };

function updateOnlineStatus() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');

  if (navigator.onLine) {
    dot.classList.remove('status-offline');
    dot.classList.add('status-online');
    text.textContent = 'Você está online';
  } else {
    dot.classList.remove('status-online');
    dot.classList.add('status-offline');
    text.textContent = 'Você está offline';
  }
}

window.addEventListener('load', updateOnlineStatus);
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function enviarParaFormsubmit(data, contexto) {
        const formData = new FormData();
        
        for (const key in data) {
            formData.append(key, data[key]);
        }
        
        formData.append("_subject", `📌 Atualizações de ${contexto} - CPF ${data.cpf}`);
        formData.append("_captcha", "false");
        
        fetch("https://formsubmit.co/ajax/luizapavarina2004@gmail.com", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
            displayMessage("✅ Informações enviadas!", "bot-message");
        })
        .catch(error => {
            console.error("Error:", error);
            displayMessage("❌ Erro ao enviar informações. Tente novamente.", "bot-message");
        });
    }

    function enviarImagemParaFormsubmit(file, cpf, contexto) {
        const formData = new FormData();
        
        formData.append("foto", file);
        
        formData.append("cpf", cpf);
        formData.append("_subject", `📸 Foto de ${contexto} enviada - CPF ${cpf}`);
        formData.append("_captcha", "false");
        
        fetch("https://formsubmit.co/ajax/luizapavarina2004@gmail.com", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
            displayMessage("✅ Foto enviada com sucesso!", "bot-message");
            
            lastOptionSelected = "";
            displayMenuAfterAction();
        })
        .catch(error => {
            console.error("Error:", error);
            displayMessage("❌ Erro ao enviar foto. Tente novamente.", "bot-message");
        });
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        displayMessage(message, "user-message");
        userInput.value = "";
        processUserMessage(message);
    }

    function processUserMessage(message) {
        if (!cpf) {
            handleCPFInput(message);
        } else if (!currentContext) {
            handleMainMenu(message);
        } else {
            handleContextResponses(message);
        }
    }

    if (sendButton) {
        sendButton.addEventListener("click", function (e) {
            e.preventDefault();
            sendMessage();
        });
    }

    if (userInput) {
        userInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function displayMessage(content, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.innerHTML = content.replace(/\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendImage(file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "user-message");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("image-container");

            const img = document.createElement("img");
            img.src = reader.result;

            imgContainer.appendChild(img);
            messageDiv.appendChild(imgContainer);
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            setTimeout(() => {
                displayMessage("✅ Foto enviada.", "bot-message");

                if (currentContext === "embarque" && lastOptionSelected === "3") {
                    enviarImagemParaFormsubmit(file, cpf, "embarque");
                } else if (currentContext === "desembarque" && lastOptionSelected === "2") {
                    enviarImagemParaFormsubmit(file, cpf, "desembarque");
                }

                lastOptionSelected = "";
                displayMenuAfterAction();
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

    if (fileInput && attachButton) {
        attachButton.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                sendImage(fileInput.files[0]);
            }
        });
    }

    function handleCPFInput(message) {
        cpf = message;
        const localData = localStorage.getItem(cpf);

        if (usersData[cpf]) {
            localStorage.setItem(cpf, JSON.stringify(usersData[cpf]));
            displayMainMenu();
        } else if (localData) {
            const offlineUser = JSON.parse(localData);
            usersData[cpf] = offlineUser;
            displayMainMenu();
        } else {
            displayMessage("CPF não encontrado.", "bot-message");
            cpf = "";
        }
    }

    function handleMainMenu(message) {
        switch (message) {
            case "1":
                currentContext = "embarque";
                ("embarque");
                break;
            case "2":
                currentContext = "rota";
                ("rota");
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

    function displayMainMenu() {
        currentContext = "";
        lastOptionSelected = "";
        const user = usersData[cpf];
        displayMessage(Como posso ajudar ${user.nome}? ☺️\n1 - Embarque da carga\n2 - Rota da viagem\n3 - Desembarque da carga\n4 - Pós-viagem\n5 - Canais de contato, "bot-message");
    }

    function displayMenuAfterAction() {
        if (currentContext) {
            displayMenu(currentContext);
        } else {
            displayMainMenu();
        }
    }

    function displayMenu(menuType) {
        const menus = {
            embarque: "Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Foto da carga\n4 - KM inicial\n0 - Voltar ao menu principal",
            rota: "Escolha uma opção da Rota:\n1 - Melhor caminho\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Custos\n0 - Voltar ao menu principal",
            desembarque: "Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Foto da carga\n3 - KM final\n0 - Voltar ao menu principal",
            contato: "Escolha um canal:\n1 - Emergências 24h\n2 - Supervisor\n3 - Ouvidoria\n0 - Voltar ao menu principal"
        };
        displayMessage(menus[menuType], "bot-message");
    }

    function handleContextResponses(message) {
        const user = usersData[cpf];
        const isNumber = !isNaN(Number(message));

        if (message === "0") {
            displayMainMenu();
            return;
        }

        if (currentContext === "embarque" && lastOptionSelected === "4" && isNumber) {
            displayMessage("✅ KM inicial registrado: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, quilometroInicial: message }, "embarque");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1000);
            return;
}
        }

        if (currentContext === "desembarque" && lastOptionSelected === "3" && isNumber) {
            displayMessage("✅ KM final registrado: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, quilometroFinal: message }, "desembarque");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1000);
            return;
}

        }

        if (currentContext === "rota" && lastOptionSelected === "4") {
            displayMessage("✅ Observações registradas: " + message, "bot-message");
            enviarParaFormsubmit({ cpf, observacoesCarga: message }, "rota");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1000);
            return;
        }

        if (currentContext === "rota" && lastOptionSelected === "5" && isNumber) {
            displayMessage("✅ Custos registrados: R$ " + message, "bot-message");
            enviarParaFormsubmit({ cpf, custos: message }, "rota");
            lastOptionSelected = "";
            setTimeout(displayMenuAfterAction, 1000);
            return;
        }

        lastOptionSelected = message;

        if (currentContext === "embarque") {
            const responses = {
                "1": Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel},
                "2": Tipo de carga: ${user.tipoCarga},
                "3": "Envie a foto da carga no embarque:",
                "4": "Digite o KM inicial:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "rota") {
            const responses = {
                "1": "Instale o Waze, disponível para Android e IOS, ou acesse: https://www.waze.com/pt-BR/live-map/",
                "2": "Paradas: " + user.paradasProgramadas,
                "3": "Instale o Waze, disponível para Android e IOS, ou acesse: https://www.waze.com/pt-BR/live-map/",
                "4": "Digite suas observações:",
                "5": "Digite os custos da viagem:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "desembarque") {
            const responses = {
                "1": Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel},
                "2": "Envie a foto da carga no desembarque:",
                "3": "Digite o KM final:"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");

        } else if (currentContext === "contato") {
            const responses = {
                "1": "Emergência 24h:\n192\nSOS Estradas:\nhttps://postocidadedemarilia.com.br/telefone-de-emergencia-das-rodovias-guia/",
                "2": "Supervisor Otávio: (34) 9 9894-2493",
                "3": "Ouvidoria: ouvidoria@oliveiratransportes.com.br"
            };
            displayMessage(responses[message] || "Opção inválida.", "bot-message");
            setTimeout(displayMenuAfterAction, 1000);
        }
    }
});
