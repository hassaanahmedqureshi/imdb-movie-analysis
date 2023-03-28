$(document).ready(function () {
    let compare_average = false
    setTimeout(() => {

    }, 200)
    $('.graph_container').height($('.graph_container').width())
    $('.map-container').height($('.map-container').width())

    // initialize noui
    var stepSlider = document.getElementById('slider-snap');

    noUiSlider.create(stepSlider, {
        start: [1980, 2020],
        connect: true,
        step: 1,
        range: {
            'min': 1980,
            'max': 2020
        }
    });

    var snapValues = [
        document.getElementById('year-start'),
        document.getElementById('year-end')
    ];

    stepSlider.noUiSlider.on('update', function (values, handle) {
        snapValues[handle].innerHTML = Math.floor(values[handle]);
    });

    // get ratings from back-end and set it in front-end
    fetch('/ratings')
        .then(response => response.json())
        .then(data => {
            // Update the HTML with the ratings data
            const ratingsDiv = document.getElementById('ratings');
            ratingsDiv.innerHTML = `${data.ratings.map(rating => `<div class="col-md-6"><div class="form-check">
            <input class="form-check-input" type="checkbox" value="${rating}">
            <label class="form-check-label" for="${rating}">
            ${rating}
            </label>
        </div></div>`).join('')}`

        })
        .catch(error => console.error(error));

    // get ratings from back-end and set it in front-end
    fetch('/genres')
        .then(response => response.json())
        .then(data => {
            // Update the HTML with the genres data
            const ratingsDiv = document.getElementById('genres');
            ratingsDiv.innerHTML = `${data.genres.map(genres => `<div class="col-md-6"> <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${genres}">
            <label class="form-check-label" for="${genres}">
            ${genres}
            </label>
            </div></div>`).join('')}`

        })
        .catch(error => console.error(error));

    $('#generate_graph').on('click', () => {
        let filters = {
            'ratings': '',
            'genres': '',
            'startYear': '',
            'endYear': '',
            'firstComparison': '',
            'secondComparison': '',
            'compareAverage': ''
        }
        let validated;
        let selectedRatings = [];
        let selectedGenres = [];
        let comparison1;
        let comparison2;
        let compareAverage;


        $('#ratings input').each(function (index, rating) {
            if (rating.checked === true) {
                selectedRatings.push(rating.value)
            }
        })

        $('#genres input').each(function (index, genre) {
            if (genre.checked === true) {
                selectedGenres.push(genre.value)
            }
        })

        $('#comparison input').each(function (index, comparison) {
            if (comparison.checked === true) {
                validated = true
                comparison1 = comparison.getAttribute('val1')
                comparison2 = comparison.getAttribute('val2')
            }
        })

        $('#calculate-average input').each(function (index, average) {
            compareAverage = average.checked
        })

        filters.ratings = selectedRatings;
        filters.genres = selectedGenres;
        filters.startYear = $('#year-start')[0].innerHTML;
        filters.endYear = $('#year-end')[0].innerHTML;
        filters.firstComparison = comparison1;
        filters.secondComparison = comparison2;
        filters.compareAverage = compareAverage;

        window.yAxisLabel = comparison1
        window.xAxisLabel = comparison2

        compare_average = compareAverage

        if (validated) {
            fetch('/movie-filters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            })
                .then(response => response.json())
                .then(responseText => {
                    makeScatterPlot(JSON.parse(responseText), compareAverage)
                })
                .catch(error => console.error(error));

            document.querySelector('#validation').textContent = ""
        } else {
            document.querySelector('#validation').textContent = "*Please select a comparison"
        }

    })
});