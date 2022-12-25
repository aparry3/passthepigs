import { faBars, faBurger, faPencil, faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FC, useEffect, useState } from "react"
import styles from './App.module.scss'
import { Double, FinishTurn, LeaningJowler, NewGame, Oinker, PigOut, RazorBack, Sider, Snouter, Trotter } from "./Buttons"

interface Turn {
    rolls: Array<Roll | [Roll, Roll]>
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

export const getValue = (roll: Roll) => {
    switch(roll) {
        case(Roll.LEANING_JOWLER): return 15
        case(Roll.SNOUTER): return 10
        case(Roll.SIDER): return 1
        case(Roll.TROTTER): return 5
        case(Roll.RAZORBACK): return 5
        default:
            return 0
    }
}

const count = (turn: Array<Roll | Roll[]>, current: number): number => {
    console.log(turn[turn.length - 1])
    console.log(turn[turn.length - 1] === Roll.PIG_OUT)
    if (turn[turn.length - 1] === Roll.PIG_OUT) return 0
    if (turn[turn.length - 1] === Roll.OINKER) return -1 * current

    return turn.reduce<number>((total, roll) => {
        if (roll instanceof Array) {
            let count = getValue(roll[0]) + getValue(roll[1])
            if (roll[0] === roll[1]) {
                count = count * 2
            }
            return total + count
        }
        return total + getValue(roll)

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
    const [gameState, setGameState] = useState<GameState>(GameState.SETUP)
    const [players, setPlayers] = useState<Player[]>([])
    const [currentPlayer, setCurrentPlayer] = useState<number>(0)
    const [tab, setTab] = useState<Tabs>(Tabs.PLAYERS)

    const [turn, setTurn] = useState<Turn>(newTurn())
    const [double, setDouble] = useState<boolean>(false)

    useEffect(() => {
        const _players = getLocally('players') as Player[]
        const _currentPlayer = getLocally('currentPlayer') as number
        if (_players) {
            setPlayers(_players)
            setCurrentPlayer(_currentPlayer)
            setGameState(GameState.PLAY)
            setTab(Tabs.ROLL)
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
        window.localStorage.setItem('currentPlayer', JSON.stringify(player))
        window.localStorage.setItem('players', JSON.stringify(players))
    }
    const getLocally = (key: 'players' | 'currentPlayer'): Player[] | number => {
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
        } else {
            _turn.rolls.push(roll)
        }
        const points = count(_turn.rolls, players[currentPlayer].points)
        _turn.points = points
        setTurn(_turn)
        if (TURN_ENDING_ROLLS.includes(roll)) {
            finishTurn(_turn)
       }

    }

    const handleNweGame = () => {
        
    }

    return (
        <div className={styles.app}>
            <div className={styles.tabs}>
                <div className={`${styles.tab} ${styles.menu} ${tab === Tabs.MENU && styles.active}`} onClick={() => setTab(Tabs.MENU)}><FontAwesomeIcon icon={faBars} /></div>
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
                        <Sider onClick={handleRoll}/>
                        <RazorBack onClick={handleRoll}/>
                        <Trotter onClick={handleRoll}/>
                        <Snouter onClick={handleRoll}/>
                        <LeaningJowler onClick={handleRoll}/>
                        <Double onClick={() => setDouble(true)}/>
                    </div>
                    <hr />
                    <div className={styles.section}>
                        <PigOut onClick={handleRoll}/>
                        <Oinker onClick={handleRoll}/>
                    </div>
                </>
                ) : tab === Tabs.PLAYERS ? (
                    <div className={styles.playersPage}>
                        <div className={styles.playersContent}>
                            <Players onNewPlayer={handleNewPlayer} onRemovePlayer={handleRemovePlayer} players={players} gameState={gameState}/>            
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
}

const Player: FC<PlayerProps> = ({player, removePlayer, gameState}) => {
    return (
        <div className={styles.playerContainer}>
            <div className={styles.playerName}>{player.name}</div>
            <div className={styles.playerPoints}>{player.points}</div>
            {gameState !== GameState.PLAY && (
                <>
                    <div className={styles.button}><FontAwesomeIcon icon={faPencil} /></div>
                    <div className={styles.button} onClick={removePlayer}><FontAwesomeIcon icon={faX} /></div>
                </>
            )}
        </div>
    )
}

interface PlayersProps {
    players: Player[]
    gameState: GameState
    onNewPlayer: (name: string) => void
    onRemovePlayer: (index: number) => void
}

const Players: FC<PlayersProps> = ({players, onNewPlayer, onRemovePlayer, gameState}) => {
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
                <Player key={player.name} player={player} removePlayer={() => onRemovePlayer(index)} gameState={gameState}/>
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