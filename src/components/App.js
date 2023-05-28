import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from '../utils/Api.js';
import * as auth from '../utils/Auth';
import {CurrentUserContext, userObject} from '../contexts/CurrentUserContext.js'
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from './EditProfilePopup'
import EditAvatarPopup from './EditAvatarPopup'
import AddPlacePopup from './AddPlacePopup'
import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";

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

    const [loggedIn, setLoggedIn] = React.useState(false);

    const [isInfoOpen, setIsInfoOpen] = React.useState(false)
    const [label, setLabel] = React.useState('')
    const [alt, setAlt] = React.useState('Ошибка')
    const [res, setRes] = React.useState(true)

    const [email, setEmail] = React.useState('');

    const navigate = useNavigate();

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

    React.useEffect(() => {
        checkToken();
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

    function closePopupInfo() {
        setIsInfoOpen(false)
    }

    function handleRegistration(data) {
        auth.registration(data)
            .then(res => {
                setRes(true)
                setLabel('Вы успешно зарегистрировались!')
                setAlt('Ошибка')
                setIsInfoOpen(true)
            })
            .catch(err => {
                setRes(false)
                setLabel('Что-то пошло не так! Попробуйте ещё раз.')
                setAlt('Успех')
                setIsInfoOpen(true)
                console.log(err)
            })
    }

    function handleAuthorization(data) {
        auth.authorization(data)
            .then(res => {
                if (res.token) {
                    setLoggedIn(true);
                    localStorage.setItem('token', res.token);
                    checkToken();
                    navigate('/', {replace: true})
                }
            })
            .catch(err => console.log(err))
    }

    function checkToken() {
        if (localStorage.getItem('token')) {
            const token = localStorage.getItem('token');
            auth.checkToken(token)
                .then(res => {
                    if (res) {
                        setLoggedIn(true);
                        setEmail(res.data.email);
                        navigate('/', {replace: true});
                    }
                })
                .catch(err => console.log(err))
        }
    }

    function signOut() {
        localStorage.removeItem('token');
        setLoggedIn(false);
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
            <Routes>
                <Route path="/" element={
                    <>
                        <Header email={email} onSignOut={signOut}/>
                        <ProtectedRoute element={Main}
                                        loggedIn={loggedIn}
                                        onEditProfile={handleEditProfileClick}
                                        onAddPlace={handleAddPlaceClick}
                                        onEditAvatar={handleEditAvatarClick}
                                        cards={cards}
                                        onCardClick={handleCardClick}
                                        onCardLike={handleCardLike}
                                        onCardDelete={handleCardDelete}/>
                    </>
                }/>
                <Route path="/sign-up" element={
                    <>
                        <Header label="Войти" link="/sign-in"/>
                        <Register onSignUpClick={handleRegistration}/>
                        <InfoTooltip
                            isOpen={isInfoOpen}
                            title={label}
                            alt={alt}
                            res={res}
                            onClose={closePopupInfo}
                        />
                    </>
                }/>
                <Route path="/sign-in" element={
                    <>
                        <Header label="Регистрация" link="/sign-up"/>
                        <Login onSignInClick={handleAuthorization}/>
                    </>
                }/>
            </Routes>
            {loggedIn && <Footer/>}
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
