(function() {
    const birthdayInput = document.getElementById('birthday');
    const ageMessage = document.getElementById('age-message');
    const submitBtn = document.getElementById('submit-btn');
    const form = document.querySelector('form');

    function getDayOfWeek(date) {
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        return days[date.getDay()];
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    function validateBirthday() {
        const birthdayValue = birthdayInput.value;
        
        if (!birthdayValue) {
            ageMessage.textContent = '';
            ageMessage.className = 'age-message';
            submitBtn.disabled = false;
            return;
        }

        const birthDate = new Date(birthdayValue);
        const age = calculateAge(birthDate);
        const dayOfWeek = getDayOfWeek(birthDate);

        if (age >= 18) {
            ageMessage.textContent = `Вам ${age} лет. Вы родились в ${dayOfWeek}.`;
            ageMessage.className = 'age-message success';
            submitBtn.disabled = false;
        } else {
            ageMessage.textContent = `Вам ${age} лет.`;
            ageMessage.className = 'age-message warning';
            submitBtn.disabled = true;
            
            alert('Для использования сайта необходимо разрешение родителей, так как вы несовершеннолетний.');
        }
    }

    birthdayInput.addEventListener('change', validateBirthday);
    birthdayInput.addEventListener('input', validateBirthday);

    form.addEventListener('submit', function(e) {
        const birthdayValue = birthdayInput.value;
        
        if (!birthdayValue) {
            e.preventDefault();
            alert('Пожалуйста, укажите дату рождения.');
            return;
        }

        const birthDate = new Date(birthdayValue);
        const age = calculateAge(birthDate);

        if (age < 18) {
            e.preventDefault();
            alert('Для использования сайта необходимо разрешение родителей, так как вы несовершеннолетний.');
            return;
        }
    });
})();

