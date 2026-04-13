window.addEventListener('DOMContentLoaded', function() {
    
	let tabs = document.querySelectorAll('.tabheader__item'),
		tabsContent = document.querySelectorAll('.tabcontent'),
		tabsParent = document.querySelector('.tabheader__items');

	function hideTabContent() {
        
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
	}

	function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }
    
    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if(target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    //timer
    const deadline = "2026-05-11";

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
              days = Math.floor (t/ (1000*60*60*24)),
              hours = Math.floor ((t/ (1000*60*60) % 24)),
              minutes = Math.floor ((t/ 1000 / 60) % 60),
              seconds = Math.floor ((t/ 1000) % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function setZero (num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock (selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        updateClock();
        
        function updateClock () {
            const t = getTimeRemaining(endtime);

              if (t.total <= 0) {
                clearInterval(timeInterval);
                days.innerHTML = 0;
                hours.innerHTML = 0;
                minutes.innerHTML = 0;
                seconds.innerHTML = 0;
                return;
            }

            days.innerHTML = setZero(t.days);
            hours.innerHTML = setZero(t.hours);
            minutes.innerHTML = setZero(t.minutes);
            seconds.innerHTML = setZero(t.seconds);
        }
    }

    setClock('.timer', deadline);

    //modal window
 //modal window
    const modalTrigger = document.querySelectorAll('[data-modal]');
    const modalWindow = document.querySelector('.modal');

    // Функция восстановления содержимого модалки
    function restoreModalContent() {
        const modal = document.querySelector('.modal');
        const modalContent = document.querySelector('.modal__content');
        const originalContent = modal.getAttribute('data-original-content');
        
        // Восстанавливаем форму, если текущее содержимое не является формой
        if (originalContent && modalContent.innerHTML !== originalContent) {
            modalContent.innerHTML = originalContent;
            
            // Перепривязываем обработчик формы
            const newForm = document.querySelector('.modal__content form');
            if (newForm) {
                attachFormHandler(newForm);
            }
        }
    }

    // Выносим обработчик формы в отдельную функцию
    function attachFormHandler(formElement) {
        // Проверяем, не привязан ли уже обработчик
        if (formElement.getAttribute('data-handler-attached')) return;
        
        formElement.setAttribute('data-handler-attached', 'true');
        
        formElement.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(formElement);
            const jsonData = JSON.stringify(Object.fromEntries(formData));
            
            showModalMessage('loading', 'Отправка...');
            
            try {
                const response = await fetch('https://simple-server-cumz.onrender.com/api/data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: jsonData
                });
                
                if (response.ok) {
                    showModalMessage('success', 'Спасибо! Скоро мы с вами свяжемся');
                    formElement.reset();
                    
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                } else {
                    throw new Error('Server error');
                }
                
            } catch (error) {
                console.error('Ошибка:', error);
                showModalMessage('error', 'Что-то пошло не так... Попробуйте позже');
                
                setTimeout(() => {
                    closeModal();
                }, 3000);
            }
        });
    }

    function openModal() {
        restoreModalContent(); // Восстанавливаем форму перед открытием
        modalWindow.classList.add('show');
        modalWindow.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearTimeout(modalTimerId);
    }

    function closeModal() {
        modalWindow.classList.add('hide');
        modalWindow.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Привязываем обработчик к существующей форме при загрузке страницы
    const initialForm = document.querySelector('.modal__content form');
    if (initialForm) {
        attachFormHandler(initialForm);
    }

    // Обработчики модалки
    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    const modalCloseBtn = document.querySelector('[data-close]');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    modalWindow.addEventListener('click', (e) => {
        if (e.target === modalWindow) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modalWindow.classList.contains('show')) {
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 5000);

    function showModalByScroll() {
        if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);

    // Функции для отображения сообщений в модалке
    function showModalMessage(type, message) {
        const modalContent = document.querySelector('.modal__content');
        
        // Сохраняем оригинальное содержимое, если нужно будет восстановить
        const modal = document.querySelector('.modal');
        if (!modal.hasAttribute('data-original-content')) {
            modal.setAttribute('data-original-content', modalContent.innerHTML);
        }
        
        // Очищаем и показываем сообщение
        modalContent.innerHTML = `
            <div class="modal-message ${type}">
                <div class="modal__close" data-close>×</div>
                <div class="modal-message__icon">
                    ${getIconByType(type)}
                </div>
                <div class="modal-message__text">${message}</div>
            </div>
        `;
        
        addModalMessageStyles();
    }

    function getIconByType(type) {
        switch(type) {
            case 'loading':
                return '<div class="spinner"></div>';
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            default:
                return '';
        }
    }

    function addModalMessageStyles() {
        if (document.querySelector('#modal-message-styles')) return;
        
        const styles = `
            <style id="modal-message-styles">
                .modal-message {
                    text-align: center;
                    padding: 40px 20px;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-message__icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .modal-message__text {
                    font-size: 18px;
                    line-height: 1.4;
                    color: #333;
                }
                
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .modal-message {
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    //использование классов
    class Card {
        constructor(src, alt, tittle, descr, price, parentSelector, ...classes){
            this.src = src;
            this.alt = alt;
            this.tittle = tittle;
            this.descr = descr;
            this.price = price;
            this.parent = document.querySelector(parentSelector);
            this.classes = classes;
            this.transfer = 27;
            this.changeToUAH();
        }
        changeToUAH() {
            this.price = this.price * this.transfer;
        }
        render() {
            const element = document.createElement('div');

            if(this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));  
            }
            
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.tittle}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    new Card(
        "img/tabs/vegy.jpg",
        "vegy",
        'Меню "Фитнес"',
        'Меню "Фитнес" - это новый подход к приготовлению блюд: больше свежих овощей и фруктов. Продукт активных и здоровых людей. Это абсолютно новый продукт с оптимальной ценой и высоким качеством!',
        9,
        '.menu__field .container',
    ).render();

    new Card(
        "img/tabs/elite.jpg",
        "elite",
        'Меню “Премиум”',
        'В меню “Премиум” мы используем не только красивый дизайн упаковки, но и качественное исполнение блюд. Красная рыба, морепродукты, фрукты - ресторанное меню без похода в ресторан!',
        14,
        '.menu__field .container',
    ).render();

    new Card(
        "img/tabs/post.jpg",
        "post",
        'Меню "Постное"',
        'Меню “Постное” - это тщательный подбор ингредиентов: полное отсутствие продуктов животного происхождения, молоко из миндаля, овса, кокоса или гречки, правильное количество белков за счет тофу и импортных вегетарианских стейков.',
        21,
        '.menu__field .container',
    ).render();
});


 