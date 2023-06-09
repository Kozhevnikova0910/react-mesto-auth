import React from 'react';
import {Routes, Route, useNavigate, Navigate} from 'react-router-dom';
import api from '../utils/Api.js';
import * as auth from '../utils/Auth';
import {CurrentUserContext, userObject} from '../contexts/CurrentUserContext.js'
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';
import ImagePopup from "./ImagePopup";
import EditProfilePopup from './EditProfilePopup'
import EditAvatarPopup from './EditAvatarPopup'
import AddPlacePopup from './AddPlacePopup'
import PopupWithDelete from "./PopupWithDelete";
import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";

function App() {

    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [isPopupWithDeleteOpen, setIsPopupWithDeleteOpen] =
        React.useState(false);
    const [cardWithDelete, setCardWithDelete] = React.useState(null);

    const [selectedCard, setSelectedCard] = React.useState({
        name: '',
        link: ''
    });
    const [currentUser, setCurrentUser] = React.useState(userObject);

    const [cards, setCards] = React.useState([])

    const [loggedIn, setLoggedIn] = React.useState(false);

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false)
    const [infoTooltipLabel, setInfoTooltipLabel] = React.useState('')
    const [infoTooltipAltImg, setInfoTooltipAltImg] = React.useState('Ошибка')
    const [isRegistrationSuccess, setIsRegistrationSuccess] = React.useState(true)

    const [email, setEmail] = React.useState('');

    const navigate = useNavigate();

    React.useEffect(() => {
        checkToken();

        api.getUserInfo()
            .then(res => {
                setCurrentUser(res)
                checkToken();
            })
            .catch(err => console.log(err))
    }, [])

    React.useEffect(() => {
        if (loggedIn) {
            api.getInitialCards()
                .then(cardsData => {
                    setCards(cardsData)
                })
                .catch(err => console.log(err))
        }
    }, [loggedIn])

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
        setIsPopupWithDeleteOpen(false);
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
        })
            .catch(res => {console.log(res)})
    }

    function handleCardDelete(card) {
        setIsPopupWithDeleteOpen(true);
        setCardWithDelete(card);
    }

    function handleCardDeleteConfirmed(card) {
        api.deleteCard(card._id)
            .then(() => {
                setCards(() => cards.filter(c => c._id !== card._id ));
                closeAllPopups();
            })
            .catch(res => {console.log(res)})
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
        setIsInfoTooltipOpen(false)
    }

    function handleRegistration(data) {
        auth.registration(data)
            .then(res => {
                setIsRegistrationSuccess(true)
                setInfoTooltipLabel('Вы успешно зарегистрировались!')
                setInfoTooltipAltImg('Ошибка')
                setIsInfoTooltipOpen(true)
            })
            .catch(err => {
                setIsRegistrationSuccess(false)
                setInfoTooltipLabel('Что-то пошло не так! Попробуйте ещё раз.')
                setInfoTooltipAltImg('Успех')
                setIsInfoTooltipOpen(true)
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
                            isOpen={isInfoTooltipOpen}
                            infoTooltipLabel={infoTooltipLabel}
                            infoTooltipAltImg={infoTooltipAltImg}
                            isRegistrationSuccess={isRegistrationSuccess}
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
                <Route path='*' element={<Navigate to='/sign-in' replace/>}/>
            </Routes>
            {loggedIn && <Footer/>}
            <EditProfilePopup onUpdateUser={handleUpdateUser}
                              isOpen={isEditProfilePopupOpen}
                              onClose={closeAllPopups} />
            <AddPlacePopup onAddPlace={handleAddPlace}
                           isOpen={isAddPlacePopupOpen}
                           onClose={closeAllPopups} />
            <EditAvatarPopup onUpdateAvatar={handleUpdateAvatar}
                             isOpen={isEditAvatarPopupOpen}
                             onClose={closeAllPopups} />
            <ImagePopup card={selectedCard}
                        onClose={closeAllPopups}/>
            <PopupWithDelete isOpen={isPopupWithDeleteOpen}
                             onClose={closeAllPopups}
                             onDeleteCardConfirm={handleCardDeleteConfirmed}
                             card={cardWithDelete} />
        </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
