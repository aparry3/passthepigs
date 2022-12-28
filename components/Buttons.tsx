import { FC, useEffect, useState } from "react"
import internal from "stream"
import { getValue, PointSystem, Roll } from "./App"
import styles from './Buttons.module.scss'

interface ButtonProps {
    roll: Roll
    onClick: (roll: Roll) => void
    pointSystem?: PointSystem
    active?: boolean
}

export const Button: FC<ButtonProps> = ({roll, onClick, active: propsActive = false, pointSystem = PointSystem.DEFAULT}) => {
    const points = getValue(roll, pointSystem)
    const [internalActive, setInternalActive] = useState<boolean>(false)
    const [active, setActive] = useState<boolean>(false)

    useEffect(() => {
        setActive(internalActive || propsActive)
    }, [propsActive, internalActive])

    return (
        <div className={styles.pigSelect}>
            <div 
                onMouseEnter={() => setInternalActive(true)}
                onMouseLeave={() => setInternalActive(false)}
                onMouseDown={() => setInternalActive(true)} 
                onMouseUp={() => setInternalActive(false)}
                onTouchStart={() => setInternalActive(true)} 
                onTouchEnd={() => setInternalActive(false)} 

                className={`${styles.pigSelectButton} ${active && styles.active}`} 
                onClick={() => onClick(roll)}
                >
                <span>
                    {roll}
                </span>
                <span>
                    {points}
                </span>
            </div>
        </div>
    )
}


export const Double: FC<{onClick: () => void, onClickSmall?: () => void, pointSystem: PointSystem, active?: boolean, smallActive: boolean}> = ({onClick, active, pointSystem, onClickSmall, smallActive}) => {
    return (
        <div className={styles.pigSelect}>
            <div className={`${styles.pigSelectButton}`}>
                {pointSystem === PointSystem.CAPPA && (<><div className={`${styles.subButton} ${smallActive && styles.active}`} onClick={onClickSmall}>1.25X</div><div className={styles.vertical} /></>)}
                <div className={`${styles.subButton} ${active && styles.active}`} onClick={onClick}>
                    2X
                </div>
            </div>
        </div>
    )
}
export const FinishTurn: FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <div className={styles.pigSelect}>
            <div className={styles.pigSelectButton} onClick={onClick}>
                <span>
                    Finish Turn
                </span>
            </div>
        </div>
    )
}
export const NewGame: FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <div className={`${styles.pigSelect} ${styles.fullSize}`}>
            <div className={styles.pigSelectButton} onClick={onClick}>
                <span>
                    New Game
                </span>
            </div>
        </div>
    )
}

export const ClearScores: FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <div className={`${styles.pigSelect} ${styles.fullSize}`}>
            <div className={styles.pigSelectButton} onClick={onClick}>
                <span>
                    Clear Scores
                </span>
            </div>
        </div>
    )
}

export const TogglePoints: FC<{onClick: () => void}> = ({onClick}) => {
    return (
        <div className={`${styles.pigSelect} ${styles.fullSize}`}>
            <div className={styles.pigSelectButton} onClick={onClick}>
                <span>
                    Toggle Points
                </span>
            </div>
        </div>
    )
}


interface RollProps {
    onClick: (roll: Roll) => void
    pointSystem?: PointSystem
    active?: boolean
}

export const Sider: FC<RollProps> = (props) => <Button roll={Roll.SIDER} {...props}/>

export const RazorBack: FC<RollProps> = (props) => <Button roll={Roll.RAZORBACK} {...props}/>

export const Trotter: FC<RollProps> = (props) => <Button roll={Roll.TROTTER} {...props}/>

export const Snouter: FC<RollProps> = (props) => <Button roll={Roll.SNOUTER} {...props}/>

export const LeaningJowler: FC<RollProps> = (props) => <Button roll={Roll.LEANING_JOWLER} {...props}/>

export const PigOut: FC<RollProps> = (props) => <Button roll={Roll.PIG_OUT} {...props}/>

export const Oinker: FC<RollProps> = (props) => <Button roll={Roll.OINKER} {...props}/>