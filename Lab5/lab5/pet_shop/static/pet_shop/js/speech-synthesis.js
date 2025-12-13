(function() {
    let isSpeaking = false;
    let currentUtterance = null;
    let currentButton = null;
    const speechSynthesis = window.speechSynthesis;

    if (!speechSynthesis) {
        console.warn('Speech Synthesis API не поддерживается в этом браузере');
        const speechControls = document.querySelector('.speech-controls');
        if (speechControls) {
            speechControls.innerHTML = '<p style="color: #e74c3c;">Синтез речи не поддерживается вашим браузером</p>';
        }
        return;
    }

    function speakText(text, options = {}) {
        if (isSpeaking) {
            stopSpeaking();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.lang = options.lang || 'ru-RU';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = function() {
            isSpeaking = true;
            if (currentButton) {
                currentButton.classList.add('playing');
                currentButton.textContent = '⏸️ Озвучивается...';
            }
            updateSpeechControls();
        };

        utterance.onend = function() {
            isSpeaking = false;
            if (currentButton) {
                currentButton.classList.remove('playing');
                currentButton.textContent = '🔊 Озвучить';
            }
            currentButton = null;
            currentUtterance = null;
            updateSpeechControls();
        };

        utterance.onerror = function(event) {
            console.error('Ошибка синтеза речи:', event);
            isSpeaking = false;
            if (currentButton) {
                currentButton.classList.remove('playing');
                currentButton.textContent = '🔊 Озвучить';
            }
            currentButton = null;
            currentUtterance = null;
            updateSpeechControls();
            alert('Произошла ошибка при озвучивании текста');
        };

        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
        if (currentButton) {
            currentButton.classList.remove('playing');
            currentButton.textContent = '🔊 Озвучить';
        }
        currentButton = null;
        currentUtterance = null;
        updateSpeechControls();
    }

    function updateSpeechControls() {
        const toggleBtn = document.getElementById('speech-toggle-btn');
        const stopBtn = document.getElementById('stop-speech-btn');
        const speechIcon = document.getElementById('speech-icon');
        const speechText = document.getElementById('speech-text');

        if (isSpeaking) {
            if (toggleBtn) {
                toggleBtn.style.display = 'none';
            }
            if (stopBtn) {
                stopBtn.style.display = 'flex';
            }
        } else {
            if (toggleBtn) {
                toggleBtn.style.display = 'flex';
            }
            if (stopBtn) {
                stopBtn.style.display = 'none';
            }
            if (speechIcon) {
                speechIcon.textContent = '🔊';
            }
            if (speechText) {
                speechText.textContent = 'Включить озвучку';
            }
        }
    }

    function readAllNews() {
        const newsCards = document.querySelectorAll('.news-card');
        if (newsCards.length === 0) {
            alert('Нет новостей для озвучивания');
            return;
        }

        let allText = 'Последние новости. ';
        
        newsCards.forEach((card, index) => {
            const title = card.querySelector('.news-title-text')?.textContent || '';
            const text = card.querySelector('.news-text-full')?.textContent || 
                        card.querySelector('.news-text-preview')?.textContent || '';
            const date = card.querySelector('.news-date')?.textContent || '';
            
            const cleanText = text.replace(/\s+/g, ' ').trim();
            const cleanTitle = title.trim();
            
            allText += `Новость ${index + 1}. ${cleanTitle}. ${cleanText}. `;
        });

        speakText(allText);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const speechToggleBtn = document.getElementById('speech-toggle-btn');
        const stopSpeechBtn = document.getElementById('stop-speech-btn');
        const readNewsButtons = document.querySelectorAll('.read-news-btn');

        if (speechToggleBtn) {
            speechToggleBtn.addEventListener('click', function() {
                readAllNews();
            });
        }

        if (stopSpeechBtn) {
            stopSpeechBtn.addEventListener('click', function() {
                stopSpeaking();
            });
        }

        readNewsButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.classList.contains('playing')) {
                    stopSpeaking();
                    return;
                }

                const newsCard = this.closest('.news-card');
                const titleElement = newsCard?.querySelector('.news-title-text');
                const textElement = newsCard?.querySelector('.news-text-full') || 
                                  newsCard?.querySelector('.news-text-preview');
                
                if (!titleElement || !textElement) {
                    alert('Не удалось найти текст новости');
                    return;
                }
                
                const title = titleElement.textContent.trim();
                const text = textElement.textContent.replace(/\s+/g, ' ').trim();
                
                const textToSpeak = `${title}. ${text}`;
                
                currentButton = this;
                speakText(textToSpeak);
            });
        });

        window.addEventListener('beforeunload', function() {
            stopSpeaking();
        });
    });
})();

