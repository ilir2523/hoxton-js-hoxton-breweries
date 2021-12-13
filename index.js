// Write your code here

const baseUrl = "https://api.openbrewerydb.org/breweries"

const filterAsideEl = document.querySelector('.filters-section')
const selectStateForm = document.querySelector('#select-state-form')
const searchBreweriesSectionEl = document.querySelector('.search-breweries-section')

const breweriesListEl = document.querySelector('.breweries-list')
const searchForm = document.querySelector('#search-breweries-form')

const state = {
    breweries: [],
    selectedState: null,
    breweryTypes: ['micro', 'regional', 'brewpub'],
    selectedBreweryType: '',
    selectedCities: [],
    search: ''
}

function getBreweriesToDisplay() {
    let breweriesToDisplay = state.breweries

    breweriesToDisplay = breweriesToDisplay.filter(brewery =>
        state.breweryTypes.includes(brewery.brewery_type)
    )

    if (state.selectedBreweryType !== '') {
        breweriesToDisplay = breweriesToDisplay.filter(
          brewery => brewery.brewery_type === state.selectedBreweryType
        )
      }

    if (state.selectedCities.length > 0) {
        breweriesToDisplay = breweriesToDisplay.filter(brewery =>
        state.selectedCities.includes(brewery.city)
        )
    }

    // breweriesToDisplay = breweriesToDisplay.filter(brewery =>
    //     brewery.name.toLowerCase().includes(state.search.toLowerCase)
    // )

    breweriesToDisplay = breweriesToDisplay.slice(0, 10)

    return breweriesToDisplay
}

function getCitiesFromBreweries(breweries) {
    let cities = []

    for (const brewery of breweries) {
        if (!cities.includes(brewery.city)) {
            cities.push(brewery.city)
        }
    }

    cities.sort()

    return cities
}

// SERVER FUNCTIONS
function fetchBreweries() {
    return fetch(baseUrl)
        .then((resp) => resp.json())
}

function fetchBreweriesByState(stateName) {
    return fetch(`${baseUrl}?by_state=${stateName}&per_page=50`).then(resp =>
        resp.json()
    )
}


// RENDER Functions
function renderFilerSection() {
    filterAsideEl.innerHTML = ''

    const filterH2El = document.createElement('h2')
    filterH2El.textContent = "Filter By:"

    const filterByTypeFormEl = document.createElement('form')
    filterByTypeFormEl.setAttribute('id', 'filter-by-type-form')
    filterByTypeFormEl.setAttribute('autocompete', 'off')

    const filterTypeLabel = document.createElement('label')
    filterTypeLabel.setAttribute('for', 'filter-by-type')
    filterTypeLabel.innerHTML = '<h3>Type of Brewery</h3>'

    const filterByTypeSelectEl = document.createElement('select')
    filterByTypeSelectEl.setAttribute('name', 'filter-by-type')
    filterByTypeSelectEl.setAttribute('id', 'filter-by-type')
    filterByTypeSelectEl.innerHTML = '<option value="">Select a type...</option>'


    filterByTypeFormEl.append(filterTypeLabel, filterByTypeSelectEl)


    for (type of state.breweryTypes) {
        const optionEl = document.createElement('option')
        optionEl.setAttribute('value', type)
        optionEl.textContent = type

        filterByTypeSelectEl.append(optionEl)
    }

    function listenToFilterByTypeSelectEl() {
        filterByTypeSelectEl.addEventListener('change', function () {
            state.selectedBreweryType = filterByTypeSelectEl.value
            render()
        })
    }
    listenToFilterByTypeSelectEl()

    filterByTypeSelectEl.value = state.selectedBreweryType

    const filterDivEl = document.createElement('div')
    filterDivEl.setAttribute('class', 'filter-by-city-heading')
    filterDivEl.innerHTML = `
        <h3>Cities</h3>
        <button class="clear-all-btn">clear all</button>
        `

    const filterByCityFormEl = document.createElement('form')
    filterByCityFormEl.setAttribute('id', 'filter-by-city-form')

    filterByCityFormEl.innerHTML = ''

    // render all the checkboxes again
    const cities = getCitiesFromBreweries(state.breweries)

    for (const city of cities) {
        const inputEl = document.createElement('input')
        inputEl.setAttribute('type', 'checkbox')
        inputEl.setAttribute('class', 'city-checkbox')
        inputEl.setAttribute('name', city)
        inputEl.setAttribute('value', city)
        inputEl.setAttribute('id', city)

        if (state.selectedCities.includes(city)) inputEl.checked = true

        const labelEl = document.createElement('label')
        labelEl.setAttribute('for', city)
        labelEl.textContent = city

        inputEl.addEventListener('change', function () {
            const cityCheckboxes = document.querySelectorAll('.city-checkbox')
            let selectedCities = []
            for (const checkbox of cityCheckboxes) {
                if (checkbox.checked) selectedCities.push(checkbox.value)
            }

            state.selectedCities = selectedCities

            render()
        })

        filterByCityFormEl.append(inputEl, labelEl)
    }

    filterAsideEl.append(filterH2El, filterByTypeFormEl, filterDivEl, filterByCityFormEl)
    if (state.breweries.length !== 0) {
        filterAsideEl.style.display = 'block'
    } else {
        filterAsideEl.style.display = 'none'
    }
}



