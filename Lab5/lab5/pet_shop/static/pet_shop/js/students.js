(function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    function StudentPrototype(firstName, lastName, className) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.className = className;
    }

    StudentPrototype.prototype.getFirstName = function() {
        return this.firstName;
    };

    StudentPrototype.prototype.setFirstName = function(firstName) {
        this.firstName = firstName;
    };

    StudentPrototype.prototype.getLastName = function() {
        return this.lastName;
    };

    StudentPrototype.prototype.setLastName = function(lastName) {
        this.lastName = lastName;
    };

    StudentPrototype.prototype.getClassName = function() {
        return this.className;
    };

    StudentPrototype.prototype.setClassName = function(className) {
        this.className = className;
    };

    StudentPrototype.prototype.addFromForm = function(formData) {
        this.firstName = formData.firstName;
        this.lastName = formData.lastName;
        this.className = formData.className;
    };

    StudentPrototype.prototype.display = function() {
        return `${this.firstName} ${this.lastName} (${this.className})`;
    };

    function ExtendedStudentPrototype(firstName, lastName, className, age) {
        StudentPrototype.call(this, firstName, lastName, className);
        this.age = age;
    }

    ExtendedStudentPrototype.prototype = Object.create(StudentPrototype.prototype);
    ExtendedStudentPrototype.prototype.constructor = ExtendedStudentPrototype;

    ExtendedStudentPrototype.prototype.getAge = function() {
        return this.age;
    };

    ExtendedStudentPrototype.prototype.setAge = function(age) {
        this.age = age;
    };

    ExtendedStudentPrototype.prototype.addFromForm = function(formData) {
        StudentPrototype.prototype.addFromForm.call(this, formData);
        this.age = formData.age;
    };

    ExtendedStudentPrototype.prototype.display = function() {
        return `${this.firstName} ${this.lastName} (${this.className}), возраст: ${this.age}`;
    };

    ExtendedStudentPrototype.prototype.findNamesakes = function(students) {
        const lastNameCount = {};
        const namesakes = [];

        students.forEach(student => {
            const lastName = student.getLastName();
            if (!lastNameCount[lastName]) {
                lastNameCount[lastName] = [];
            }
            lastNameCount[lastName].push(student);
        });

        for (const lastName in lastNameCount) {
            if (lastNameCount[lastName].length > 1) {
                namesakes.push({
                    lastName: lastName,
                    students: lastNameCount[lastName]
                });
            }
        }

        return namesakes;
    };

    ExtendedStudentPrototype.prototype.displayAll = function(students) {
        if (students.length === 0) {
            return '<p>Нет добавленных учеников</p>';
        }

        let html = '<div class="students-list">';
        students.forEach((student, index) => {
            html += `
                <div class="student-card">
                    <h4>Ученик #${index + 1}</h4>
                    <p><strong>Имя:</strong> ${student.getFirstName()}</p>
                    <p><strong>Фамилия:</strong> ${student.getLastName()}</p>
                    <p><strong>Класс:</strong> ${student.getClassName()}</p>
                    ${student.getAge ? `<p><strong>Возраст:</strong> ${student.getAge()}</p>` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    };

    ExtendedStudentPrototype.prototype.displayResult = function(namesakes) {
        if (namesakes.length === 0) {
            return '<div class="no-namesakes">Однофамильцев в школе не найдено</div>';
        }

        let html = '';
        namesakes.forEach(group => {
            html += `
                <div class="namesakes-result">
                    <h4>Однофамильцы: ${group.lastName}</h4>
                    <ul>
            `;
            group.students.forEach(student => {
                html += `<li>${student.display()}</li>`;
            });
            html += `
                    </ul>
                </div>
            `;
        });
        return html;
    };

    function initializePrototypeStudents() {
        const sampleStudents = [
            { firstName: 'Иван', lastName: 'Иванов', className: '10А', age: 16 },
            { firstName: 'Петр', lastName: 'Петров', className: '10Б', age: 16 },
            { firstName: 'Мария', lastName: 'Иванова', className: '11А', age: 17 },
            { firstName: 'Анна', lastName: 'Сидорова', className: '9В', age: 15 },
            { firstName: 'Дмитрий', lastName: 'Петров', className: '10А', age: 16 }
        ];

        prototypeStudents = sampleStudents.map(data => {
            return new ExtendedStudentPrototype(
                data.firstName,
                data.lastName,
                data.className,
                data.age
            );
        });
    }

    let prototypeStudents = [];

    const prototypeForm = document.getElementById('prototype-student-form');
    const prototypeShowAll = document.getElementById('prototype-show-all');
    const prototypeFindNamesakes = document.getElementById('prototype-find-namesakes');
    const prototypeClear = document.getElementById('prototype-clear');
    const prototypeResults = document.getElementById('prototype-results');

    prototypeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const student = new ExtendedStudentPrototype(
            document.getElementById('prototype-firstname').value,
            document.getElementById('prototype-lastname').value,
            document.getElementById('prototype-class').value,
            parseInt(document.getElementById('prototype-age').value)
        );
        prototypeStudents.push(student);
        this.reset();
    });

    prototypeShowAll.addEventListener('click', function() {
        const student = new ExtendedStudentPrototype('', '', '', 0);
        prototypeResults.innerHTML = student.displayAll(prototypeStudents);
    });

    prototypeFindNamesakes.addEventListener('click', function() {
        if (prototypeStudents.length === 0) {
            prototypeResults.innerHTML = '<p>Добавьте учеников для поиска однофамильцев</p>';
            return;
        }
        const student = new ExtendedStudentPrototype('', '', '', 0);
        const namesakes = student.findNamesakes(prototypeStudents);
        prototypeResults.innerHTML = student.displayResult(namesakes);
    });

    prototypeClear.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите очистить список учеников?')) {
            prototypeStudents = [];
            prototypeResults.innerHTML = '';
        }
    });

    class Student {
        constructor(firstName, lastName, className) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.className = className;
        }

        getFirstName() {
            return this.firstName;
        }

        setFirstName(firstName) {
            this.firstName = firstName;
        }

        getLastName() {
            return this.lastName;
        }

        setLastName(lastName) {
            this.lastName = lastName;
        }

        getClassName() {
            return this.className;
        }

        setClassName(className) {
            this.className = className;
        }

        addFromForm(formData) {
            this.firstName = formData.firstName;
            this.lastName = formData.lastName;
            this.className = formData.className;
        }

        display() {
            return `${this.firstName} ${this.lastName} (${this.className})`;
        }
    }

    class ExtendedStudent extends Student {
        constructor(firstName, lastName, className, age) {
            super(firstName, lastName, className);
            this.age = age;
        }

        getAge() {
            return this.age;
        }

        setAge(age) {
            this.age = age;
        }

        addFromForm(formData) {
            super.addFromForm(formData);
            this.age = formData.age;
        }

        display() {
            return `${this.firstName} ${this.lastName} (${this.className}), возраст: ${this.age}`;
        }

        findNamesakes(students) {
            const lastNameCount = {};
            const namesakes = [];

            students.forEach(student => {
                const lastName = student.getLastName();
                if (!lastNameCount[lastName]) {
                    lastNameCount[lastName] = [];
                }
                lastNameCount[lastName].push(student);
            });

            for (const lastName in lastNameCount) {
                if (lastNameCount[lastName].length > 1) {
                    namesakes.push({
                        lastName: lastName,
                        students: lastNameCount[lastName]
                    });
                }
            }

            return namesakes;
        }

        displayAll(students) {
            if (students.length === 0) {
                return '<p>Нет добавленных учеников</p>';
            }

            let html = '<div class="students-list">';
            students.forEach((student, index) => {
                html += `
                    <div class="student-card">
                        <h4>Ученик #${index + 1}</h4>
                        <p><strong>Имя:</strong> ${student.getFirstName()}</p>
                        <p><strong>Фамилия:</strong> ${student.getLastName()}</p>
                        <p><strong>Класс:</strong> ${student.getClassName()}</p>
                        ${student.getAge ? `<p><strong>Возраст:</strong> ${student.getAge()}</p>` : ''}
                    </div>
                `;
            });
            html += '</div>';
            return html;
        }

        displayResult(namesakes) {
            if (namesakes.length === 0) {
                return '<div class="no-namesakes">Однофамильцев в школе не найдено</div>';
            }

            let html = '';
            namesakes.forEach(group => {
                html += `
                    <div class="namesakes-result">
                        <h4>Однофамильцы: ${group.lastName}</h4>
                        <ul>
                `;
                group.students.forEach(student => {
                    html += `<li>${student.display()}</li>`;
                });
                html += `
                        </ul>
                    </div>
                `;
            });
            return html;
        }
    }

    function initializeClassStudents() {
        const sampleStudents = [
            { firstName: 'Елена', lastName: 'Козлова', className: '9А', age: 15 },
            { firstName: 'Сергей', lastName: 'Морозов', className: '11Б', age: 17 },
            { firstName: 'Ольга', lastName: 'Козлова', className: '10В', age: 16 },
            { firstName: 'Алексей', lastName: 'Волков', className: '9Б', age: 15 },
            { firstName: 'Татьяна', lastName: 'Морозова', className: '11А', age: 17 }
        ];

        classStudents = sampleStudents.map(data => {
            return new ExtendedStudent(
                data.firstName,
                data.lastName,
                data.className,
                data.age
            );
        });
    }

    let classStudents = [];

    const classForm = document.getElementById('class-student-form');
    const classShowAll = document.getElementById('class-show-all');
    const classFindNamesakes = document.getElementById('class-find-namesakes');
    const classClear = document.getElementById('class-clear');
    const classResults = document.getElementById('class-results');

    classForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const student = new ExtendedStudent(
            document.getElementById('class-firstname').value,
            document.getElementById('class-lastname').value,
            document.getElementById('class-class').value,
            parseInt(document.getElementById('class-age').value)
        );
        classStudents.push(student);
        this.reset();
    });

    classShowAll.addEventListener('click', function() {
        const student = new ExtendedStudent('', '', '', 0);
        classResults.innerHTML = student.displayAll(classStudents);
    });

    classFindNamesakes.addEventListener('click', function() {
        if (classStudents.length === 0) {
            classResults.innerHTML = '<p>Добавьте учеников для поиска однофамильцев</p>';
            return;
        }
        const student = new ExtendedStudent('', '', '', 0);
        const namesakes = student.findNamesakes(classStudents);
        classResults.innerHTML = student.displayResult(namesakes);
    });

    classClear.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите очистить список учеников?')) {
            classStudents = [];
            classResults.innerHTML = '';
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        initializePrototypeStudents();
        initializeClassStudents();
    });
})();

