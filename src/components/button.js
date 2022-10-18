import './button.css'
import { useEffect } from 'react'

export default function ToggleWrapperButton({ buttonStatus, clickHandler }) {
  const buttonStatusArray = [
    { buttonStatus: 'notReady', buttonText: 'No function input' },
    { buttonStatus: 'inactive', buttonText: 'Wrap Function' },
    { buttonStatus: 'pending', buttonText: 'Wrapping Function...' },
    { buttonStatus: 'active', buttonText: 'Unwrap Function' }
  ]
  
  const buttonStatusInfo = buttonStatusArray.filter((btnStat) => btnStat.buttonStatus === buttonStatus)[0]
  const buttonText = buttonStatusInfo.buttonText
  const classId = 'toggleWrapperButton-' + buttonStatus

  return (<div id="buttonDiv">
    <button id="toggleWrapperButton"
      className={classId} onClick={clickHandler}> {buttonText + ' (' + buttonStatus + ')'}</button>
  </div>)
}