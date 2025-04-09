// ✅ SCRIPT CORRIGIDO - Integração com Formspree (embarque + desembarque)

// Espera DOM carregar
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
      nome: "Luiza",
      tipoCarga: "Alimentos.",
      embarqueLocal: "Uberlândia.",
      embarqueResponsavel: "Eduarda.",
      desembarqueLocal: "Londrina.",
      desembarqueResponsavel: "Augusto.",
      paradasProgramadas: "Sem paradas."
    }
  };

  if (sendButton) {
    sendButton.addEventListener('click', function (e) {
      e.preventDefault();
      sendMessage();
    });
  }

  if (userInput) {
    userInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;
    displayMessage(message, "user-message");
    userInput.value = "";
    processUserMessage(message);
  }

  function enviarParaFormspree(url, data) {
    fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (res.ok) {
        displayMessage("Informações enviadas!", "bot-message");
      } else {
        displayMessage("Erro ao enviar suas informações.", "bot-message");
      }
    }).catch(() => displayMessage("Erro de rede ao enviar suas informações.", "bot-message"));
  }

  function sendImage(file) {
    const reader = new FileReader();
    reader.onloadend = function () {
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
    attachButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        sendImage(fileInput.files[0]);
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

  function handleCPFInput(message) {
    cpf = message;
    const localData = localStorage.getItem(cpf);
    if (usersData[cpf]) {
      if (!localData) localStorage.setItem(cpf, JSON.stringify(usersData[cpf]));
      displayMainMenu(usersData[cpf].nome);
    } else if (localData) {
      const offlineUser = JSON.parse(localData);
      displayMainMenu(offlineUser.nome);
      usersData[cpf] = offlineUser;
    } else {
      displayMessage("CPF não encontrado.", "bot-message");
      cpf = "";
    }
  }

  function displayMainMenu(nome = "") {
    currentContext = "";
    lastOptionSelected = "";
    expectingTextInput = false;
    displayMessage(`Como posso ajudar ${nome}?
1 - Embarque da carga
2 - Rota da viagem
3 - Desembarque da carga
4 - Pós-viagem
5 - Canais de contato`, "bot-message");
  }

  function displayMenu(tipo) {
    const menus = {
      embarque: "Escolha uma opção do Embarque:\n1 - Local e responsável\n2 - Tipo de carga\n3 - Registro fotográfico\n4 - KM inicial\n0 - Voltar ao menu principal",
      rota: "Escolha uma opção da Rota:\n1 - Melhor caminho\n2 - Paradas programadas\n3 - Viagem no GPS\n4 - Observações\n5 - Custos\n0 - Voltar ao menu principal",
      desembarque: "Escolha uma opção do Desembarque:\n1 - Local e responsável\n2 - Registro fotográfico\n3 - KM final\n0 - Voltar ao menu principal",
      contato: "Escolha um canal:\n1 - Emergências 24h\n2 - Supervisor\n3 - Ouvidoria\n0 - Voltar ao menu principal"
    };
    displayMessage(menus[tipo], "bot-message");
  }

  function displayMenuAfterAction() {
    if (currentContext) displayMenu(currentContext);
    else displayMainMenu();
  }

  function handleEmbarqueResponses(message, user) {
    if (lastOptionSelected === "4" && message !== "4") {
      if (!isNaN(message) && message.trim() !== "") {
        displayMessage("KM inicial registrado: " + message, "bot-message");
        enviarParaFormspree("https://formspree.io/f/xjkyjyke", {
          cpf: cpf,
          quilometroInicial: message
        });
        lastOptionSelected = "";
        displayMenuAfterAction();
        return;
      } else {
        displayMessage("Formato inválido. Digite apenas números.", "bot-message");
        return;
      }
    }
    lastOptionSelected = message;
    const respostas = {
      "1": `Local: ${user.embarqueLocal}\nResponsável: ${user.embarqueResponsavel}`,
      "2": `Tipo de carga: ${user.tipoCarga}`,
      "3": "Envie a foto da carga.",
      "4": "Digite o KM inicial:"
    };
    if (respostas[message]) {
      displayMessage(respostas[message], "bot-message");
      if (message === "4") expectingTextInput = true;
    } else displayMessage("Opção inválida.", "bot-message");
  }

  function handleDesembarqueResponses(message, user) {
    if (lastOptionSelected === "3" && message !== "3") {
      if (!isNaN(message) && message.trim() !== "") {
        displayMessage("KM final registrado: " + message, "bot-message");
        enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
          cpf: cpf,
          quilometroFinal: message
        });
        lastOptionSelected = "";
        displayMenuAfterAction();
        return;
      } else {
        displayMessage("Formato inválido. Digite apenas números.", "bot-message");
        return;
      }
    }
    lastOptionSelected = message;
    const respostas = {
      "1": `Local: ${user.desembarqueLocal}\nResponsável: ${user.desembarqueResponsavel}`,
      "2": "Envie a foto da carga.",
      "3": "Digite o KM final:"
    };
    if (respostas[message]) {
      displayMessage(respostas[message], "bot-message");
      if (message === "3") expectingTextInput = true;
    } else displayMessage("Opção inválida.", "bot-message");
  }

  function handleRotaResponses(message, user) {
    if (lastOptionSelected === "4") {
      displayMessage("Observações registradas: " + message, "bot-message");
      enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
        cpf: cpf,
        observacoesCarga: message
      });
      lastOptionSelected = "";
      displayMenuAfterAction();
      return;
    } else if (lastOptionSelected === "5") {
      if (!isNaN(message) && message.trim() !== "") {
        displayMessage("Custos registrados: R$ " + message, "bot-message");
        enviarParaFormspree("https://formspree.io/f/mrbprpzq", {
          cpf: cpf,
          custos: message
        });
        lastOptionSelected = "";
        displayMenuAfterAction();
        return;
      } else {
        displayMessage("Formato inválido. Digite apenas números.", "bot-message");
        return;
      }
    }
    lastOptionSelected = message;
    const respostas = {
      "1": "Use o Waze.",
      "2": `Paradas: ${user.paradasProgramadas}`,
      "3": "Use o Waze.",
      "4": "Digite suas observações:",
      "5": "Digite os custos da viagem:"
    };
    if (respostas[message]) {
      displayMessage(respostas[message], "bot-message");
      if (message === "4" || message === "5") expectingTextInput = true;
    } else displayMessage("Opção inválida.", "bot-message");
  }

  function handleContatoResponses(message) {
    const respostas = {
      "1": "Ligue para a Emergência 24h:\n192\nSOS Estradas:",
      "2": "Supervisor: (34) 9 9894 2493",
      "3": "Ouvidoria: ouvidoria@oliveiratransportes.com.br"
    };
    if (respostas[message]) {
      displayMessage(respostas[message], "bot-message");
      setTimeout(displayMenuAfterAction, 2000);
    } else displayMessage("Opção inválida.", "bot-message");
  }

  function processUserMessage(message) {
    if (!cpf) return handleCPFInput(message);
    if (!currentContext) return handleMainMenu(message);
    handleContextResponses(message);
  }

  function handleMainMenu(message) {
    switch (message) {
      case "1": currentContext = "embarque"; displayMenu("embarque"); break;
      case "2": currentContext = "rota"; displayMenu("rota"); break;
      case "3": currentContext = "desembarque"; displayMenu("desembarque"); break;
      case "4": displayMessage("Para pós-viagem, contate Otávio: (34) 99894-2493", "bot-message"); break;
      case "5": currentContext = "contato"; displayMenu("contato"); break;
      default: displayMessage("Opção inválida. Escolha de 1 a 5.", "bot-message");
    }
  }

  function handleContextResponses(message) {
    const user = usersData[cpf];
    if (message === "0") return displayMainMenu(user.nome);
    if (currentContext === "embarque") return handleEmbarqueResponses(message, user);
    if (currentContext === "rota") return handleRotaResponses(message, user);
    if (currentContext === "desembarque") return handleDesembarqueResponses(message, user);
    if (currentContext === "contato") return handleContatoResponses(message);
  }
});
