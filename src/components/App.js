import React from 'react';
import api from '../utils/Api.js';
import {CurrentUserContext, userObject} from '../contexts/CurrentUserContext.js'
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from './EditProfilePopup'
import EditAvatarPopup from './EditAvatarPopup'
import AddPlacePopup from './AddPlacePopup'

function App() {

    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);

    const [selectedCard, setSelectedCard] = React.useState({
        name: '',
        link: ''
    });
    const [currentUser, setCurrentUser] = React.useState(userObject);

    const [cards, setCards] = React.useState([])

    React.useEffect(() => {
        api.getUserInfo()
            .then(res => {setCurrentUser(res)})
            .catch(err => console.log(err))
    }, [])

    React.useEffect(() => {
        api.getInitialCards()
            .then(cardsData => {setCards(cardsData)})
            .catch(err => console.log(err))
    }, [])


    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true)
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true)
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true)
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setSelectedCard({
            name: '',
            link: ''
        });
    }

    function handleCardLike(card) {
        // Снова проверяем, есть ли уже лайк на этой карточке
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        // Отправляем запрос в API и получаем обновлённые данные карточки
        api.changeLikeCardStatus(card._id, isLiked)
            .then((newCard) => {
            setCards(() => cards.map((c) => c._id === card._id ? newCard : c));
        });
    }

    function handleCardDelete(card) {
        api.deleteCard(card._id)
            .then(() => {
                setCards(() => cards.filter(c => c._id !== card._id ));
            });
    }

    function handleUpdateUser(newUserData) {
        api.patchUserInfo(newUserData)
            .then(resUserData => {
                setCurrentUser(resUserData);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }

    function handleUpdateAvatar(newAvatar) {
        api.patchAvatar(newAvatar)
            .then(res => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }

    function handleAddPlace(newPlace) {
        api.postNewCard(newPlace)
            .then(resCard => {
                setCards([resCard, ...cards]);
                closeAllPopups();
            })
            .catch(err => console.log(err))
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
            <Header/>
            <Main onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick} cards={cards} onCardClick={handleCardClick} onCardLike={handleCardLike} onCardDelete={handleCardDelete}/>
            <Footer/>
            <EditProfilePopup onUpdateUser={handleUpdateUser} isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} />
            <AddPlacePopup onAddPlace={handleAddPlace} isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} />
            <EditAvatarPopup onUpdateAvatar={handleUpdateAvatar} isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} />
            <PopupWithForm name="confirm" title="Вы уверены?" buttonText="Да"/>
            <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
        </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
