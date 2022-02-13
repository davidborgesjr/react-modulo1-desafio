const apiUrl = 'https://api.covid19api.com'
let barChart;

function getKpisNumber(data){
    let {TotalConfirmed, TotalDeaths, TotalRecovered} = data.Global;

    const kpiConfirmedElementId = 'confirmed';
    const kpiDeathElementID = 'death';
    const kpiRecoveredElementId = 'recovered';

    const confirmedKpiElement = document.getElementById(kpiConfirmedElementId);
    confirmedKpiElement.textContent = TotalConfirmed;

    const deathKpiElement = document.getElementById(kpiDeathElementID);
    deathKpiElement.textContent = TotalDeaths;

    const recoveredKpiElement = document.getElementById(kpiRecoveredElementId);
    recoveredKpiElement.textContent = TotalRecovered;
}

function getPizzaChartNumber(dataResponse){
    let {NewConfirmed, NewDeaths, NewRecovered} = dataResponse.Global;
    const data = {
        labels: [
            'Confirmados',
            'Recuperados',
            'Mortes'
        ],
        datasets: [
            {
                label: 'Distribuição de novos casos',
                data: [NewConfirmed, NewDeaths, NewRecovered],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }
        ]
    };

    const config = {
        type: 'pie',
        data: data,
    };

    const ctx = document.getElementById('pizza').getContext('2d');
    const myChart = new Chart(ctx, config);
}

function getBarChartNumber(dataResponse) {
    let {Countries} = dataResponse;
    let sortedCountries = _.orderBy(Countries, ['TotalDeaths'], 'desc').slice(0,10);
    let countriesName = _.map(sortedCountries, 'Country');
    let deathsByCountry = _.map(sortedCountries, 'TotalDeaths');

    const data = {
        labels: countriesName,
        datasets: [{
            label: 'Total de Mortes por país - Top 10',
            data: deathsByCountry,
            backgroundColor: 'rgb(176, 103, 249)',
            borderColor: 'rgb(176, 103, 249)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };

    if(barChart) {
        barChart.destroy();
    }
    const ctx = document.getElementById('barras').getContext('2d');
    barChart = new Chart(ctx, config);
}

async function getSummaryData() {
    let res = await axios.get(`${apiUrl}/summary`);
    getKpisNumber(res.data);
    getPizzaChartNumber(res.data);
    getBarChartNumber(res.data);
}

getSummaryData();