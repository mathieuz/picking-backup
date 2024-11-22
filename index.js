// @ts-nocheck
/** Example of using the IIFE build of the uibuilder client library
 * See the docs if the client doesn't start on its own.
 * logLevel and showMsg can be controlled from Node-RED instead of here if preferred.
 */
'use strict'

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2) // uibuilder.set('logLevel', 'info')
// Using the log output yourself:
// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})


// funções para animação da troca de logo
var imgs_logo = ["images/DW.jpeg", "images/Logo_Paranoa.png"];
var index = 0;

// carrega a tabela com os dados do JSON.
sendToNR("carregar_tabela_op", 0);

window.onload = function() {
    setInterval(displayNextImage, 5000);
    menuSelect("CONTADOR");
}

function displayNextImage(){
    document.getElementById("logo").src = imgs_logo[index]
    index = (index + 1) % imgs_logo.length;
}

function menuShow(){
    let menu = document.getElementById("menu");
    if (menu.style.display == "block"){
        menu.style.display = "none";
    }
    else {
        if(document.fullscreenElement){
            document.getElementById("menu_max_mix").innerText = "MINIMIZAR";
        }
        else{
            document.getElementById("menu_max_mix").innerText = "MAXIMIZAR";
        }
        menu.style.display = "block";
    }
}

function menuSelect(action){
    switch(action) {
        case "LOGIN":
            document.getElementById("div-pai-login").style.display = "block";
            document.getElementById("div-pai-contador").style.display = "none";
            updateHeaderInfoPage("LOGIN", "FAÇA LOGIN PARA CONTINUAR");
            
            break;
        
        case "CONTADOR":
            document.getElementById("div-pai-login").style.display = "none";
            document.getElementById("div-pai-contador").style.display = "flex";
            updateHeaderInfoPage("PICKING", "DIGITE O NÚMERO DE AMOSTRAS PARA CONTAR");

            break;

        case "REIMPRIMIR":
            break;
        
        case "MINIMIZAR/MAXIMIZAR":
            openFullscreen();
            break;
    }
}

function updateHeaderInfoPage(titulo, dica) {
    document.getElementById("titulo").innerText = titulo;
    document.getElementById("dica").innerText = dica;
}

function getLoggedInOperadorData() {
    return JSON.parse(localStorage.getItem("operadorData"));
}

function setLoggedOperadorData(id, nome) {
    const formatNome = nome.substring(0, nome.indexOf(" ") + 2);
    const operadorData = { id: id, nome: formatNome };
    localStorage.setItem("operadorData", JSON.stringify(operadorData));
}

/* ##################################################################################################### */
/* ############################################# LOGIN ################################################# */
/* ##################################################################################################### */

function login() {
    let inputReValue = document.getElementById("input_RE").value;
    showKeypad("Informe uma senha", confirmLogin, false);
}

function keypadPress(valor) {
    let display = document.getElementById("display");
    if ((display.innerText).length < 12 || valor == "CANCELAR" || valor == "⇐") {
        switch(valor) {
            case "CANCELAR":
                display.innerText = "";
                document.getElementById("numerickeypad").style.display = "none";
                break;
            case "⇐":
                display.innerText = display.innerText.substring(0, (display.innerText).length-1);
                break;
            default:
                display.innerText += valor;
        }
    } 
}

function showKeypad(msg, confirmAction, allow_dot) {
    document.getElementById("msg").innerText = msg;
    document.getElementById("key-confirm").onclick = confirmAction;
    document.getElementById("key-dot").disabled = !allow_dot;
    if (!allow_dot) {
        document.getElementById("key-dot").style.backgroundColor = "#868181";
    }
    else {
        document.getElementById("key-dot").style.backgroundColor = "#414141";
    }
    document.getElementById("display").innerText = "";
    document.getElementById("numerickeypad").style.display = "block";
}

// calcula o PMP
function inputNumAmostras() {
    let display_value = document.getElementById("display").innerText;
    if (display_value != null || display_value != "") {
        // verifica se a entrada é um número inteiro
        if (!isNaN(display_value) && !display_value.includes(".")) {
            let peso = Number(document.getElementById("display_peso").innerText.replace(",", "."));
            document.getElementById("display_pmp").innerText = (peso/display_value).toFixed(8);
        }
        else {
            alert("Digite um número válido!");
        }
    }
    document.getElementById("numerickeypad").style.display = "none";
}

function confirmLogin() {

    //Recupera os dados necessários para o login, informados pelo operador.
    let re = document.getElementById("input_RE").value;
    let senha = document.getElementById("display").innerText;

    //Monta estrutura de dados para o POST na API de login.
    let dataLogin = {
        codigo: re,
        senha: senha,
        terminal: "picking"
    }

    //Fecha o keypad.
    document.getElementById("numerickeypad").style.display = "none";

    //Envia o objeto de login para a API.
    sendToNR("login", dataLogin);
}

