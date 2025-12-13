(function() {
    let fieldCounter = 0;
    const STORAGE_KEY = 'form_generator_fields';
    const fieldsContainer = document.getElementById('fields-container');
    const generateBtn = document.getElementById('generate-btn');

    function generateField() {
        fieldCounter++;
        const fieldId = `field-${fieldCounter}`;
        
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'field-wrapper';
        fieldWrapper.id = fieldId;
        fieldWrapper.dataset.fieldId = fieldCounter;

        fieldWrapper.innerHTML = `
            <div class="field-header">
                <h3 class="field-title">Текстовое поле #${fieldCounter}</h3>
                <button class="delete-btn" onclick="deleteField(${fieldCounter})">Удалить</button>
            </div>
            <div class="field-content">
                <div class="attribute-group">
                    <label for="name-${fieldCounter}">Name:</label>
                    <input type="text" id="name-${fieldCounter}" class="attr-input" data-attr="name" placeholder="Введите name">
                </div>
                <div class="attribute-group">
                    <label for="placeholder-${fieldCounter}">Placeholder:</label>
                    <input type="text" id="placeholder-${fieldCounter}" class="attr-input" data-attr="placeholder" placeholder="Введите placeholder">
                </div>
                <div class="attribute-group">
                    <label for="maxlength-${fieldCounter}">Maxlength:</label>
                    <input type="number" id="maxlength-${fieldCounter}" class="attr-input" data-attr="maxlength" placeholder="Введите maxlength" min="0">
                </div>
                <div class="attribute-group">
                    <label for="value-${fieldCounter}">Value:</label>
                    <input type="text" id="value-${fieldCounter}" class="attr-input" data-attr="value" placeholder="Введите value">
                </div>
                <div class="attribute-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="readonly-${fieldCounter}" class="attr-checkbox" data-attr="readonly">
                        <label for="readonly-${fieldCounter}">Readonly</label>
                    </div>
                </div>
                <div class="attribute-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="disabled-${fieldCounter}" class="attr-checkbox" data-attr="disabled">
                        <label for="disabled-${fieldCounter}">Disabled</label>
                    </div>
                </div>
            </div>
            <div class="preview-section">
                <label class="preview-label">Предпросмотр:</label>
                <input type="text" class="generated-input" id="generated-${fieldCounter}" data-field-id="${fieldCounter}">
            </div>
            <div class="field-actions">
                <button class="save-btn" onclick="saveFieldToTop(${fieldCounter})">Сохранить</button>
            </div>
        `;

        fieldsContainer.appendChild(fieldWrapper);

        const attrInputs = fieldWrapper.querySelectorAll('.attr-input, .attr-checkbox');
        attrInputs.forEach(input => {
            input.addEventListener('input', function() {
                updateGeneratedField(fieldCounter);
            });
            input.addEventListener('change', function() {
                updateGeneratedField(fieldCounter);
            });
        });

        updateGeneratedField(fieldCounter);
        saveFieldsToStorage();
    }

    function updateGeneratedField(fieldId) {
        const fieldWrapper = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldWrapper) return;

        const generatedInput = fieldWrapper.querySelector(`#generated-${fieldId}`);
        if (!generatedInput) return;

        const name = fieldWrapper.querySelector(`#name-${fieldId}`).value;
        const placeholder = fieldWrapper.querySelector(`#placeholder-${fieldId}`).value;
        const maxlength = fieldWrapper.querySelector(`#maxlength-${fieldId}`).value;
        const value = fieldWrapper.querySelector(`#value-${fieldId}`).value;
        const readonly = fieldWrapper.querySelector(`#readonly-${fieldId}`).checked;
        const disabled = fieldWrapper.querySelector(`#disabled-${fieldId}`).checked;

        if (name) generatedInput.name = name;
        else generatedInput.removeAttribute('name');

        if (placeholder) generatedInput.placeholder = placeholder;
        else generatedInput.removeAttribute('placeholder');

        if (maxlength) generatedInput.maxLength = parseInt(maxlength);
        else generatedInput.removeAttribute('maxlength');

        if (value) generatedInput.value = value;
        else generatedInput.value = '';

        if (readonly) generatedInput.setAttribute('readonly', 'readonly');
        else generatedInput.removeAttribute('readonly');

        if (disabled) generatedInput.disabled = true;
        else generatedInput.disabled = false;

        saveFieldsToStorage();
    }

    function deleteField(fieldId) {
        const fieldWrapper = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldWrapper) {
            fieldWrapper.remove();
            saveFieldsToStorage();
            
            const savedFieldItem = document.querySelector(`[data-saved-field-id="${fieldId}"]`);
            if (savedFieldItem) {
                savedFieldItem.remove();
                saveSavedFieldsToStorage();
            }
            
            if (fieldsContainer.children.length === 0) {
                showEmptyMessage();
            }
        }
    }


    function saveFieldsToStorage() {
        const fields = [];
        const fieldWrappers = document.querySelectorAll('.field-wrapper');

        fieldWrappers.forEach(wrapper => {
            const fieldId = wrapper.dataset.fieldId;
            const name = wrapper.querySelector(`#name-${fieldId}`).value;
            const placeholder = wrapper.querySelector(`#placeholder-${fieldId}`).value;
            const maxlength = wrapper.querySelector(`#maxlength-${fieldId}`).value;
            const value = wrapper.querySelector(`#value-${fieldId}`).value;
            const readonly = wrapper.querySelector(`#readonly-${fieldId}`).checked;
            const disabled = wrapper.querySelector(`#disabled-${fieldId}`).checked;

            fields.push({
                fieldId: fieldId,
                name: name,
                placeholder: placeholder,
                maxlength: maxlength,
                value: value,
                readonly: readonly,
                disabled: disabled
            });
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
        
        if (fields.length > 0) {
            const maxFieldId = Math.max(...fields.map(f => parseInt(f.fieldId)));
            fieldCounter = maxFieldId;
        } else {
            fieldCounter = 0;
        }
    }

    function loadFieldsFromStorage() {
        const savedFields = localStorage.getItem(STORAGE_KEY);
        if (!savedFields) return;

        try {
            const fields = JSON.parse(savedFields);
            if (fields.length === 0) {
                showEmptyMessage();
                fieldCounter = 0;
                return;
            }
            
            const maxFieldId = Math.max(...fields.map(f => parseInt(f.fieldId)));
            if (maxFieldId > fieldCounter) {
                fieldCounter = maxFieldId;
            }

            fields.forEach(fieldData => {
                const currentFieldId = parseInt(fieldData.fieldId);
                if (currentFieldId > fieldCounter) {
                    fieldCounter = currentFieldId;
                }

                const fieldWrapper = document.createElement('div');
                fieldWrapper.className = 'field-wrapper';
                fieldWrapper.id = `field-${fieldData.fieldId}`;
                fieldWrapper.dataset.fieldId = fieldData.fieldId;

                fieldWrapper.innerHTML = `
                    <div class="field-header">
                        <h3 class="field-title">Текстовое поле #${fieldData.fieldId}</h3>
                        <button class="delete-btn" onclick="deleteField(${fieldData.fieldId})">Удалить</button>
                    </div>
                    <div class="field-content">
                        <div class="attribute-group">
                            <label for="name-${fieldData.fieldId}">Name:</label>
                            <input type="text" id="name-${fieldData.fieldId}" class="attr-input" data-attr="name" placeholder="Введите name" value="${escapeHtml(fieldData.name || '')}">
                        </div>
                        <div class="attribute-group">
                            <label for="placeholder-${fieldData.fieldId}">Placeholder:</label>
                            <input type="text" id="placeholder-${fieldData.fieldId}" class="attr-input" data-attr="placeholder" placeholder="Введите placeholder" value="${escapeHtml(fieldData.placeholder || '')}">
                        </div>
                        <div class="attribute-group">
                            <label for="maxlength-${fieldData.fieldId}">Maxlength:</label>
                            <input type="number" id="maxlength-${fieldData.fieldId}" class="attr-input" data-attr="maxlength" placeholder="Введите maxlength" min="0" value="${fieldData.maxlength || ''}">
                        </div>
                        <div class="attribute-group">
                            <label for="value-${fieldData.fieldId}">Value:</label>
                            <input type="text" id="value-${fieldData.fieldId}" class="attr-input" data-attr="value" placeholder="Введите value" value="${escapeHtml(fieldData.value || '')}">
                        </div>
                        <div class="attribute-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="readonly-${fieldData.fieldId}" class="attr-checkbox" data-attr="readonly" ${fieldData.readonly ? 'checked' : ''}>
                                <label for="readonly-${fieldData.fieldId}">Readonly</label>
                            </div>
                        </div>
                        <div class="attribute-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="disabled-${fieldData.fieldId}" class="attr-checkbox" data-attr="disabled" ${fieldData.disabled ? 'checked' : ''}>
                                <label for="disabled-${fieldData.fieldId}">Disabled</label>
                            </div>
                        </div>
                    </div>
                    <div class="preview-section">
                        <label class="preview-label">Предпросмотр:</label>
                        <input type="text" class="generated-input" id="generated-${fieldData.fieldId}" data-field-id="${fieldData.fieldId}">
                    </div>
                    <div class="field-actions">
                        <button class="save-btn" onclick="saveFieldToTop(${fieldData.fieldId})">Сохранить</button>
                    </div>
                `;

                fieldsContainer.appendChild(fieldWrapper);

                const attrInputs = fieldWrapper.querySelectorAll('.attr-input, .attr-checkbox');
                attrInputs.forEach(input => {
                    input.addEventListener('input', function() {
                        updateGeneratedField(fieldData.fieldId);
                    });
                    input.addEventListener('change', function() {
                        updateGeneratedField(fieldData.fieldId);
                    });
                });

                updateGeneratedField(fieldData.fieldId);
            });
        } catch (error) {
            console.error('Error loading fields from storage:', error);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showEmptyMessage() {
        fieldsContainer.innerHTML = '<div class="empty-message">Нет созданных полей. Установите флажок для создания нового поля.</div>';
    }

    function saveFieldToTop(fieldId) {
        const fieldWrapper = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldWrapper) return;

        const generatedInput = fieldWrapper.querySelector(`#generated-${fieldId}`);
        if (!generatedInput) return;

        const savedFieldsList = document.getElementById('saved-fields-list');
        const emptyMessage = savedFieldsList.querySelector('.empty-saved-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        const existingSavedField = savedFieldsList.querySelector(`[data-saved-field-id="${fieldId}"]`);
        if (existingSavedField) {
            existingSavedField.remove();
        }

        const name = generatedInput.name || '';
        const placeholder = generatedInput.placeholder || '';
        const maxlength = generatedInput.maxLength || '';
        const value = generatedInput.value || '';
        const readonly = generatedInput.hasAttribute('readonly');
        const disabled = generatedInput.disabled;

        const savedFieldItem = document.createElement('div');
        savedFieldItem.className = 'saved-field-item';
        savedFieldItem.dataset.savedFieldId = fieldId;

        const label = name ? name : `Поле #${fieldId}`;
        savedFieldItem.innerHTML = `
            <label>${escapeHtml(label)}</label>
            <input type="text" 
                   ${name ? `name="${escapeHtml(name)}"` : ''}
                   ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
                   ${maxlength ? `maxlength="${maxlength}"` : ''}
                   ${value ? `value="${escapeHtml(value)}"` : ''}
                   ${readonly ? 'readonly' : ''}
                   ${disabled ? 'disabled' : ''}>
        `;

        savedFieldsList.appendChild(savedFieldItem);
        saveSavedFieldsToStorage();
    }

    function saveSavedFieldsToStorage() {
        const savedFieldsList = document.getElementById('saved-fields-list');
        const savedFields = [];
        const savedItems = savedFieldsList.querySelectorAll('.saved-field-item');

        savedItems.forEach(item => {
            const input = item.querySelector('input');
            savedFields.push({
                fieldId: item.dataset.savedFieldId,
                name: input.name || '',
                placeholder: input.placeholder || '',
                maxlength: input.maxLength || '',
                value: input.value || '',
                readonly: input.hasAttribute('readonly'),
                disabled: input.disabled,
                label: item.querySelector('label').textContent
            });
        });

        localStorage.setItem('form_generator_saved_fields', JSON.stringify(savedFields));
    }

    function loadSavedFieldsFromStorage() {
        const savedFieldsList = document.getElementById('saved-fields-list');
        const savedFieldsData = localStorage.getItem('form_generator_saved_fields');
        
        if (!savedFieldsData) {
            return;
        }

        try {
            const savedFields = JSON.parse(savedFieldsData);
            if (savedFields.length === 0) {
                return;
            }

            const emptyMessage = savedFieldsList.querySelector('.empty-saved-message');
            if (emptyMessage) {
                emptyMessage.remove();
            }

            savedFields.forEach(fieldData => {
                const savedFieldItem = document.createElement('div');
                savedFieldItem.className = 'saved-field-item';
                savedFieldItem.dataset.savedFieldId = fieldData.fieldId;

                savedFieldItem.innerHTML = `
                    <label>${escapeHtml(fieldData.label || `Поле #${fieldData.fieldId}`)}</label>
                    <input type="text" 
                           ${fieldData.name ? `name="${escapeHtml(fieldData.name)}"` : ''}
                           ${fieldData.placeholder ? `placeholder="${escapeHtml(fieldData.placeholder)}"` : ''}
                           ${fieldData.maxlength ? `maxlength="${fieldData.maxlength}"` : ''}
                           ${fieldData.value ? `value="${escapeHtml(fieldData.value)}"` : ''}
                           ${fieldData.readonly ? 'readonly' : ''}
                           ${fieldData.disabled ? 'disabled' : ''}>
                `;

                savedFieldsList.appendChild(savedFieldItem);
            });
        } catch (error) {
            console.error('Error loading saved fields from storage:', error);
        }
    }

    function clearAllFields() {
        if (confirm('Вы уверены, что хотите очистить все поля? Это действие нельзя отменить.')) {
            fieldsContainer.innerHTML = '';
            const savedFieldsList = document.getElementById('saved-fields-list');
            savedFieldsList.innerHTML = '<div class="empty-saved-message">Нет сохранённых полей</div>';
            
            fieldCounter = 0;
            
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('form_generator_saved_fields');
            
            showEmptyMessage();
        }
    }

    window.deleteField = deleteField;
    window.saveFieldToTop = saveFieldToTop;

    document.addEventListener('DOMContentLoaded', function() {
        loadFieldsFromStorage();
        loadSavedFieldsFromStorage();

        if (fieldsContainer.children.length === 0) {
            showEmptyMessage();
        }

        generateBtn.addEventListener('click', function() {
            if (fieldsContainer.querySelector('.empty-message')) {
                fieldsContainer.innerHTML = '';
            }
            generateField();
        });

        const clearAllBtn = document.getElementById('clear-all-btn');
        clearAllBtn.addEventListener('click', clearAllFields);
    });
})();