function renderBreweryItem (brewery) {
    const liEl = document.createElement('li')
    breweriesListEl.append(liEl)

    const breweryTitle = document.createElement('h2')
    breweryTitle.textContent = brewery.name

    const typeDivEl = document.createElement('div')
    typeDivEl.setAttribute('class', 'type')
    typeDivEl.textContent = brewery.brewery_type

    const addressSectionEl = document.createElement('section')
    addressSectionEl.setAttribute('class', 'address')

    const addressTitleEl = document.createElement('h3')
    addressTitleEl.textContent = 'Address:'

    const addressFirstLine = document.createElement('p')
    addressFirstLine.textContent = brewery.street

    const addressSeccondLine = document.createElement('p')
    addressSeccondLine.innerHTML = `<strong>${brewery.city}, ${brewery.postal_code}</strong>`

    addressSectionEl.append(addressTitleEl, addressFirstLine, addressSeccondLine)

    const phoneSectionEl = document.createElement('section')
    phoneSectionEl.setAttribute('class', 'phone')
    phoneSectionEl.innerHTML = `<h3>Phone:</h3>
    <p>${brewery.phone}</p>`

    const linkEl = document.createElement('section')
    linkEl.setAttribute('class', 'link')

    const aEl = document.createElement('a')
    aEl.setAttribute('href', brewery.website_url)
    aEl.setAttribute('target', '_blank')
    aEl.textContent = 'Visit Website'

    linkEl.append(aEl)
    liEl.append(breweryTitle, typeDivEl, addressSectionEl, phoneSectionEl, linkEl)
    
}



function renderListSection() {
    if (state.breweries.length !== 0) {
        searchBreweriesSectionEl.style.display = 'block'
    } else {
        searchBreweriesSectionEl.style.display = 'none'
    }

    breweriesListEl.innerHTML = ''

    const breweriesToDisplay = getBreweriesToDisplay()

    for (const brewery of breweriesToDisplay) {
        renderBreweryItem(brewery)
      }
}

function render() {
    renderFilerSection()
    renderListSection()
}

// add to state
function listenToSelectStateForm() {
    selectStateForm.addEventListener('submit', function (event) {
        event.preventDefault()
        state.selectedState = selectStateForm['select-state'].value

        fetchBreweriesByState(state.selectedState) // Promise<breweries>
            .then(function (breweries) {
                state.breweries = breweries
                state.selectedCities = []
                state.selectedBreweryType = ''
                state.search = ''
                render()
            })
    })
}

function listenToSearchForm() {
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault()

        state.search = searchForm.search.value
        render()
    })
}

function init() {
    render()
    listenToSelectStateForm()
    listenToSearchForm()
}

init()
