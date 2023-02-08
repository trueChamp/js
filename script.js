"use strict";

document.addEventListener('DOMContentLoaded', async() => {
    const TYPE = {
        new: 'new',
        change: 'change'
    };
    const INPUT_TYPES = {
        tel: 'tel',
        mail: 'mail',
        link: 'link',
        text: 'text'
    }
    const CONTACT_TYPES = {
        tel: 'Телефон',
        mail: 'Email',
        vk: 'Vk',
        facebook: 'Facebook',
        other: 'Другое'
    }
    const SORT_TYPE = {
        id: 'id',
        fullname: 'fullname',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }

    let users = [];


    const sortUsers = async(users, sortType = 5, direction = 1) => {
        const sortting = (a, b, flag) => {
            if (a > b) { return flag; }
            if (a < b) { return -flag; }
            return 0;
        }

        switch (sortType) {
            case SORT_TYPE.id:
                return users.sort((a, b) => sortting(a.id, b.id, direction))

            case SORT_TYPE.fullname:
                return users.sort((a, b) => {
                    const fullname1 = `${a.surname} ${a.name} ${a.lastName}`;
                    const fullname2 = `${b.surname} ${b.name} ${b.lastName}`
                    return sortting(fullname1, fullname2, direction)
                })

            case SORT_TYPE.createdAt:
                return users.sort((a, b) => sortting(a.createdAt, b.createdAt, direction));

            case SORT_TYPE.updatedAt:
                return users.sort((a, b) => sortting(a.updatedAt, b.updatedAt, direction));

            default:
                break;
        }
    }


    const deleteUser = (id) => {
        const modal = document.createElement('div');
        const modalContent = document.createElement('div');
        const title = document.createElement('h2');
        const text = document.createElement('p');

        const deleteButton = document.createElement('button');
        const cancelButton = document.createElement('button');
        const closeButton = document.createElement('button');

        modal.classList.add('modal', 'modal__delete');
        setTimeout(() => {
            modal.classList.add('active');
        }, 100)
        modal.append(modalContent);

        deleteButton.textContent = 'Удалить';
        deleteButton.classList.add('modal__submit')
        deleteButton.addEventListener('click', async() => {
            deleteButton.classList.toggle('modal__submit_loading');

            await deleteUserToServer(id);
            createTableBody();

            deleteButton.classList.toggle('modal__submit_loading');
            modal.remove();
        })

        cancelButton.textContent = 'Отмена';
        cancelButton.classList.add('modal__cancel')

        closeButton.classList.add('modal__close');
        closeButton.addEventListener('click', () => {
            modal.remove();
        })

        modalContent.classList.add('modal__content');
        modalContent.append(title);
        modalContent.append(text);
        modalContent.append(closeButton);
        modalContent.append(deleteButton);
        modalContent.append(cancelButton);
        modalContent.addEventListener('click', e => { e._isClickWithimModal = true; })

        title.textContent = 'Удалить клиента';
        title.classList.add('modal__title', 'modal__title_delete');

        text.textContent = 'Вы действительно хотите удалить данного клиента?';
        text.classList.add('modal__text');

        document.querySelector('.wrapper').append(modal);

        cancelButton.addEventListener('click', () => { modal.remove(); })

        modal.addEventListener('click', e => {
            if (e._isClickWithimModal) { return }
            modal.remove();
        });
    }


    const addContact = (block, button, data = { type: '', value: '' }) => {

        const setupSelect = (element) => {
            new Choices(element, {
                shouldSort: false,
                searchEnabled: false,
                itemSelectText: '',
                silent: true,
                choices: [{
                        value: CONTACT_TYPES.tel,
                        label: CONTACT_TYPES.tel,
                        selected: data.type === CONTACT_TYPES.tel,
                    },
                    {
                        value: CONTACT_TYPES.mail,
                        label: CONTACT_TYPES.mail,
                        selected: data.type === CONTACT_TYPES.mail,
                    },
                    {
                        value: CONTACT_TYPES.vk,
                        label: CONTACT_TYPES.vk,
                        selected: data.type === CONTACT_TYPES.vk
                    },
                    {
                        value: CONTACT_TYPES.facebook,
                        label: CONTACT_TYPES.facebook,
                        selected: data.type === CONTACT_TYPES.facebook
                    },
                    {
                        value: CONTACT_TYPES.other,
                        label: CONTACT_TYPES.other,
                        selected: data.type === CONTACT_TYPES.other
                    },
                ],
            });
        }

        const types = {
            'Телефон': INPUT_TYPES.tel,
            'Email': INPUT_TYPES.mail,
            'Vk': INPUT_TYPES.link,
            'Facebook': INPUT_TYPES.link,
            'Другое': INPUT_TYPES.text
        }

        const contactBlock = document.createElement('div');
        const select = document.createElement('select');
        const input = document.createElement('input');
        const cancel = document.createElement('button');

        input.placeholder = 'Введите данные контакта';
        input.value = data.value;
        input.type = types[data.type] || INPUT_TYPES.tel;
        input.classList.add('modal-contacts__input');


        if (data.type === CONTACT_TYPES.tel || data.type === '') {
            let im = new Inputmask('+7(999) 999-99-99');
            im.mask(input);
        }


        tippy(cancel, {
            content: 'Удалить контакт',
            delay: [500, 200]
        });

        block.classList.add('modal__contacts_active');

        cancel.classList.add('modal-contacts__cancel');
        cancel.addEventListener('click', e => {
            const maxContacts = 10
            e.preventDefault();
            button.dataset.index = button.dataset.index - 1;
            if (button.dataset.index < maxContacts) {
                button.style.display = 'block';
            }
            if (button.dataset.index == 0) {
                block.classList.remove('modal__contacts_active')
            }
            contactBlock.remove();
        })

        select.addEventListener('change', (e) => {
            input.type = types[e.currentTarget.value] || INPUT_TYPES.tel;
            input.value = '';

            if (input.type !== INPUT_TYPES.tel) {
                if (input.inputmask) { input.inputmask.remove(); }
            } else {
                let im = new Inputmask('+7(999) 999-99-99');
                im.mask(input);
            }
        })

        contactBlock.classList.add('modal-contacts__item');

        contactBlock.append(select);
        contactBlock.append(input);
        contactBlock.append(cancel);

        setupSelect(select)
        button.before(contactBlock)
    }

    const getContacts = (container) => {
        let contacts = [];
        let data = container.querySelectorAll('.modal-contacts__item');

        for (const item of data) {
            if (item.querySelector('.modal-contacts__input').value) {
                contacts.push({
                    type: item.querySelector('.choices__item--selectable').textContent,
                    value: item.querySelector('.modal-contacts__input').value
                });
            }
        }
        return contacts;
    }


    const validateField = (form) => {

        const setupError = (error, elem, text, className) => {
            error.classList.add('modal__error', `modal__error_${className}`);
            error.textContent = text;
            elem.append(error);
        }


        const validateInputs = (form, contactBlock) => {
            const isInputError = (error, elem) => {
                if (elem.value.length < 1) {
                    elem.classList.add('modal__input_error');
                    return false;
                } else {
                    error.remove();
                    elem.classList.remove('modal__input_error');
                    return true;
                }
            }

            const surname = form.querySelector('#surName');
            const firstname = form.querySelector('#firstName');
            const surnameError = contactBlock.querySelector('.modal__error_surname') ||
                document.createElement('div');
            const firstnameError = contactBlock.querySelector('.modal__error_firstname') ||
                document.createElement('div');

            setupError(surnameError, contactBlock, 'Введите фамилию', 'surname');
            setupError(firstnameError, contactBlock, 'Введите имя', 'firstname');

            const er1 = isInputError(surnameError, surname);
            const er2 = isInputError(firstnameError, firstname);

            validate = er1 && er2;

            surname.addEventListener('input', e => {
                isInputError(surnameError, e.currentTarget, 'surname', contactBlock, 'Введите фамилию');
            });

            firstname.addEventListener('input', e => {
                isInputError(firstnameError, e.currentTarget, 'firstname', contactBlock, 'Введите имя')
            });
        }

        const validateContact = (contacts, errorBlock) => {
            const isContactError = (condition, contact) => {
                let isValidate = true;

                if (condition) {
                    isValidate = false;
                    validate = false;
                    contact.classList.add('modal-contacts__item_active')
                } else {
                    contact.classList.remove('modal-contacts__item_active')
                }

                return isValidate
            }

            const choseSelectType = (selectType, input, contact) => {
                const error = errorBlock.querySelector(`.modal__error_contact`) ||
                    document.createElement('div');

                let isValidate = true;

                if (selectType === CONTACT_TYPES.tel) {
                    const length = input.inputmask.unmaskedvalue().length;

                    isValidate = isContactError(length < 10, contact)

                } else if (selectType === CONTACT_TYPES.mail) {
                    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

                    isValidate = isContactError(!re.test(String(input.value).toLowerCase()), contact)

                } else if (selectType === CONTACT_TYPES.vk || selectType === CONTACT_TYPES.facebook) {
                    const re = /([\w-]{1,32}\.[\w-]{1,32})/;

                    isValidate = isContactError(!re.test(String(input.value).toLowerCase()), contact)

                } else {
                    isValidate = isContactError(input.value.length <= 0, contact)
                }

                if (isValidate === false) {
                    setupError(error, errorBlock, 'Неверное значение контакта(ов)', 'contact')
                }
            }

            for (const contact of contacts) {
                const input = contact.querySelector('.modal-contacts__input');
                let selectType = contact.querySelector('.choices__input').value;
                contact.querySelector('.choices__input').addEventListener('change', (e) => {
                    selectType = e.currentTarget.value;
                });

                choseSelectType(selectType, input, contact)

                input.addEventListener('input', e => {
                    choseSelectType(selectType, e.currentTarget, contact)
                })
            }
        }

        let validate = true;
        const contacts = form.querySelectorAll('.modal-contacts__item');
        const errorBlock = form.querySelector('.modal__error-block') || document.createElement('div');

        errorBlock.classList.add('modal__error-block');
        form.querySelector('.modal__submit').before(errorBlock);

        validateInputs(form, errorBlock)
        validateContact(contacts, errorBlock)

        return validate;
    }


    const mainModal = async(type = TYPE.new, id = '') => {
        const hidePlaceholder = (elem, placeholder) => {
            if (elem.value.length >= 1) {
                placeholder.classList.add('modal__placeholder_active')
            } else {
                placeholder.classList.remove('modal__placeholder_active')
            }
        }

        const modal = document.createElement('div');
        const modalContent = document.createElement('div');
        const title = document.createElement('h2');
        const form = document.createElement('form');

        const firstName = document.createElement('input');
        const firstNameLabel = document.createElement('label');
        const firstNameBlock = document.createElement('div')

        const surName = document.createElement('input');
        const surNameLabel = document.createElement('label');
        const surNameBlock = document.createElement('div');

        const lastName = document.createElement('input');
        const lastNameLabel = document.createElement('label');
        const lastNameBlock = document.createElement('div')

        const contactBlock = document.createElement('div');
        const addContactButton = document.createElement('button');
        const saveButton = document.createElement('button');
        const cancelButton = document.createElement('button');
        const closeButton = document.createElement('button');

        let user = {}


        if (type === TYPE.change) {
            user = await getUserToIdFromServer(id)
        }

        if (user.message) {
            const text = document.createElement('p');
            text.textContent = 'Пользователь не найден';
            modalContent.append(text);
            return;
        }

        modal.classList.add('modal');
        setTimeout(() => {
            modal.classList.add('active');
        }, 100)
        modal.addEventListener('click', e => {
            if (e._isClickWithimModal) { return }
            modal.remove();
        });

        modalContent.classList.add('modal__content');
        modalContent.append(title);
        modalContent.append(closeButton);
        modalContent.dataset.simplebar = true;

        contactBlock.classList.add('modal__contacts', 'modal-contacts');
        contactBlock.append(addContactButton);

        form.classList.add('modal__form', 'modal-form');
        form.append(surNameBlock);
        form.append(firstNameBlock);
        form.append(lastNameBlock);
        form.append(contactBlock);
        form.append(saveButton);
        form.append(cancelButton);

        form.addEventListener('submit', async e => {
            e.preventDefault();
            saveButton.classList.toggle('modal__submit_loading');
            const errors = form.querySelector('.modal__error-block');

            if (errors) {
                errors.textContent = '';
            }

            if (!validateField(form)) {
                saveButton.classList.toggle('modal__submit_loading');
                return
            }

            if (type === TYPE.new) {
                const data = await addUserToServer({
                    name: firstName.value,
                    surname: surName.value,
                    lastName: lastName.value,
                    contacts: getContacts(contactBlock)
                });

                if (data.errors) {
                    for (const error of data.errors) {
                        const er = document.createElement('div');
                        er.classList.add('modal__error')
                        er.textContent = error.message;
                        errors.append(er)
                    }
                    saveButton.before(errors)
                    return
                }
            } else if (type === TYPE.change) {
                const data = await updateUserToServer(user.id, {
                    name: firstName.value,
                    surname: surName.value,
                    lastName: lastName.value,
                    contacts: getContacts(contactBlock)
                })

                if (data.message) {
                    saveButton.before(data.message);
                    return
                }
            }

            form.reset();

            saveButton.classList.toggle('modal__submit_loading');

            firstNameLabel.removeAttribute('style');
            surNameLabel.removeAttribute('style');
            lastNameLabel.removeAttribute('style');
            modal.classList.remove('active');
            createTableBody();
        });

        modalContent.append(form);
        modalContent.addEventListener('click', e => {
            e._isClickWithimModal = true;
        })


        surName.classList.add('modal__input');
        surName.value = user.surname || '';
        surName.autocomplete = 'off';
        surName.id = 'surName'
        surName.addEventListener('blur', () => {
            hidePlaceholder(surName, surNameLabel);
        })

        surNameLabel.classList.add('modal__placeholder');
        surNameLabel.innerHTML = 'Фамилия<span class="symbol">*</span>'
        surNameLabel.setAttribute('for', 'surName');

        surNameBlock.append(surName)
        surNameBlock.append(surNameLabel)
        surNameBlock.classList.add('modal__input-container')


        firstName.classList.add('modal__input');
        firstName.value = user.name || '';
        firstName.autocomplete = 'off';
        firstName.id = 'firstName'
        firstName.addEventListener('blur', () => {
            hidePlaceholder(firstName, firstNameLabel)
        })

        firstNameLabel.classList.add('modal__placeholder');
        firstNameLabel.innerHTML = 'Имя<span class="symbol">*</span>'
        firstNameLabel.setAttribute('for', 'firstName')

        firstNameBlock.append(firstName)
        firstNameBlock.append(firstNameLabel)
        firstNameBlock.classList.add('modal__input-container')


        lastName.classList.add('modal__input');
        lastName.value = user.lastName || '';
        lastName.autocomplete = 'off';
        lastName.id = 'lastName'
        lastName.addEventListener('blur', () => {
            hidePlaceholder(lastName, lastNameLabel)
        })

        lastNameLabel.classList.add('modal__placeholder');
        lastNameLabel.innerHTML = 'Отчество';
        lastNameLabel.setAttribute('for', 'lastName');

        lastNameBlock.append(lastName);
        lastNameBlock.append(lastNameLabel);
        lastNameBlock.classList.add('modal__input-container');

        hidePlaceholder(surName, surNameLabel);
        hidePlaceholder(firstName, firstNameLabel);
        hidePlaceholder(lastName, lastNameLabel);

        title.innerHTML = type === TYPE.new ?
            'Новый клиент' : `Изменить данные <span class='modal-title__id'>ID: ${user.id}</span>`
        title.classList.add('modal__title');

        if (user.contacts) {
            for (let contact of user.contacts) {
                addContact(contactBlock, addContactButton, contact);
            }
        }

        addContactButton.classList.add('modal__add-contact');
        addContactButton.dataset.index = contactBlock.childNodes.length - 1;
        addContactButton.textContent = 'Добавить контакт';
        addContactButton.addEventListener('click', e => {
            const index = addContactButton.dataset.index
            addContactButton.dataset.index = Number(index) + 1;
            e.preventDefault();
            addContact(contactBlock, addContactButton);
            if (index >= 9) {
                addContactButton.style.display = 'none';
            }
        });

        closeButton.classList.add('modal__close');
        closeButton.addEventListener('click', () => {
            form.reset();
            modal.remove();
        })

        saveButton.textContent = 'Сохранить';
        saveButton.type = 'submit';
        saveButton.classList.add('modal__submit');

        cancelButton.textContent = type === TYPE.new ? 'Отмена' : 'Удалить клиента';
        cancelButton.classList.add('modal__cancel');

        cancelButton.addEventListener('click', e => {
            if (type === TYPE.change) {
                deleteUser(user.id);
            }
            e.preventDefault();
            modal.remove();
        })

        modal.append(modalContent);
        document.querySelector('.wrapper').append(modal);
    }


    const loading = (body = document.querySelector('.table-body')) => {
        const row = document.createElement('tr');
        const item = document.createElement('td');
        const loader = document.createElement('div');

        row.classList.add('loader');

        item.classList.add('loader__column');
        item.colSpan = 6;

        loader.classList.add('loader__item');

        item.append(loader);
        row.append(item)

        body.append(row);
    }


    const createHeader = (parent) => {
        const container = document.createElement('div');
        const header = document.createElement('header');
        const logo = document.createElement('div');
        const search = document.createElement('input');

        container.classList.add('container', 'header__container');

        header.classList.add('header');

        logo.classList.add('header__logo');
        logo.textContent = 'skb.';

        search.classList.add('header__search');
        search.placeholder = 'Введите запрос';
        let timeout = '';
        search.addEventListener('input', (e) => {
            const value = e.currentTarget.value
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                createTableBody({ filter: value })
            }, 300);
        })

        container.append(logo);
        container.append(search);
        header.append(container);
        parent.append(header);
    }


    const createTableItem = (user, body) => {
        const addContact = (item) => {
            const contactsType = {
                phone: 'res/phone.svg',
                vk: 'res/vk.svg',
                facebook: 'res/facebook.svg',
                mail: 'res/mail.svg',
                other: 'res/other.svg'
            }
            const contact = document.createElement('img');
            let linkType = ''

            contact.classList.add('contacts__item');

            switch (item.type) {
                case 'Телефон':
                    contact.src = contactsType.phone;
                    linkType = 'tel:' + item.value;
                    break;
                case 'Email':
                    contact.src = contactsType.mail;
                    linkType = 'mailto:' + item.value;
                    break;
                case 'Vk':
                    contact.src = contactsType.vk;
                    linkType = 'http://' + item.value;
                    break;
                case 'Facebook':
                    contact.src = contactsType.facebook;
                    linkType = 'http://' + item.value;
                    break;
                case 'Другое':
                    contact.src = contactsType.other;
                    linkType = '#';
                    break
                default:
                    break;
            }

            tippy(contact, {
                allowHTML: true,
                content: `${item.type}: <a href=${linkType}>${item.value}</a>`,
                interactive: true,
            });
            return contact
        }

        const createContacts = (contacts, container) => {
            const contactContainer = document.createElement('div');
            const maxContactsShows = 4

            contactContainer.classList.add('table-row__contacts', 'contacts');

            const count = contacts.length > maxContactsShows ? maxContactsShows : contacts.length;
            for (let i = 0; i < count; i++) {
                contactContainer.append(addContact(contacts[i]));
            }

            if (contacts.length > maxContactsShows) {
                const contact = document.createElement('div');

                contact.classList.add('contacts__item_more');
                contact.textContent = '+' + (contacts.length - maxContactsShows);
                contactContainer.append(contact);
                contact.addEventListener('click', () => {
                    contact.remove()
                    for (let i = maxContactsShows; i < contacts.length; i++) {
                        contactContainer.append(addContact(contacts[i]));
                    }
                });
            }
            container.append(contactContainer);
        }

        const getDate = (date) => {
            const getMonth = date.getMonth() + 1;
            const year = date.getFullYear();
            const month = getMonth < 10 ? '0' + getMonth : getMonth;
            const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

            const time =
                `${date.getHours() < 10 ? '0' + date.getHours() :
          date.getHours()}:${date.getMinutes() < 10 ?
            '0' + date.getMinutes() : date.getMinutes()}`
            return `${day}.${month}.${year} <span class = 'table-row__time'>${time}</span>`;
        }

        const row = document.createElement('tr');

        const id = document.createElement('td');
        const fullname = document.createElement('td');
        const createDate = document.createElement('td');
        const lastUpdateDate = document.createElement('td');
        const contacts = document.createElement('td');
        const buttons = document.createElement('td');

        const actions = {
            changeButton: document.createElement('button'),
            deleteButton: document.createElement('button')
        }

        row.classList.add('table-row', 'table-body__row');

        actions.changeButton.classList.add('table-buttons__button', 'table-buttons__button_change');
        actions.deleteButton.classList.add('table-buttons__button', 'table-buttons__button_delete');

        actions.changeButton.textContent = 'Изменить';
        actions.changeButton.addEventListener('click', async() => {
            actions.changeButton.classList.toggle('table-buttons__button_change-loading');

            await mainModal(TYPE.change, user.id);

            actions.changeButton.classList.toggle('table-buttons__button_change-loading');
        })

        actions.deleteButton.textContent = 'Удалить';
        actions.deleteButton.addEventListener('click', async() => {
            deleteUser(user.id, wrapper);
        })

        id.textContent = user.id;
        id.classList.add('table-row__elem', 'table-row__elem_id');

        fullname.textContent = `${user.surname} ${user.name} ${user.lastName}`;
        fullname.classList.add(`table-row__elem`, `table-row__elem_fullname`);

        createDate.innerHTML = getDate(new Date(user.createdAt));
        createDate.classList.add(`table-row__elem`, `table-row__elem_createDate`);

        lastUpdateDate.innerHTML = getDate(new Date(user.updatedAt));
        lastUpdateDate.classList.add(`table-row__elem`, `table-row__elem_lastUpdateDate`);

        createContacts(user.contacts, contacts);

        contacts.classList.add(`table-row__elem`, `table-row__elem_contacts`);

        buttons.classList.add('table-row__elem', 'table-buttons');
        buttons.append(actions.changeButton);
        buttons.append(actions.deleteButton);

        row.append(id);
        row.append(fullname);
        row.append(createDate);
        row.append(lastUpdateDate);
        row.append(contacts);
        row.append(buttons);

        body.append(row);
    }


    const createTableBody = async(tableData = '', table = document.querySelector('.table')) => {
        let body;
        if (document.querySelector('.table__body')) {
            body = document.querySelector('.table__body');
            body.textContent = '';
            users = tableData.users
        } else {
            body = document.createElement('tbody');
            body.classList.add('table__body', 'table-body');
            table.append(body);
        }

        if (!tableData.users) {
            await loading(body);

            document.querySelector('.loader').classList.toggle('loader_active');

            const data = await getUsersFromServer(tableData.filter);
            users = data.users;
            const sortType = document.querySelector('[data-active]').dataset.active;

            sortUsers(users, sortType);

            document.querySelector('.loader').classList.toggle('loader_active');
        }

        for (const user of users) {
            createTableItem(user, body);
        }
    }


    const createHeaderTable = async(table) => {
        const data = {
            id: `ID`,
            fullname: `Фамилия Имя Отчество`,
            createdAt: `Дата и время создания`,
            updatedAt: 'Последние изменения',
            contact: 'Контакты',
            actions: 'Действия'
        };

        const header = document.createElement('thead');
        const row = document.createElement('tr');

        header.classList.add('table__header', 'table-header');

        let i = 0;

        for (const key of Object.keys(data)) {
            const item = document.createElement('th');

            item.classList.add('table-header__item', `table-header__item_${key}`);

            item.textContent = data[key];

            const countSortRow = 4;

            if (i < countSortRow) {
                item.dataset.filterTop = 1;
                item.classList.add(`table-header__sort`);
                item.addEventListener('click', async(e) => {
                    let filterTop = item.dataset.filterTop;
                    const items = document.querySelectorAll('.table-header__sort');

                    for (const item of items) {
                        item.classList.remove('table-header__sort_active', 'table-header__sort_active-reverse');
                        item.dataset.filterTop = 1;
                        item.removeAttribute('data-active');
                    }

                    e.currentTarget.classList.add(
                        filterTop == 1 ? 'table-header__sort_active' :
                        'table-header__sort_active-reverse'
                    );

                    e.currentTarget.dataset.active = key;

                    users = await sortUsers(users, key, filterTop)

                    createTableBody({ users })
                    item.dataset.filterTop = -filterTop;
                })

                const arrow = document.createElement('span');

                arrow.classList.add('table-header__arrow');

                item.append(arrow);

                if (key === 'fullname') {
                    arrow.classList.add('table-header__arrow_FIO');
                    arrow.textContent = 'А-Я';
                }
            }
            if (key === 'id') {
                item.classList.add(`table-header__sort_active`);
                item.dataset.filterTop = -1;
                item.dataset.active = key;
            }
            row.append(item);
            i++
        }

        header.append(row);
        table.append(header);
    }

    const createTable = (container) => {
        const tableContainer = document.createElement('div')
        let table;

        if (document.querySelector('.table')) {
            table = document.querySelector('.table');
            table.textContent = '';
        } else {
            table = document.createElement('table');
            table.classList.add('table');
        }

        createHeaderTable(table);
        createTableBody('', table);

        tableContainer.append(table);
        tableContainer.classList.add('table-container')
        tableContainer.dataset.simplebar = true;

        container.append(tableContainer);
    }

    const createTitle = (container) => {
        const title = document.createElement('h1');

        title.classList.add('title', 'main__title');
        title.textContent = 'Клиенты';

        container.append(title)
    }

    const createAddButton = (container) => {
        const button = document.createElement('button');
        const buttonContainer = document.createElement('div')

        button.textContent = 'Добавить пользователя';
        button.classList.add('main__button');
        button.addEventListener('click', () => {
            mainModal();
        })

        buttonContainer.classList.add('main__button-container')
        buttonContainer.append(button);

        container.append(buttonContainer)
    }

    const wrapper = document.querySelector('.wrapper');
    const container = document.createElement('div');
    const main = document.createElement('main');

    container.classList.add('container', 'main__container');

    main.classList.add('main');

    createHeader(wrapper);
    createTitle(container);
    createTable(container);
    createAddButton(container, wrapper);

    main.append(container);

    wrapper.append(main);
});