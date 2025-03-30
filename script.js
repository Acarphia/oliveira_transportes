document.addEventListener("DOMContentLoaded", function () {
    let cpf = "";
    let chatBox = document.getElementById("chat-box");
    let userInput = document.getElementById("user-input");
    let fileInput = document.getElementById("file-input");
    let attachButton = document.getElementById("attach-button");
    let sendButton = document.getElementById("send-button");

    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    const usersData = {
        "15347693665": {
            nome: "Luiza",
            tipoCarga: "Alimentos.",
            embarqueLocal: "Uberlândia",
            embarqueResponsavel: "Maria.",
            desembarqueLocal: "Londrina",
            desembarqueResponsavel: "Carmen.",
            paradasProgramadas: "Sem paradas programadas."
        },
    };

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "" && !fileInput.files.length) return;

        displayMessage(message, "user-message");
        userInput.value = "";

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
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
            fileInput.value = "";
        }

        // Se o CPF ainda não foi validado
        if (!cpf) {
            cpf = message;
            if (usersData[cpf]) {
                displayMessage(`Olá, ${usersData[cpf].nome}! Como posso ajudar?\n1 - Embarque da Carga\n2 - Rota da Viagem\n3 - Desembarque da Carga\n4 - Procedimentos pós-viagem\n5 - Canais de Contato`, "bot-message");
            } else {
                displayMessage("Seu CPF não foi encontrado. Digite novamente.", "bot-message");
                cpf = ""; 
            }
            return;
        }

        // Após validar CPF, processar as opções do menu
        processUserOption(message);
    }

    function processUserOption(option) {
        switch (option) {
            case "1":
                displayMessage("Escolha uma opção relacionada ao Embarque da Carga:\na - Local e responsável pelo embarque\nb - Tipo de carga\nc - Registro fotográfico da carga no embarque\nd - KM inicial registrado", "bot-message");
                break;
            case "a":
                displayMessage(`Local de embarque: ${usersData[cpf].embarqueLocal}\nResponsável: ${usersData[cpf].embarqueResponsavel}`, "bot-message");
                break;
            case "b":
                displayMessage(`Tipo de carga: ${usersData[cpf].tipoCarga}`, "bot-message");
                break;
            case "c":
                displayMessage("Envie a foto da carga.", "bot-message");
                break;
            case "d":
                displayMessage("Registre o KM inicial.", "bot-message");
                break;

            case "2":
                displayMessage("Escolha uma opção da Rota da Viagem:\na - Melhor caminho e condições\nb - Paradas programadas\nc - Viagem no GPS\nd - Observações da carga\ne - Registro de custos", "bot-message");
                break;
            case "b":
                displayMessage(`Paradas programadas: ${usersData[cpf].paradasProgramadas}`, "bot-message");
                break;
            case "d":
                displayMessage("Registre observações sobre a carga (animal machucado, vazamento, etc.)", "bot-message");
                break;
            case "e":
                displayMessage("Registre custos (abastecimento, manutenção, estadia, etc.)", "bot-message");
                break;

            case "3":
                displayMessage("Escolha uma opção relacionada ao Desembarque da Carga:\na - Local e responsável pelo desembarque\nb - Registro fotográfico da carga no desembarque\nc - KM final registrado", "bot-message");
                break;
            case "a":
                displayMessage(`Local de desembarque: ${usersData[cpf].desembarqueLocal}\nResponsável: ${usersData[cpf].desembarqueResponsavel}`, "bot-message");
                break;
            case "b":
                displayMessage("Envie a foto da carga.", "bot-message");
                break;
            case "c":
                displayMessage("Registre o KM final.", "bot-message");
                break;

            case "4":
                displayMessage("Para procedimentos pós-viagem, favor entrar em contato com Otávio - (34) 99894-2493.", "bot-message");
                break;

            case "5":
                displayMessage("Escolha um canal de contato:\na - Emergências 24h\nb - Supervisor de rota\nc - Ouvidoria", "bot-message");
                break;
            case "a":
                displayMessage("Emergências: 192\nSOS Estradas:\n0800 055 5510 - DER-SP\n0800 773 6699 - CCR RodoAnel\n0800 77 01 101 - EcoRodovias\n0800 000 0290 - CCR ViaSul\n0800 055 9696 - SAU Renovias", "bot-message");
                break;
            case "b":
                displayMessage("Supervisor de rota: Otávio - (34) 99894-2493", "bot-message");
                break;
            case "c":
                displayMessage("Ouvidoria: ouvidoria@oliveiratransportes.com", "bot-message");
                break;

            default:
                displayMessage("Opção inválida. Por favor, escolha uma das opções fornecidas.", "bot-message");
                break;
        }
    }

    function displayMessage(message, className) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", className);
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