function checkLogin(payload, statusCode) {

    //Recupera o dado que veio do payload.
    const data = payload[0];

    //Se o login foi efetuado com sucesso, salva as informações do operador e redireciona para a tela de 
    if (statusCode === 201) {
        setLoggedOperadorData(data.ID, data.nome);
        menuSelect("CONTADOR");
        console.log(getLoggedInOperadorData());
        return;
    }

    //Se deu erro, exibe a mensagem de erro vindo do payload.
    alert(data.erro + ".");
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    let menu = document.getElementById("menu");
    let navbtn = document.getElementById("navegacao");
    if (event.target != menu && event.target != navbtn) {
      menu.style.display = "none";
    }
}

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

// enter or exit fullscreen mode
function openFullscreen() {
    // if maximized exit fullscreen mode
    if(document.fullscreenElement){
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
        }
    }
    // if screen minimized go fullscreen
    else{
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
        }
        elem.onfullscreenerror
    }
}

/* ##################################################################################################### */
/* ############################################ TABELAS ################################################ */
/* ##################################################################################################### */


// carrega os dados de uma tabela
function loadTableData(tabela_id, conteudo) {
    var table = document.getElementById(tabela_id);
    // limpa tabela para inserir novos dados
    for(var i = 1;i<table.rows.length;){
        table.deleteRow(i);
    }
    // preenche novo conteúdo
    conteudo.forEach( linha => {
        //linha.onclick = mostramsg();
        var valor_colunas = Object.values(linha)
        let row = table.insertRow();
        setTableRowColor(tabela_id, row);
        setTableRowOnClick(tabela_id, row);
        for (let num_coluna=0; num_coluna < valor_colunas.length; num_coluna++){ 
            row.insertCell(num_coluna).innerHTML = valor_colunas[num_coluna];
        }
    });
}

// regras de cor das linhas de acordo com a tabela
function setTableRowColor(tabela_id, row){
    switch(tabela_id) {
        case "tabela_kanban_necessidade":
            row.style.backgroundColor = "red";
            break;
        default:
            row.style.backgroundColor = "#494949";
            break;
    }
}

// método seleciona apenas uma linha da tabela
function tableSelectSingle(tabela_id, row){
    var table = document.getElementById(tabela_id);
    // desfaz a seleção de todas as linhas da tabela
    for (var line = 1; line < table.rows.length; line++) { 
        for (var col = 0; col < table.rows[line].cells.length; col++) { 
            table.rows[line].cells[col].style.background = "#494949";
        }  
    }
    // deixa selecionada apenas a que clicou
    for (var col_selected_line = 0; col_selected_line < row.cells.length; col_selected_line++){
        row.cells[col_selected_line].style.backgroundColor = "blue";
    }
}

// método seleciona múltiplas linhas da tabela
function tableSelectMultiple(row){
    if (row.style.backgroundColor == "blue") {
        row.style.backgroundColor = "#494949";
    }
    else {
        row.style.backgroundColor = "blue";
    }
}

// configura ação ao clicar em uma linha da tabela
function setTableRowOnClick(tabela_id, row){
    switch(tabela_id) {
        case "tabela_ordens_picadas":
            row.onclick = function() {tabelaOrdensPicadasOnClick(tabela_id, row)};
            break;
        default:
            break;
    }
}

function tabelaOrdensPicadasOnClick(tabela_id, row){
    // configura a tabela para selecionar apenas uma linha por vez
    tableSelectSingle(tabela_id, row);
    // preenche a ordem
    // https://stackoverflow.com/questions/44319697/html-table-onclick-function-to-get-table-row-key-and-value
    /*
    document.getElementById("ordem_selecionada").innerText = row.childNodes[0].innerHTML;
    body.op = row.childNodes[0].innerHTML;
    body.descricao = row.childNodes[2].innerHTML.substring(0, 19);
    */
}


/* ##################################################################################################### */
/* ########################################### WEBSOCKET ############################################### */
/* ##################################################################################################### */

// Helper function to send a message back to Node-RED using the standard send function
function sendToNR(topic, payload){
    uibuilder.send({
        'topic': topic,
        'payload': payload
    })
}

// Listen for incoming messages from Node-RED and action
uibuilder.onChange('msg', (msg) => {

    console.log(msg);

    switch(msg.topic) {
        case "balanca":
            var display_peso = document.getElementById("display_peso");
            var display_pmp = Number(document.getElementById("display_pmp").innerText);
            display_peso.innerText = msg.payload.substring(3, 10);
            let display_quantidade = document.getElementById("display_quantidade");
            display_quantidade.innerText = Math.round(
                Number(display_peso.innerText.replace(",", "."))/display_pmp);

            break;
        
        case "listar_qtd":
            loadTableData("tabela_ordens_picadas", msg.payload);
            break;
        
        case "login":
            checkLogin(msg.payload, msg.statusCode);
            break;
    } 
})
