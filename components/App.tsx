import { faBars, faChevronDown, faChevronUp, faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useState } from "react"
import styles from './App.module.scss'
import { ClearScores, Double, FinishTurn, LeaningJowler, NewGame, Oinker, PigOut, RazorBack, Sider, Snouter, TogglePoints, Trotter } from "./Buttons"

interface Turn {
    rolls: Array<Roll | [Roll, Roll] | [number, Roll, Roll]>
    points: number
}

interface Player {
    name: string
    points: number
    history: Array<Turn>
}

enum Tabs {
    ROLL,
    PLAYERS,
    MENU
}
enum GameState {
    SETUP,
    PLAY
}

export enum Roll {
    SIDER = 'Sider',
    RAZORBACK = 'Razorback',
    TROTTER = 'Trotter',
    SNOUTER = 'Snouter',
    LEANING_JOWLER = 'Leaning Jowler',
    OINKER = 'Oinker',
    PIG_OUT = 'Pig Out',
    COMBO = 'COMBO'
}

const TURN_ENDING_ROLLS = [Roll.OINKER, Roll.PIG_OUT]


const POINTS = [
    new Map([
        [Roll.LEANING_JOWLER, 15],
        [Roll.SNOUTER, 10],
        [Roll.SIDER, 1],
        [Roll.TROTTER, 5],
        [Roll.RAZORBACK, 5],
    ]),
    new Map([
        [Roll.LEANING_JOWLER, 25],
        [Roll.SNOUTER, 15],
        [Roll.SIDER, 1],
        [Roll.TROTTER, 5],
        [Roll.RAZORBACK, 3],
    ])
]
export enum PointSystem {
    DEFAULT = 0,
    CAPPA = 1
}

export const getValue = (roll: Roll, system: PointSystem = PointSystem.DEFAULT): number => {
    const pointsMap = POINTS[system]
    if (pointsMap.has(roll)) {
        return pointsMap.get(roll)!
    }
    return 0
    // switch(roll) {
    //     case(Roll.LEANING_JOWLER): return 15
    //     case(Roll.SNOUTER): return 10
    //     case(Roll.SIDER): return 1
    //     case(Roll.TROTTER): return 5
    //     case(Roll.RAZORBACK): return 5
    //     default:
    //         return 0
    // }
}

const count = (turn: Array<Roll | [Roll, Roll] | [number, Roll, Roll]>, current: number, pointSystem: PointSystem = PointSystem.DEFAULT): number => {
    if (turn[turn.length - 1] === Roll.PIG_OUT) return 0
    if (turn[turn.length - 1] === Roll.OINKER) return -1 * current

    return turn.reduce<number>((total, roll) => {
        if (roll instanceof Array) {
            let _count = 0
            if (typeof roll[0] ===  'number') {
                _count = getValue(roll[1], pointSystem) + getValue(roll[2], pointSystem)
                _count = _count * roll[0]
            } else {
                _count = getValue(roll[0], pointSystem) + getValue(roll[1], pointSystem)
                _count = pointSystem === PointSystem.CAPPA ? _count * 3 : _count * 2
            }
            return total + _count
        }
        return total + getValue(roll, pointSystem)

    }, 0)

}

const newPlayer = (name: string) => {
    return {
        name: name,
        points: 0,
        history: []
    }
}

