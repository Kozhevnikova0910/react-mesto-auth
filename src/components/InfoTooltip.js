import React from "react";
import on from '../images/enter_on.svg'
import off from '../images/enter_off.svg'

function InfoTooltip({isOpen, title, alt, res, onClose}) {

  return (
    <div className={isOpen ? "popup popup_opened" : "popup"}>
      <div className="popup__container">
        <button
          className="popup__close-btn"
          type="button"
          onClick={onClose}
        ></button>
        <img className="popup__img" src={res ? on : off} alt={alt} />
        <p className="popup__subtitle">{title}</p>
      </div>
    </div>
  )
}

export default InfoTooltip
