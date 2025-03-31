document.addEventListener("DOMContentLoaded", function () {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");
    let currentContext = ""; // Armazena a última escolha principal

    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            sendImage(fileInput.files[0]);
            fileInput.value = ""; // Resetar input após o envio
        }
    });

    function sendImage(file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const img = document.createElement('img');
            img.src = reader.result;
            img.style.width = '200px';
            img.classList.add("image-message");
            chatBox.appendChild(img);
            chatBox.scrollTop = chatBox.scrollHeight;
        };
        reader.readAsDataURL(file);
    }

    // Correção para enviar mensagem ao clicar no botão
    sendButton.addEventListener('click', function() {
        console.log('Botão Enviar clicado');
        sendMessage();
    });

    // Correção para enviar mensagem ao pressionar Enter
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log('Enter pressionado');
            e.preventDefault(); // Impede que uma nova linha seja adicionada
            sendMessage();
        }
    });

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
        const message = userInput.value.trim().toLowerCase();
        if (message === "" && !fileInput.files.length) return;

        displayMessage(message, "user-message");
        userInput.value = "";

        if (!cpf) {
            cpf = message;
            if (usersData[cpf]) {
                displayMessage(`Como posso ajudar ${usersData[cpf].nome}?
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
            } else {
                displayMessage("Seu CPF não foi encontrado. Digite novamente.", "bot-message");
                cpf = "";
            }
            return;
        }

        if (!currentContext) {
            if (message === "1") {
                currentContext = "embarque";
                displayMessage("Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Registro fotográfico\n4 - KM inicial", "bot-message");
            } else if (message === "2") {
                currentContext = "rota";
                displayMessage("Escolha uma opção da Rota:\n1 - Melhor caminho e condições\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Registro de custos", "bot-message");
            } else if (message === "3") {
                currentContext = "desembarque";
                displayMessage("Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Registro fotográfico\n3 - KM final", "bot-message");
            } else if (message === "4") {
                displayMessage("Para procedimentos pós-viagem, mande mensagem para Otávio: (34) 99894-2493", "bot-message");
            } else if (message === "5") {
                currentContext = "contato";
                displayMessage("Escolha um canal de contato:\n1 - Emergências 24h\n2 - Supervisor de rota\n3 - Ouvidoria", "bot-message");
            } else {
                displayMessage("Opção inválida. Escolha entre 1 a 5.", "bot-message");
            }
            return;
        }

        if (currentContext === "embarque") {
            if (message === "1") {
                displayMessage(`Local de embarque: ${usersData[cpf].embarqueLocal}\nResponsável: ${usersData[cpf].embarqueResponsavel}`, "bot-message");
            } else if (message === "2") {
                displayMessage(`Tipo de carga: ${usersData[cpf].tipoCarga}`, "bot-message");
            } else if (message === "3") {
                displayMessage("Envie a foto da carga.", "bot-message");
            } else if (message === "4") {
                displayMessage("Registre o KM inicial.", "bot-message");
            }
        } else if (currentContext === "rota") {
            if (message === "1") {
                displayMessage("Melhor caminho e condições: Consulte o GPS para uma rota segura.", "bot-message");
            } else if (message === "2") {
                displayMessage(`Paradas programadas: ${usersData[cpf].paradasProgramadas}`, "bot-message");
            } else if (message === "3") {
                displayMessage("Acompanhe a viagem pelo GPS.", "bot-message");
            } else if (message === "4") {
                displayMessage("Registre observações sobre a carga.", "bot-message");
            } else if (message === "5") {
                displayMessage("Registre os custos da viagem.", "bot-message");
            }
        } else if (currentContext === "desembarque") {
            if (message === "1") {
                displayMessage(`Local de desembarque: ${usersData[cpf].desembarqueLocal}\nResponsável: ${usersData[cpf].desembarqueResponsavel}`, "bot-message");
            } else if (message === "2") {
                displayMessage("Envie a foto da carga no desembarque.", "bot-message");
            } else if (message === "3") {
                displayMessage("Registre o KM final.", "bot-message");
            }
        } else if (currentContext === "contato") {
            if (message === "1") {
                displayMessage("Emergências 24h: 192\nSOS Estradas: 0800 055 5510", "bot-message");
            } else if (message === "2") {
                displayMessage("Supervisor de rota: Otávio - (34) 99894-2493", "bot-message");
            } else if (message === "3") {
                displayMessage("Ouvidoria: ouvidoria@oliveiratransportes.com", "bot-message");
            }
        }

        currentContext = "";
        setTimeout(function() {
            displayMessage(`Escolha outra categoria:
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
        }, 10000); // 10000 milissegundos = 10 segundos
    }

    function displayMessage(message, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.innerHTML = message.replace(/\n/g, "<br>");
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
