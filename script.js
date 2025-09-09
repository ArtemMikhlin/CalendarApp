document.addEventListener('DOMContentLoaded', async function() {
    const calendarEl = document.getElementById('calendar');
    const yearViewEl = document.getElementById('yearView');
    const categoryFilter = document.getElementById('categoryFilter');
    const apiUrl = 'https://inforestsbotapi.onrender.com'; // Убедись, что адрес точный

    console.log('Попытка загрузки категорий с:', `${apiUrl}/tours/categories`);
    try {
        const response = await fetch(`${apiUrl}/tours/categories`);
        console.log('Ответ от /tours/categories:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();
        console.log('Категории:', categories);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error.message);
    }

    let events = [];
    async function fetchEvents() {
        const category = categoryFilter.value;
        console.log('Попытка загрузки событий с:', `${apiUrl}/tours/dates?category=${encodeURIComponent(category)}`);
        try {
            const response = await fetch(`${apiUrl}/tours/dates?category=${encodeURIComponent(category)}`);
            console.log('Ответ от /tours/dates:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            events = await response.json();
            console.log('События:', events);
            return events;
        } catch (error) {
            console.error('Ошибка при загрузке событий:', error.message);
            return [];
        }
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function(fetchInfo, successCallback, failureCallback) {
            const fetchedEvents = await fetchEvents();
            successCallback(fetchedEvents);
        },
        eventClick: function(info) {
            const tourName = info.event.title;
            const shift = info.event.extendedProps.shift;
            const price = info.event.extendedProps.price;
            const places = info.event.extendedProps.places;
            console.log('Выбрано событие:', { tourName, shift, price, places });
        },
        eventDidMount: function(info) {
            const category = info.event.extendedProps.category;
            if (category === 'серфинг') {
                info.el.style.backgroundColor = '#007bff';
            } else if (category === 'Сплавы') {
                info.el.style.backgroundColor = '#28a745';
            }
        }
    });
    calendar.render();

    async function renderYearView() {
        yearViewEl.innerHTML = '';
        const fetchedEvents = await fetchEvents();
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        months.forEach((month, index) => {
            const monthEvents = fetchedEvents.filter(event => {
                const startDate = new Date(event.start);
                return startDate.getMonth() === index;
            });

            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-container';
            monthContainer.innerHTML = `<h3>${month}</h3>`;
            monthEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = `event ${event.extendedProps.category.toLowerCase()}`;
                eventEl.textContent = `${event.title} (${event.extendedProps.shift})`;
                eventEl.onclick = () => {
                    console.log('Выбрано событие:', {
                        tourName: event.title,
                        shift: event.extendedProps.shift,
                        price: event.extendedProps.price,
                        places: event.extendedProps.places
                    });
                };
                monthContainer.appendChild(eventEl);
            });
            yearViewEl.appendChild(monthContainer);
        });
    }

    window.filterEvents = function() {
        console.log('Фильтрация событий по категории:', categoryFilter.value);
        calendar.refetchEvents();
        if (yearViewEl.style.display === 'block') {
            renderYearView();
        }
    };

    window.switchView = function(view) {
        console.log('Переключение на вид:', view);
        if (view === 'dayGridMonth') {
            calendarEl.style.display = 'block';
            yearViewEl.style.display = 'none';
            calendar.changeView('dayGridMonth');
        } else if (view === 'year') {
            calendarEl.style.display = 'none';
            yearViewEl.style.display = 'block';
            renderYearView();
        }
    };
});