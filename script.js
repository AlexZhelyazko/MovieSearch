let array_of_slides = [];
let page_to_load = 0;
let current_word = '';
let wrong_word = '';
const error_text = document.getElementById('error-text');
const loader = document.getElementById('loader');
var swiper = new Swiper('.swiper-container', {
    grabCursor: true,
    centeredSlides: false,
    slidesPerView: 'auto',
    CSSWidthAndHeight: true,
    spaceBetween:40,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
})
swiper.on('slideChange',function () {
    if(swiper.activeIndex === 4 + 10 * (page_to_load - 1)){
        main(page_to_load + 1, current_word, false);
    }
})
async function getTranslation(word) {
    const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200422T162640Z.ef1ea1591166b847.dfa1ff8069ce0458e76505742f68d7696deb893d&text= ${word} &lang=ru-en`;
    const res = await fetch(url);
    const data = await res.json();
    let translation = data.text.toString().trim();
    return translation;
}
main(1, 'flame', false);
current_word = 'flame';

async function main(page, word, refresh) {
    let ids_and_images = await getMovieTitle(page, word, refresh);
    let ready_objects = await getRating(ids_and_images);
    if (refresh === true) {
        refreshCards();
    }    createCard(ready_objects);
    console.log('omg...');
    loader.style.display='none';
    return true;
}

async function getMovieTitle(page, word, refresh) {
    const url = `https://www.omdbapi.com/?s=${word}&page=${page}&apikey=b35d7bcc`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response !== 'False') {
        let arr = [];
        for (let i = 0; i < data.Search.length; i++) {
            let obj = {};
            obj.id = data.Search[i].imdbID;
            obj.image = data.Search[i].Poster;
            if(obj.image === 'N/A')
                obj.image = 'assets/unnamed.jpg';
            arr.push(obj);
        }
        current_word = word;
        page_to_load++;
        error_text.innerText = '';
        return arr;
    }
    else {
        wrong_word = word;
        error_text.innerText = `No results for "${wrong_word}"`;
    }
}
async function getRating(arr) {
    for (let i = 0; i < arr.length; i++) {
        const url = `https://www.omdbapi.com/?i=${arr[i].id}&apikey=b35d7bcc`;
        const res = await fetch(url);
        const data = await res.json();
        arr[i].title = data.Title;
        arr[i].year = data.Year;
        arr[i].length = data.Runtime;
        arr[i].country = data.Country;
        arr[i].rating = data.imdbRating;
    }
    return arr;
}
const createCard = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        const slide_top = document.createElement('div');
        slide_top.classList.add('poster-top');
        slide_top.style.backgroundImage = `url('${arr[i].image}')`;
        const slide_bottom = document.createElement('div');
        slide_bottom.classList.add('poster-bottom');
        const link_name = document.createElement('div');
        link_name.classList.add('link-name');
        const name = document.createElement('a');
        name.innerText = arr[i].title;
        name.href = `https://www.imdb.com/title/${arr[i].id}/?ref_=nv_sr_srsg_0`;

        const data = document.createElement('div');
        data.classList.add('data-block');

        const date = document.createElement('div');
        const date_1 = document.createElement('p');
        date_1.innerText = 'Year';
        const date_2 = document.createElement('p');
        date_2.innerText = arr[i].year;

        const length = document.createElement('div');
        const length_1 = document.createElement('p');
        length_1.innerText = 'Length';
        const length_2 = document.createElement('p');
        length_2.innerText = arr[i].length;

        const land = document.createElement('div');
        const land_1 = document.createElement('p');
        land_1.innerText = 'Rating';
        const land_2 = document.createElement('p');
        land_2.innerText = arr[i].rating;

        const stars = document.createElement('div');
        stars.classList.add('stars');
        const star_1 = document.createElement('div');
        star_1.innerText = '★';
        const star_2 = document.createElement('div');
        star_2.innerText = '★';
        const star_3 = document.createElement('div');
        star_3.innerText = '★';
        const star_4 = document.createElement('div');
        star_4.innerText = '★';
        const star_5 = document.createElement('div');
        star_5.innerText = '★';

        slide.append(slide_top);
        slide.append(slide_bottom);
        slide_bottom.append(link_name);
        link_name.append(name);
        slide_bottom.append(data);
        slide_bottom.append(stars);
        stars.append(star_1);
        stars.append(star_2);
        stars.append(star_3);
        stars.append(star_4);
        stars.append(star_5);
        data.append(date);
        date.append(date_1);
        date.append(date_2);
        data.append(length);
        length.append(length_1);
        length.append(length_2);
        data.append(land);
        land.append(land_1);
        land.append(land_2);
        array_of_slides.push(slide);
        swiper.appendSlide(slide);
        countRate(arr[i].rating, stars);
    }
}


document.getElementById('search').addEventListener('input', function () {
    let words = document.getElementById('search').value;
    if (words.length > 0) {
        document.getElementById('cross-icon').style.visibility = 'visible';
    }
    else {
        document.getElementById('cross-icon').style.visibility = 'hidden';
    }
})

document.getElementById('cross-icon').addEventListener('click', function () {
    document.getElementById('search').value = '';
    document.getElementById('cross-icon').style.visibility = 'hidden';
})
document.getElementById('search-icon').addEventListener('click', function () {
    search();
})
window.addEventListener('keypress', function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        search();
    }
}, false);
async function search() {
    loader.style.display = 'inline-flex';
    let text = document.getElementById('search').value;
    if (/[а-яА-ЯЁё]/.test(text)) {
        let translation = await getTranslation(text);
        let done = await main(1,translation,true);
        error_text.innerText = `Showing results for "${text}"`
    }
    else {
        main(1, text, true);
    }
}
const countRate = (rate, arr) => {
    let stars = Math.floor(rate) / 2;
    let yellow_stars = Array.from(arr.childNodes);
    for (let i = 0; i < stars; i++) {
        yellow_stars[i].style.color = "rgb(235,139,43)";
    }
}
const refreshCards = () => {
    page_to_load = 0;
    swiper.removeAllSlides();
    array_of_slides = [];
    swiper.update();
}