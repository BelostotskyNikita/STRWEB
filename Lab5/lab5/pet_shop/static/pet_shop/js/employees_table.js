(function() {
    let employeesData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 3;
    let currentSortColumn = null;
    let sortDirection = 'asc';
    let selectedEmployees = new Set();

    function showPreloader() {
        const preloader = document.createElement('div');
        preloader.className = 'preloader-container';
        preloader.id = 'employees-preloader';
        preloader.innerHTML = `
            <div class="preloader">
                <img src="/static/pet_shop/images/animation/loading.png" alt="Загрузка" class="preloader-image">
                <p class="preloader-text">Загрузка...</p>
            </div>
        `;
        document.body.appendChild(preloader);
    }

    function hidePreloader() {
        const preloader = document.getElementById('employees-preloader');
        if (preloader) {
            preloader.remove();
        }
    }

    function validateURL(url) {
        const urlPattern = /^https?:\/\/.+(\.php|\.html)$/;
        return urlPattern.test(url);
    }

    function validatePhone(phone) {
        const phonePattern = /^(\+375|8)\s?\(?\d{2}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
        return phonePattern.test(phone);
    }

    function validateInput(inputId, validator, validationMessageId) {
        const input = document.getElementById(inputId);
        const validationDiv = document.getElementById(validationMessageId);
        const value = input.value.trim();

        if (value === '') {
            input.classList.remove('invalid');
            validationDiv.textContent = '';
            validationDiv.className = 'validation-message';
            return false;
        }

        const isValid = validator(value);
        
        if (isValid) {
            input.classList.remove('invalid');
            validationDiv.textContent = 'Валидно';
            validationDiv.className = 'validation-message success';
        } else {
            input.classList.add('invalid');
            validationDiv.textContent = 'Невалидно';
            validationDiv.className = 'validation-message error';
        }

        return isValid;
    }

    function checkAllFieldsFilled() {
        const fullName = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const url = document.getElementById('url').value.trim();
        const description = document.getElementById('description').value.trim();

        const phoneValid = validatePhone(phone);
        const urlValid = validateURL(url);

        const allFilled = fullName && email && phone && url && description && phoneValid && urlValid;
        document.getElementById('submit-add-btn').disabled = !allFilled;
    }

    function loadEmployees() {
        showPreloader();
        fetch('/pet_shop/api/employees/')
            .then(response => response.json())
            .then(data => {
                employeesData = data.employees;
                filteredData = [...employeesData];
                renderTable();
                hidePreloader();
            })
            .catch(error => {
                console.error('Error loading employees:', error);
                hidePreloader();
            });
    }

    function renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        pageData.forEach((employee, index) => {
            const row = document.createElement('tr');
            row.dataset.employeeId = employee.id;
            row.dataset.originalIndex = startIndex + index;

            const isSelected = selectedEmployees.has(employee.id);
            if (isSelected) {
                row.classList.add('selected');
            }

            row.innerHTML = `
                <td class="checkbox-column">
                    <input type="checkbox" class="employee-checkbox" data-employee-id="${employee.id}" ${isSelected ? 'checked' : ''}>
                </td>
                <td>${escapeHtml(employee.full_name)}</td>
                <td>
                    ${employee.pic ? `<img src="${escapeHtml(employee.pic)}" alt="Photo" onerror="this.src='/static/pet_shop/images/logo/logo_light_blue.png'">` : '<span>Нет фото</span>'}
                </td>
                <td>${escapeHtml(employee.description)}</td>
                <td>${escapeHtml(employee.phone)}</td>
                <td>${escapeHtml(employee.email)}</td>
            `;

            row.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    showEmployeeDetails(employee);
                }
            });

            const checkbox = row.querySelector('.employee-checkbox');
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                toggleEmployeeSelection(employee.id, this.checked);
            });

            tbody.appendChild(row);
        });

        updatePagination();
        updatePremiumButton();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showEmployeeDetails(employee) {
        const infoDiv = document.getElementById('selected-employee-info');
        const detailsDiv = document.getElementById('employee-details');
        
        detailsDiv.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">ФИО:</span>
                <span class="detail-value">${escapeHtml(employee.full_name)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${escapeHtml(employee.email)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Телефон:</span>
                <span class="detail-value">${escapeHtml(employee.phone)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Описание работ:</span>
                <span class="detail-value">${escapeHtml(employee.description)}</span>
            </div>
            ${employee.pic ? `
            <div class="detail-item">
                <span class="detail-label">Фото:</span>
                <span class="detail-value">
                    <img src="${escapeHtml(employee.pic)}" alt="Photo" onerror="this.src='/static/pet_shop/images/logo/logo_light_blue.png'">
                </span>
            </div>
            ` : ''}
            ${employee.url ? `
            <div class="detail-item">
                <span class="detail-label">URL:</span>
                <span class="detail-value"><a href="${escapeHtml(employee.url)}" target="_blank">${escapeHtml(employee.url)}</a></span>
            </div>
            ` : ''}
        `;

        infoDiv.style.display = 'block';
    }

    function toggleEmployeeSelection(employeeId, isSelected) {
        if (isSelected) {
            selectedEmployees.add(employeeId);
        } else {
            selectedEmployees.delete(employeeId);
        }
        updatePremiumButton();
        renderTable();
    }

    function updatePremiumButton() {
        const premiumBtn = document.getElementById('premium-btn');
        premiumBtn.disabled = selectedEmployees.size === 0;
    }

    function sortTable(column) {
        if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            sortDirection = 'asc';
        }

        filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'pic') {
                aVal = aVal || '';
                bVal = bVal || '';
            } else {
                aVal = (aVal || '').toString().toLowerCase();
                bVal = (bVal || '').toString().toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        currentPage = 1;
        renderTable();
        updateSortIndicators();
    }

    function updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('asc', 'desc');
            if (th.dataset.sort === currentSortColumn) {
                th.classList.add(sortDirection);
            }
        });
    }

    function filterTable() {
        const searchText = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (searchText === '') {
            filteredData = [...employeesData];
        } else {
            filteredData = employeesData.filter(employee => {
                return (
                    (employee.full_name || '').toLowerCase().includes(searchText) ||
                    (employee.email || '').toLowerCase().includes(searchText) ||
                    (employee.phone || '').toLowerCase().includes(searchText) ||
                    (employee.description || '').toLowerCase().includes(searchText)
                );
            });
        }

        currentPage = 1;
        renderTable();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');

        pageInfo.textContent = `Страница ${currentPage} из ${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    }

    function goToPage(page) {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderTable();
        }
    }

    function addEmployee() {
        const fullName = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const url = document.getElementById('url').value.trim();
        const description = document.getElementById('description').value.trim();
        const picUrl = document.getElementById('pic_url').value.trim();

        const newEmployee = {
            id: Date.now(),
            full_name: fullName,
            email: email,
            phone: phone,
            url: url,
            description: description,
            pic: picUrl || ''
        };

        employeesData.push(newEmployee);
        filteredData = [...employeesData];
        
        document.getElementById('add-employee-form').reset();
        document.getElementById('phone-validation').textContent = '';
        document.getElementById('url-validation').textContent = '';
        document.getElementById('phone-validation').className = 'validation-message';
        document.getElementById('url-validation').className = 'validation-message';
        document.getElementById('full_name').classList.remove('invalid');
        document.getElementById('url').classList.remove('invalid');
        
        document.getElementById('add-form-container').style.display = 'none';
        currentPage = Math.ceil(employeesData.length / itemsPerPage);
        renderTable();
    }

    function generatePremiumText() {
        const selectedNames = [];
        selectedEmployees.forEach(employeeId => {
            const employee = employeesData.find(emp => emp.id === employeeId);
            if (employee) {
                const lastName = employee.full_name.split(' ')[0];
                selectedNames.push(lastName);
            }
        });

        const namesText = selectedNames.join(', ');
        const premiumText = `Поздравляем сотрудников: ${namesText} с получением премии за отличную работу! Желаем дальнейших успехов в профессиональной деятельности.`;
        
        document.getElementById('premium-text').textContent = premiumText;
        document.getElementById('premium-message').style.display = 'block';
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadEmployees();

        document.getElementById('add-employee-btn').addEventListener('click', function() {
            const formContainer = document.getElementById('add-form-container');
            formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('cancel-add-btn').addEventListener('click', function() {
            document.getElementById('add-form-container').style.display = 'none';
            document.getElementById('add-employee-form').reset();
            document.getElementById('phone-validation').textContent = '';
            document.getElementById('url-validation').textContent = '';
            document.getElementById('phone-validation').className = 'validation-message';
            document.getElementById('url-validation').className = 'validation-message';
            document.getElementById('full_name').classList.remove('invalid');
            document.getElementById('url').classList.remove('invalid');
        });

        document.getElementById('phone').addEventListener('input', function() {
            validateInput('phone', validatePhone, 'phone-validation');
            checkAllFieldsFilled();
        });

        document.getElementById('url').addEventListener('input', function() {
            validateInput('url', validateURL, 'url-validation');
            checkAllFieldsFilled();
        });

        document.getElementById('full_name').addEventListener('input', checkAllFieldsFilled);
        document.getElementById('email').addEventListener('input', checkAllFieldsFilled);
        document.getElementById('description').addEventListener('input', checkAllFieldsFilled);

        document.getElementById('add-employee-form').addEventListener('submit', function(e) {
            e.preventDefault();
            addEmployee();
        });

        document.getElementById('search-btn').addEventListener('click', function() {
            showPreloader();
            setTimeout(() => {
                filterTable();
                hidePreloader();
            }, 300);
        });

        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('search-btn').click();
            }
        });

        document.getElementById('prev-page-btn').addEventListener('click', function() {
            goToPage(currentPage - 1);
        });

        document.getElementById('next-page-btn').addEventListener('click', function() {
            goToPage(currentPage + 1);
        });

        document.getElementById('select-all-checkbox').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.employee-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const employeeId = parseInt(checkbox.dataset.employeeId);
                toggleEmployeeSelection(employeeId, this.checked);
            });
        });

        document.getElementById('premium-btn').addEventListener('click', function() {
            showPreloader();
            setTimeout(() => {
                generatePremiumText();
                hidePreloader();
            }, 300);
        });

        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', function() {
                showPreloader();
                setTimeout(() => {
                    sortTable(this.dataset.sort);
                    hidePreloader();
                }, 300);
            });
        });
    });
})();

