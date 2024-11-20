let countryDatabase = {}; // Variável para armazenar os dados do arquivo JSON de países e capitais
let countryFlags = {}; // Variável para armazenar os dados do arquivo JSON de bandeiras

// Carregar os arquivos JSON de bandeiras e países
Promise.all([
    fetch('./database/country_flags.json').then(response => response.json()),
    fetch('./database/country_database.json').then(response => response.json())
]).then(([flagData, countryData]) => {
    countryFlags = flagData.country_flags;
    countryDatabase = countryData;
}).catch(error => console.error("Erro ao carregar os arquivos:", error));

let currentCountry = null;
let countryList = [];
let correctCount = 0;
let incorrectCount = 0;
let isCountryToCapital = true;
let selectedContinent = null;
let showCountryName = true;

function updateCounters() {
    document.getElementById('correct-label').textContent = `Acertos: ${correctCount}`;
    document.getElementById('incorrect-label').textContent = `Erros: ${incorrectCount}`;
}

function showNewCountry() {
    if (countryList.length > 0) {
        currentCountry = countryList[Math.floor(Math.random() * countryList.length)];
        const displayLabel = document.getElementById('display-label');
        const flagImage = document.getElementById('flag-image');

        // Exibe o nome do país ou a capital, conforme o tipo de quiz
        displayLabel.textContent = isCountryToCapital ? currentCountry : countryDatabase[selectedContinent][currentCountry];
        
        // Obtém o código ISO do país e usa para montar o caminho da bandeira
        const countryCode = countryFlags[currentCountry] || 'unknown'; // 'unknown' se não encontrar o código ISO
        flagImage.src = `./png1000px/${countryCode.toLowerCase()}.png`;

        flagImage.style.display = 'block';

        if (showCountryName) {
            displayLabel.textContent = currentCountry;
        } else {
            displayLabel.textContent = "";
        }

        document.getElementById('entry-field').value = "";
        document.getElementById('entry-field').focus();
    } else {
        const displayLabel = document.getElementById('display-label');
        displayLabel.textContent = "Parabéns! Você completou o quiz.";
        document.getElementById('flag-image').style.display = 'none';
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById('entry-field').value.trim().toLowerCase();
    const correctAnswer = isCountryToCapital ? countryDatabase[selectedContinent][currentCountry] : currentCountry;
    
    const feedbackLabel = document.getElementById('feedback-label');
    
    if (userAnswer === correctAnswer.toLowerCase()) {
        feedbackLabel.textContent = "Correto!";
        feedbackLabel.style.color = "#4caf50";  /* Verde para resposta correta */
        correctCount++;
        countryList = countryList.filter(country => country !== currentCountry);
    } else {
        feedbackLabel.textContent = `Incorreto! A resposta correta é: ${correctAnswer}`;
        feedbackLabel.style.color = "#f44336";  /* Vermelho para resposta incorreta */
        incorrectCount++;
    }
    
    updateCounters();
    showNewCountry();
}


function selectContinent(continent) {
    selectedContinent = continent;
    countryList = Object.keys(countryDatabase[continent]);
    correctCount = 0;
    incorrectCount = 0;
    updateCounters();
    showNewCountry();
}

function toggleCountryName() {
    showCountryName = !showCountryName;
    const button = document.getElementById('toggle-button');
    button.style.backgroundColor = showCountryName ? 'green' : 'transparent';
    showNewCountry();
}

document.getElementById('entry-field').addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

document.getElementById('toggle-button').addEventListener('click', toggleCountryName);



// Inicialize o mapa Leaflet
const map = L.map('map').setView([0, 0], 2); // Centralizado no globo com zoom 2

// Adicione uma camada de mapa (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Adicione uma variável para o marcador do mapa
let marker;

// Função para atualizar o mapa com base no país
function updateMap(country) {
    const apiKey = "5cfbb4ccdbb6441a9a3475179235a303"; // Sua chave de API do OpenCage
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(country)}&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry;

                // Centraliza o mapa nas coordenadas
                map.setView([lat, lng], 6);

                // Atualiza o marcador
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng]).addTo(map);
                }
            } else {
                console.error("Não foi possível localizar o país:", country);
            }
        })
        .catch(error => console.error("Erro ao buscar dados de geocodificação:", error));
}

// Atualize o mapa toda vez que um novo país for mostrado
function showNewCountry() {
    if (countryList.length > 0) {
        currentCountry = countryList[Math.floor(Math.random() * countryList.length)];
        const displayLabel = document.getElementById('display-label');
        const flagImage = document.getElementById('flag-image');

        displayLabel.textContent = isCountryToCapital ? currentCountry : countryDatabase[selectedContinent][currentCountry];
        
        // Atualiza a bandeira
        const countryCode = countryFlags[currentCountry] || 'unknown';
        flagImage.src = `./png1000px/${countryCode.toLowerCase()}.png`;

        flagImage.style.display = 'block';

        if (showCountryName) {
            displayLabel.textContent = currentCountry;
        } else {
            displayLabel.textContent = "";
        }

        // Atualiza o mapa com o país atual
        updateMap(currentCountry);

        document.getElementById('entry-field').value = "";
        document.getElementById('entry-field').focus();
    } else {
        const displayLabel = document.getElementById('display-label');
        displayLabel.textContent = "Parabéns! Você completou o quiz.";
        document.getElementById('flag-image').style.display = 'none';
        map.setView([0, 0], 2); // Reseta o mapa para o globo
    }
}
