import { FC, useState } from "react"
import { getValue, PointSystem, Roll } from "./App"
import styles from './Buttons.module.scss'

interface ButtonProps {
    roll: Roll
    onClick: (roll: Roll) => void
    pointSystem?: PointSystem
}

export const Button: FC<ButtonProps> = ({roll, onClick, pointSystem = PointSystem.DEFAULT}) => {
    const points = getValue(roll, pointSystem)
    const [active, setActive] = useState<boolean>(false)
    return (
        <div className={styles.pigSelect}>
            <div 
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                onMouseDown={() => setActive(true)} 
                onMouseUp={() => setActive(false)}
                onTouchStart={() => setActive(true)} 
                onTouchEnd={() => setActive(false)} 

                className={`${styles.pigSelectButton} ${active && styles.active}`} 
                onClick={() => onClick(roll)}>
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


export const Double: FC<{onClick: () => void, active?: boolean}> = ({onClick, active}) => {
    return (
        <div className={styles.pigSelect}>
            <div className={`${styles.pigSelectButton} ${active && styles.active}`} onClick={onClick}>
                <span>
                    2X
                </span>
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
}

export const Sider: FC<RollProps> = (props) => <Button roll={Roll.SIDER} {...props}/>

export const RazorBack: FC<RollProps> = (props) => <Button roll={Roll.RAZORBACK} {...props}/>

export const Trotter: FC<RollProps> = (props) => <Button roll={Roll.TROTTER} {...props}/>

export const Snouter: FC<RollProps> = (props) => <Button roll={Roll.SNOUTER} {...props}/>

export const LeaningJowler: FC<RollProps> = (props) => <Button roll={Roll.LEANING_JOWLER} {...props}/>

export const PigOut: FC<RollProps> = (props) => <Button roll={Roll.PIG_OUT} {...props}/>

export const Oinker: FC<RollProps> = (props) => <Button roll={Roll.OINKER} {...props}/>