const newTurn = () => {
    return {
        points: 0,
        rolls: []
    }
}
const PassThePigsCounter: FC<{}> = ({}) => {
    const [pointSystem, setPointSystem] = useState<PointSystem>(PointSystem.DEFAULT)

    const [gameState, setGameState] = useState<GameState>(GameState.SETUP)
    const [players, setPlayers] = useState<Player[]>([])
    const [currentPlayer, setCurrentPlayer] = useState<number>(0)
    const [tab, setTab] = useState<Tabs>(Tabs.PLAYERS)

    const [turn, setTurn] = useState<Turn>(newTurn())
    const [double, setDouble] = useState<boolean>(false)
    const [multiple, setMultiple] = useState<boolean>(false)
    const [multipleFirst, setMultipleFirst] = useState<Roll | undefined>()

    useEffect(() => {
        const _players = getLocally('players') as Player[]
        const _currentPlayer = getLocally('currentPlayer') as number
        const _pointSystem = getLocally('pointSystem') as PointSystem
        console.log(_pointSystem)
        if (_players) {
            setPlayers(_players)
            setCurrentPlayer(_currentPlayer)
            setGameState(GameState.PLAY)
            setTab(Tabs.ROLL)
            setPointSystem(_pointSystem)
        }
    }, [])

    const handleNewPlayer = (name: string) => {
        setPlayers([...players, newPlayer(name)])
    }
    const handleRemovePlayer = (index: number) => {
        const _players = [...players]
        _players.splice(index, 1)
        console.log(_players)
        setPlayers(_players)
    }
    
    const play = () => {
        setGameState(GameState.PLAY)
        setTab(Tabs.ROLL)
    }
    const saveLocally = (player: number) => {
        console.log(pointSystem)
        window.localStorage.setItem('currentPlayer', JSON.stringify(player))
        window.localStorage.setItem('players', JSON.stringify(players))
        window.localStorage.setItem('pointSystem', JSON.stringify(pointSystem))
    }
    const getLocally = (key: 'players' | 'currentPlayer' | 'pointSystem'): Player[] | number => {
        const value = window.localStorage.getItem(key)
        return value ? JSON.parse(value) : undefined
    }
    const clearLocally = () => {
        window.localStorage.clear()
        setCurrentPlayer(0)
        setTab(Tabs.PLAYERS)
        setGameState(GameState.SETUP)
        setPlayers([])
    }

    const finishTurn = (thisTurn: Turn) => {
        setDouble(false)
        const _players = [...players]
        _players[currentPlayer].history.push(thisTurn)
        _players[currentPlayer].points = _players[currentPlayer].points + thisTurn.points
        
        const _currentPlayer = (currentPlayer + 1) % players.length
        setCurrentPlayer(_currentPlayer)
        setPlayers(_players)
        setTurn(newTurn())
        saveLocally(_currentPlayer)
    }

    const handleRoll = (roll: Roll) => {
        const _turn = {...turn}
        if (double) {
            _turn.rolls.push([roll, roll])
            setDouble(false)
        } else if (multiple) {
            if (!multipleFirst) {
                setMultipleFirst(roll)
            } else {
                _turn.rolls.push([2, multipleFirst, roll])
                setMultiple(false)
                setMultipleFirst(undefined)
            }
        } else {
            _turn.rolls.push(roll)
        }
        const points = count(_turn.rolls, players[currentPlayer].points, pointSystem)
        _turn.points = points
        setTurn(_turn)
        if (TURN_ENDING_ROLLS.includes(roll)) {
            finishTurn(_turn)
       }

    }

    const movePlayer = (up: boolean, index: number) => {
        if (up && index === 0) return
        if (!up && index === players.length - 1) return

        const _players = [...players]
        const player = _players.splice(index, 1)[0]
        _players.splice(up ? index - 1 : index + 1, 0, player)
        setPlayers(_players)
    }

    const clearScore = () => {
        const _players = players.map(p => newPlayer(p.name))
        setPlayers(_players)
        setTab(Tabs.ROLL)
    }

    const togglePoints = () => {
        setPointSystem(pointSystem === PointSystem.DEFAULT ? PointSystem.CAPPA : PointSystem.DEFAULT)
    }

    return (
        <div className={styles.app}>
            <div className={styles.tabs}>
                <div className={`${styles.tab} ${styles.menu} ${tab === Tabs.MENU && styles.active}`} onClick={() => setTab(Tabs.MENU)}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
                <div className={`${styles.tab} ${tab === Tabs.ROLL && styles.active}`} onClick={players.length ? () => setTab(Tabs.ROLL) : () => {}}>Rolls the Pigs</div>
                <div className={`${styles.tab} ${tab === Tabs.PLAYERS && styles.active}`} onClick={() => setTab(Tabs.PLAYERS)}>Players</div>
            </div>
            <div className={styles.content}>
                {tab === Tabs.ROLL ? (
                <>
                    <div className={styles.section}>
                        <Player player={players[currentPlayer]} gameState={gameState}/>
                    </div>
                    <hr />
                    <div className={styles.currentTurn}>
                        <div className={styles.points}>{turn.points} {`(${turn.points + players[currentPlayer].points})`}</div>
                        <FinishTurn onClick={() => finishTurn(turn)}/>
                    </div>
                    <hr />
                    <div className={styles.section}>
                        <Sider pointSystem={pointSystem} active={multiple && multipleFirst === Roll.SIDER} onClick={handleRoll}/>
                        <RazorBack pointSystem={pointSystem} active={multiple && multipleFirst === Roll.RAZORBACK} onClick={handleRoll}/>
                        <Trotter pointSystem={pointSystem} active={multiple && multipleFirst === Roll.TROTTER} onClick={handleRoll}/>
                        <Snouter pointSystem={pointSystem} active={multiple && multipleFirst === Roll.SNOUTER} onClick={handleRoll}/>
                        <LeaningJowler pointSystem={pointSystem} active={multiple && multipleFirst === Roll.LEANING_JOWLER} onClick={handleRoll}/>
                        <Double pointSystem={pointSystem} smallActive={multiple} onClickSmall={() => {setMultiple(true); setDouble(false)}} active={double} onClick={() =>{setDouble(true); setMultiple(false)}}/>
                    </div>
                    <hr />
                    <div className={styles.section}>
                        <Oinker onClick={handleRoll}/>
                        <PigOut onClick={handleRoll}/>
                    </div>
                </>
                ) : tab === Tabs.PLAYERS ? (
                    <div className={styles.playersPage}>
                        <div className={styles.playersContent}>
                            <Players movePlayer={movePlayer} onNewPlayer={handleNewPlayer} onRemovePlayer={handleRemovePlayer} players={players} gameState={gameState}/>            
                            {gameState == GameState.SETUP && (
                            <div className={styles.playButtonContainer}>
                                <div className={styles.playButton} onClick={players.length ? play : () => {}}>
                                    Lets Roll the Pigs!
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                ): (
                    <div className={styles.newGameContent}>
                       <NewGame onClick={clearLocally}/>
                       <ClearScores onClick={clearScore}/>
                       <TogglePoints onClick={togglePoints}/>
                    </div>
                )}
            </div>
        </div>
    )
}

interface PlayerProps {
    player: Player
    removePlayer?: () => void
    gameState?: GameState
    movePlayer?: (up: boolean) => void
    last?: boolean
    first?: boolean
}

const Player: FC<PlayerProps> = ({player, first = false, last = false, removePlayer, gameState, movePlayer}) => {
    const canMove = (up: boolean) => {
        return up ? movePlayer && !first : movePlayer && !last
    }
    return (
        <div className={styles.playerContainer}>
            <div className={styles.playerName}>
                {canMove(true) && <span className={styles.icon} onClick={() => movePlayer?.(true)}><FontAwesomeIcon icon={faChevronUp}  style={{height: '15px'}}/></span>}
                <span>{player.name}</span>
                {canMove(false) && <span className={styles.icon} onClick={() => movePlayer?.(false)}><FontAwesomeIcon icon={faChevronDown}  style={{height: '15px'}}/></span>}
            </div>
            <div className={styles.playerPoints}>{player.points}</div>

            {gameState !== GameState.PLAY && (
                <div className={styles.button} onClick={removePlayer}>
                    <span><FontAwesomeIcon icon={faX} style={{height: '15px'}}/></span>
                </div>
            )}
        </div>
    )
}

interface PlayersProps {
    players: Player[]
    gameState: GameState
    onNewPlayer: (name: string) => void
    onRemovePlayer: (index: number) => void
    movePlayer: (up: boolean, index: number) => void
}

const Players: FC<PlayersProps> = ({players, onNewPlayer, onRemovePlayer, gameState, movePlayer}) => {
    const [newPlayerName, setNewPlayerName] = useState<string>('')
    console.log(players)
    const handleNewPlayer = () => {
        if (newPlayerName) {
            onNewPlayer(newPlayerName)
            setNewPlayerName('')
        }
    }

    return (
        <div className={styles.playersContainer}>
            
            {players.map((player, index) => (
                <Player last={index === players.length - 1} first={index === 0} movePlayer={(up) => movePlayer(up, index)} key={player.name} player={player} removePlayer={() => onRemovePlayer(index)} gameState={gameState}/>
            ))}
            <div className={styles.playerInputContainer} >
                <label htmlFor="name" className={styles.playerNameLabel}>Name</label>
                <input 
                    name="name"
                    className={styles.playerInput} 
                    value={newPlayerName} 
                    onChange={e => setNewPlayerName(e.target.value)}/>
                <div className={styles.saveButtonContainer}>
                    <div className={styles.saveButton} onClick={handleNewPlayer}>
                        Add Player
                    </div>
                </div>
            </div>
        </div>
    )
}


export default PassThePigsCounter