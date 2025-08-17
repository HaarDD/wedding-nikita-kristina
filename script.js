// Основной JavaScript для свадебного сайта
document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализация всех компонентов
    initMusicPlayer();
    initRSVPForm();
    initAnimations();
    initScrollLogo();
    initPhotoColorAnimation();
    initCustomCalendarButton();
    
    
    // Музыкальный плеер
    function initMusicPlayer() {
        const musicBtn = document.getElementById('musicBtn');
        const audio = document.getElementById('backgroundMusic');
        let isPlaying = false;
        
        // Устанавливаем небольшую громкость (10% от максимальной)
        audio.volume = 0.1;
        
        // Автоматически запускаем музыку при загрузке страницы
        setTimeout(() => {
            audio.play().then(() => {
                musicBtn.classList.add('playing');
                musicBtn.textContent = '❚❚';
                isPlaying = true;
            }).catch(function(error) {
                console.log('Автозапуск музыки заблокирован браузером:', error);
                // Если автозапуск заблокирован, оставляем кнопку для ручного запуска
            });
        }, 1000); // Задержка в 1 секунду для лучшей совместимости
        
        musicBtn.addEventListener('click', function() {
            if (isPlaying) {
                audio.pause();
                musicBtn.classList.remove('playing');
                musicBtn.textContent = '♪';
                isPlaying = false;
            } else {
                audio.play().catch(function(error) {
                    console.log('Ошибка воспроизведения музыки:', error);
                });
                musicBtn.classList.add('playing');
                musicBtn.textContent = '❚❚';
                isPlaying = true;
            }
        });
        
        // Отслеживаем состояние воспроизведения
        audio.addEventListener('ended', function() {
            musicBtn.classList.remove('playing');
            musicBtn.textContent = '♪';
            isPlaying = false;
        });
    }
    
    // RSVP форма
    function initRSVPForm() {
        const form = document.getElementById('rsvpForm');
        const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        const guestsGroup = document.getElementById('guestsGroup');
        const guestNamesGroup = document.getElementById('guestNamesGroup');
        const guestsSelect = document.getElementById('guests');
        
        // Показываем/скрываем поля в зависимости от ответа
        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'yes') {
                    guestsGroup.classList.add('show');
                    // Проверяем количество гостей и показываем поле имен только если больше 1
                    if (guestsSelect.value > 1) {
                        guestNamesGroup.classList.add('show');
                    } else {
                        guestNamesGroup.classList.remove('show');
                    }
                } else {
                    guestsGroup.classList.remove('show');
                    guestNamesGroup.classList.remove('show');
                }
            });
        });
        
        // Показываем поле для имен если выбрано больше 1 человека
        guestsSelect.addEventListener('change', function() {
            if (this.value > 1) {
                guestNamesGroup.classList.add('show');
            } else {
                guestNamesGroup.classList.remove('show');
            }
        });
        
        // Проверяем состояние формы при загрузке страницы
        function checkFormState() {
            // Проверяем выбран ли "да" при загрузке
            const yesRadio = document.querySelector('input[name="attendance"][value="yes"]');
            if (yesRadio && yesRadio.checked) {
                guestsGroup.classList.add('show');
                // Проверяем количество гостей при загрузке
                if (guestsSelect.value > 1) {
                    guestNamesGroup.classList.add('show');
                } else {
                    guestNamesGroup.classList.remove('show');
                }
            } else {
                // Если не выбран "да", скрываем все дополнительные поля
                guestsGroup.classList.remove('show');
                guestNamesGroup.classList.remove('show');
            }
        }
        
        // Вызываем проверку при загрузке
        checkFormState();
        
        // Отправка формы в Google Sheets
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const name = formData.get('name');
            
            // Проверяем обязательные поля
            if (!name || name.trim() === '') {
                showErrorMessage('Пожалуйста, укажите ваше имя');
                return;
            }
            
            const attendance = formData.get('attendance');
            if (!attendance) {
                showErrorMessage('Пожалуйста, выберите вариант присутствия');
                return;
            }
            
            // Если выбрано "да" и больше 1 человека, проверяем имена
            if (attendance === 'yes') {
                const guests = formData.get('guests') || '1';
                const guestNames = formData.get('guestNames') || '';
                
                if (parseInt(guests) > 1 && (!guestNames || guestNames.trim() === '')) {
                    showErrorMessage('Пожалуйста, укажите имена сопровождающих');
                    return;
                }
            }
            
            const data = {
                name: name,
                attendance: formData.get('attendance'),
                guests: formData.get('guests') || '1',
                guestNames: formData.get('guestNames') || '',
                message: formData.get('message') || '',
                timestamp: new Date().toLocaleString('ru-RU')
            };
            
            // Отправляем данные через Google Apps Script
            // Замените URL на ваш реальный URL Google Apps Script
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxmebbc589CD5ZQuyG50Yfy_v9IOTWatUigB31rQ-bF-dSxmJNXjb8vTq4XttQaaEiJ/exec';
            
            // Отправляем как FormData для лучшей совместимости
            const formDataToSend = new FormData();
            formDataToSend.append('name', data.name);
            formDataToSend.append('attendance', data.attendance);
            formDataToSend.append('guests', data.guests);
            formDataToSend.append('guestNames', data.guestNames);
            formDataToSend.append('message', data.message);
            formDataToSend.append('timestamp', data.timestamp);
            
            fetch(scriptURL, {
                method: 'POST',
                body: formDataToSend
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                return response.text(); // Сначала получаем текст
            })
            .then(responseText => {
                console.log('Response text:', responseText);
                try {
                    const result = JSON.parse(responseText);
                    console.log('Parsed result:', result);
                    if (result.status === 'success') {
                        showSuccessMessage();
                        form.reset();
                        guestsGroup.classList.remove('show');
                        guestNamesGroup.classList.remove('show');
                    } else {
                        console.error('Script returned error:', result.message);
                        showErrorMessage();
                    }
                } catch (parseError) {
                    console.error('Failed to parse response as JSON:', parseError);
                    console.error('Response was:', responseText);
                    showErrorMessage();
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                showErrorMessage();
            });
        });
        
        function showSuccessMessage() {
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'ОТПРАВЛЕНО!';
            submitBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }
        
        function showErrorMessage(message = 'ОШИБКА! ПОПРОБУЙТЕ ЕЩЕ РАЗ') {
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = message;
            submitBtn.style.background = '#f44336';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }
    }
    
    // Анимации при скролле
    function initAnimations() {
        const sections = document.querySelectorAll('.section');
        
        // Intersection Observer для анимаций при появлении
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Исключаем блоки приглашения, фото-локации, timing и rsvp из всех анимаций
                    if (entry.target.id !== 'invitation-section' && entry.target.id !== 'photo-location-section' && entry.target.id !== 'timing-section' && entry.target.id !== 'rsvp-section') {
                        entry.target.classList.add('animate');
                        
                        // Добавляем специальные анимации для разных элементов
                        const content = entry.target.querySelector('.section-content');
                        if (content) {
                            content.style.animation = 'fadeInUp 0.8s ease-out forwards';
                        }
                    }
                    
                    // Анимация даты и имен
                    if (entry.target.id === 'date-and-names-section') {
                        animateDateAndNames();
                    }
                    
                    // Анимация приглашения отключена
                    // if (entry.target.id === 'invitation-section') {
                    //     animateInvitation();
                    // }
                    
                    // Анимация timing
                    if (entry.target.id === 'timing-section') {
                        animateTiming();
                    }
                    
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            observer.observe(section);
        });
        
        // Анимация даты и имен
        function animateDateAndNames() {
            // Анимация чисел даты - плавно слева
            const numbers = document.querySelectorAll('.date-number');
            const clickIcon = document.querySelector('.click-icon');
            
            numbers.forEach((number, index) => {
                setTimeout(() => {
                    number.classList.add('animate');
                }, index * 300); // Задержка между цифрами
            });
            
            // Анимация иконки после всех цифр
            setTimeout(() => {
                const clickIconImg = document.querySelector('.click-icon-img');
                if (clickIconImg) {
                    clickIconImg.style.animation = 'bounce 2s infinite';
                }
            }, 900); // После всех цифр (3 * 300ms)
            
            // Анимация имен - все вместе, быстро
            const names = document.querySelectorAll('.main-names');
            const divider = document.querySelector('.names-divider');
            
            setTimeout(() => {
                // Все элементы появляются одновременно
                names.forEach(name => {
                    name.classList.add('animate');
                });
                divider.classList.add('animate');
            }, 1000); // Раньше и быстрее
        }
        
        
        // Анимация timing
        function animateTiming() {
            const items = document.querySelectorAll('.timing-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'slideInFromLeft 0.6s ease-out forwards';
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(-50px)';
                }, index * 150);
            });
        }
        
    }
    
    
    
    // Дополнительные CSS анимации через JavaScript
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInFromSide {
            0% { transform: translateX(var(--start-x, -100px)); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInFromLeft {
            0% { transform: translateX(-50px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
        
        .timing-item {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
    
    // Предзагрузка изображений
    function preloadImages() {
        const images = ['images/wedding-photo.jpg', 'images/logo-lite.png', 'images/logo-full.png', 'images/click-icon.png'];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    preloadImages();
    
    
    // Логика переключения логотипов при скролле
    function initScrollLogo() {
        const navbar = document.getElementById('navbar');
        const block2 = document.getElementById('invitation-section');
        let isScrolled = false;
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const block2Top = block2.offsetTop - 100; // Немного раньше для плавности
            
            if (scrollTop >= block2Top && !isScrolled) {
                navbar.classList.add('scrolled');
                isScrolled = true;
            } else if (scrollTop < block2Top && isScrolled) {
                navbar.classList.remove('scrolled');
                isScrolled = false;
            }
        }
        
        // Отслеживаем скролл с throttling для производительности
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    // Анимация цвета фото при полной видимости
    function initPhotoColorAnimation() {
        const weddingPhoto = document.querySelector('.wedding-photo');
        if (!weddingPhoto) return;
        
        // Создаем observer для отслеживания полной видимости фото
        const photoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                    // Фото полностью видно - делаем цветным
                    entry.target.classList.add('fully-visible');
                } else {
                    // Фото частично скрыто - делаем черно-белым
                    entry.target.classList.remove('fully-visible');
                }
            });
        }, {
            threshold: 0.7, // Срабатывает только когда элемент видим на 100%
            rootMargin: '0px'
        });
        
        photoObserver.observe(weddingPhoto);
    }
    
    // Кастомная кнопка календаря
    function initCustomCalendarButton() {
        const config = {
            name: "Свадьба Никиты и Кристины",
            description: "Приглашаем вас разделить с нами день свадьбы!",
            startDate: "2025-10-11",
            startTime: "15:00",
            endTime: "23:00",
            timeZone: "Europe/Minsk",
            location: "г. Пинск, ул. Слободская 8, Банкетный зал \"Жемчужный\"",
            options: ["Apple", "Google", "iCal"],
            listStyle: "modal",
            language: "ru",
            customLabels: {
                "close": "Закрыть"
            }
        };
        
        const button = document.getElementById('calendar-trigger');
        if (button) {
            button.addEventListener('click', function() {
                // Добавляем анимацию клика
                const clickIconImg = button.querySelector('.click-icon-img');
                const saveText = document.querySelector('.save-date-text');
                
                if (clickIconImg) {
                    clickIconImg.style.animation = 'none';
                    clickIconImg.style.transform = 'scale(1.3)';
                }
                saveText.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    if (clickIconImg) {
                        clickIconImg.style.animation = 'bounce 2s infinite';
                        clickIconImg.style.transform = '';
                    }
                    saveText.style.transform = '';
                }, 300);
                
                // Вызываем календарь
                if (typeof atcb_action !== 'undefined') {
                    atcb_action(config, button);
                }
            });
        }
    }
});


// Функция уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--black);
        color: var(--white);
        padding: 15px 25px;
        border-radius: 5px;
        font-family: 'Playfair Display', serif;
        font-size: 16px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}