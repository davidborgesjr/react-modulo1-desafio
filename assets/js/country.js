const apiUrl = 'https://api.covid19api.com'
let lineChart;

function getCountriesCombo(responseData) {
    const size = _.size(responseData);
    const countriesDesc = _.orderBy(responseData, ['Country'], 'asc')
    const selectElement = document.getElementById('cmbCountry');
    for(let i = 0; i < size; i++){
        const optionElement = document.createElement('option');
        optionElement.value = countriesDesc[i].Slug;
        optionElement.innerHTML = countriesDesc[i].Country;
        selectElement.appendChild(optionElement);
    }
}

function setKpiValues(dataResponse){
    let {TotalConfirmed, TotalDeaths, TotalRecovered} = dataResponse[0];

    const kpiConfirmedElementId = 'kpiconfirmed';
    const kpiDeathElementID = 'kpideaths';
    const kpiRecoveredElementId = 'kpirecovered';

    const confirmedKpiElement = document.getElementById(kpiConfirmedElementId);
    confirmedKpiElement.textContent = TotalConfirmed;

    const deathKpiElement = document.getElementById(kpiDeathElementID);
    deathKpiElement.textContent = TotalDeaths;

    const recoveredKpiElement = document.getElementById(kpiRecoveredElementId);
    recoveredKpiElement.textContent = TotalRecovered;
}

function getLabelNameForType(dataTypeParam){
    switch (dataTypeParam){
        case 'Confirmed':
            return 'Casos confirmados';
            break;
        case 'Deaths':
            return 'Número de Óbitos';
            break;
        case 'Recovered':
            return 'Recuperados';
    }
}

function drawChart(responseData, dataTypeParam){
    const size = _.size(responseData);
    const label = getLabelNameForType(dataTypeParam);
    const labels = _.map(responseData, 'Date');
    const dataFromSelectedType = _.map(responseData, dataTypeParam);
    const numberByEachDate = [];

    const lastIndex = size - 1;
    for(let i = 0; i < lastIndex; i++) {
        const value = dataFromSelectedType[i+1] - dataFromSelectedType[i];
        numberByEachDate.push(value);
    }

    labels.shift();
    const data = {
        labels: labels,
        datasets: [{
            label,
            data: numberByEachDate,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
    const config = {
        type: 'line',
        data: data,
    };
    if(lineChart) {
        lineChart.destroy();
    }
    const ctx = document.getElementById('linhas').getContext('2d');
    lineChart = new Chart(ctx, config);
}

function getFullNumber(number) {
    if (number < 10) {
        return '0'+number;
    }
    return number;
}

function getDayBeforeFrom(from) {
    const splitDate = from.split('-');
    let fromDate = new Date(splitDate[0], splitDate[1], splitDate[2]);
    let previousDay = new Date(fromDate.getTime());
    previousDay.setDate(fromDate.getDate() - 1);
    return `${previousDay.getFullYear()}-${getFullNumber(previousDay.getMonth())}-${getFullNumber(previousDay.getDate())}`;
}

async function getDailyCasesByCountry(countrySlug, initialFrom, to) {
    const from = getDayBeforeFrom(initialFrom);
    const params = {
        from,
        to
    }
    let res = await axios.get(`${apiUrl}/country/${countrySlug}`, {params});
    const selectedDataType = document.getElementById('cmbData').value;
    drawChart(res.data, selectedDataType)
    await getSummaryData(countrySlug);
}


async function getSummaryDataForCountry() {
    let res = await axios.get(`${apiUrl}/countries`);
    getCountriesCombo(res.data);
}

async function onClickBtnApply(){
    const selectedCountry = document.getElementById('cmbCountry').value;
    const dateStart = document.getElementById('date_start').value;
    const dateEnd = document.getElementById('date_end').value;
    await getDailyCasesByCountry(selectedCountry, dateStart, dateEnd);

}

function getKpiForCountry(responseData, slug){
    const param = { 'Slug': slug };
    const summaryCountryData = _.filter(responseData.Countries, param);
    setKpiValues(summaryCountryData);
}

async function getSummaryData(slug) {
    let res = await axios.get(`${apiUrl}/summary`);
    getKpiForCountry(res.data, slug)
}


getSummaryDataForCountry();
