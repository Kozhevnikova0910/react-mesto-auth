class Api {
    constructor(options) {
        this.baseUrl = options.baseUrl;
        this.headers = options.headers;
    }

    _checkResponse(res) {
        return res.ok
            ? res.json()
            : Promise.reject(`Ошибка ${res.status}`);
    }

    getInitialCards() {
        return fetch(`${this.baseUrl}/cards`, {
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    // другие методы работы с API
    getUserInfo() {
        return fetch(`${this.baseUrl}/users/me`, {
            headers: this.headers
        })
            .then(this._checkResponse)
    }

    patchUserInfo(inputValues) {
        return fetch(`${this.baseUrl}/users/me`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({name: inputValues.name, about: inputValues.about})
        })
            .then(this._checkResponse)
    }

    postNewCard(cardInfo) {
        return fetch(`${this.baseUrl}/cards`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(cardInfo)
        })
            .then(this._checkResponse)
    }

    deleteCard(id) {
        return fetch(`${this.baseUrl}/cards/${id}`, {
            method: "DELETE",
            headers: this.headers,
        })
            .then(this._checkResponse)
    }

    changeLikeCardStatus(id, isLiked) {
        if (isLiked) {
            return this.deleteLike(id);
        } else {
            return this.putLike(id);
        }
    }

    putLike(id) {
        return fetch(`${this.baseUrl}/cards/${id}/likes`, {
            method: "PUT",
            headers: this.headers,
        })
            .then(this._checkResponse)
    }

    deleteLike(id) {
        return fetch(`${this.baseUrl}/cards/${id}/likes`, {
            method: "DELETE",
            headers: this.headers,
        })
            .then(this._checkResponse)
    }

    patchAvatar(link) {
        return fetch(`${this.baseUrl}/users/me/avatar`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({avatar: link})
        })
            .then(this._checkResponse)
    }
}

const api = new Api({
    baseUrl: 'http://kozhevnikova.students.nomoredomains.xyz',
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }
})

export default api