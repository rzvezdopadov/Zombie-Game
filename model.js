const STATUS_GAME_NEW = 0;
const STATUS_GAME_IN_PROCESS = 1;
const STATUS_GAME_PAUSE = 2;
const STATUS_GAME_DEFEAT = 3;
const STATUS_GAME_VICTORY = 4;

const STATUS_GRENADE_WAIT = 0;
const STATUS_GRENADE_FLY = 1;

const LEVEL_SPEED = 2000;

model = {
    verticalCell: 15,
    horizontalCell: 7,
    level: 1,
    levelSpeed: LEVEL_SPEED,
    point: 0,
    status: STATUS_GAME_NEW,
    grenadeProgress: 0,
    grenadePosition: { x: 0, y: 0 },
    grenadeProcess: STATUS_GRENADE_WAIT,
    grenadeRadiusDefeat: 2,
    playerPosition: 0,
    zombieGenerateMin: 2,
    zombieGenerateMax: 5,
    zombiePosition: [],

    soundAchievement: () => {},
    soundBrains: () => {},
    soundFire: () => {},
    soundGameGo: () => {},
    soundGrenade: () => {},
    soundIntroTheme: () => {},
}

class ModelZombie {
    constructor() {
        this.timer = null;
    }

    clear(model) {
        model.status = STATUS_GAME_NEW;
        model.level = 1;
        model.levelSpeed = LEVEL_SPEED;
        model.grenadeProgress = 0;
        model.point = 0;

        const playerPosition = Math.round(model.horizontalCell / 2) - 1;
        model.playerPosition = playerPosition;
        model.grenadePosition.x = model.playerPosition;
        model.grenadePosition.y = model.verticalCell - 1;
        model.zombiePosition = [];
    }

    createTimerGame(model) {
        const timeOut = (model) => {
            this.addNewZombieString(model);

            this.timer = setTimeout(() => {
                if (!((model.status === STATUS_GAME_DEFEAT) || (model.status === STATUS_GAME_NEW))) {
                    timeOut(model);
                } else {
                    clearTimeout(this.timer);
                }
            }, model.levelSpeed);
        }
        timeOut(model);
    }

    startGame(model) {
        if ((model.status === STATUS_GAME_NEW) || (model.status === STATUS_GAME_DEFEAT)) {
            this.clear(model);

            model.status = STATUS_GAME_IN_PROCESS;

            this.createTimerGame(model);

            this.clearAllVoices(model);

            model.soundGameGo.play();;
        }
    }

    pauseGame(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            model.status = STATUS_GAME_PAUSE;
        } else if (model.status === STATUS_GAME_PAUSE) {
            model.status = STATUS_GAME_IN_PROCESS;
        }
    }

    stopGame(model) {
        this.clear(model);

        this.clearAllVoices(model);

        model.soundIntroTheme.play();
    }

    addNewZombieString(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            const arr = [];

            let randCountZombie = Math.floor(Math.random() * (model.zombieGenerateMax - model.zombieGenerateMin + 1)) + model.zombieGenerateMin;

            for (let i = model.zombieGenerateMin; i < randCountZombie + 2; i++) {
                let flagExit = true;

                while (flagExit) {
                    flagExit = false;

                    const newZombiePos = Math.floor(Math.random() * (model.horizontalCell));

                    for (let j = 0; j < arr.length; j++) {
                        if (arr[j] === newZombiePos) flagExit = true;
                    }

                    if (!flagExit) {
                        arr.push(newZombiePos);
                    }
                }
            }

            model.zombiePosition.push(arr);

            if (model.zombiePosition.length > model.verticalCell) model.zombiePosition.splice(0, 1);

            if (model.point % 3) model.soundBrains.play();

            this.testOnTheDefeatPlayer(model);
        }
    }

    pointInc(model) {
        let point = model.point;
        model.point++;

        const pointBefore = Math.floor(point / 100);
        const pointAfter = Math.floor(model.point / 100);

        if (pointBefore !== pointAfter) {
            model.level++;
            model.levelSpeed *= 0.9;

            model.soundAchievement.play();
        }
    }

    playerGoToLeft(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            let playerPosition = model.playerPosition;
            model.playerPositionOld = playerPosition;

            if (--playerPosition < 0) {
                playerPosition = 0;
            }

            model.playerPosition = playerPosition;
            this.grenadePositionUpdate(model);
        }
    }

    playerGoToRight(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            let playerPosition = model.playerPosition;
            model.playerPositionOld = playerPosition;

            if (++playerPosition > model.horizontalCell - 1) {
                playerPosition = model.horizontalCell - 1;
            }

            model.playerPosition = playerPosition;
            this.grenadePositionUpdate(model);
        }
    }

    grenadePositionUpdate(model) {
        if (model.grenadeProcess === STATUS_GRENADE_WAIT) {
            model.grenadePosition.x = model.playerPosition;
            model.grenadePosition.y = model.verticalCell - 1;
        }
    }

    testOnTheDefeatPlayer(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            if ((model.zombiePosition.length === (model.verticalCell)) && (model.zombiePosition[0].length > 0)) {
                model.status = STATUS_GAME_DEFEAT;
            }
        }
    }

    incGrenadeProgress(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            let grenadeProgress = model.grenadeProgress + 10;

            if (grenadeProgress > 100) {
                grenadeProgress = 100;
            }

            model.grenadeProgress = grenadeProgress;
        }
    }

    fireAmount(model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            const playerPosition = model.playerPosition;
            let zombieHit = false;
            let zombiePosition = model.zombiePosition;

            for (let i = 0; i < zombiePosition.length; i++) {
                for (let j = 0; j < zombiePosition[i].length; j++) {
                    if (zombiePosition[i][j] === playerPosition) {
                        zombiePosition[i].splice(j, 1);
                        zombieHit = true;
                        this.pointInc(model);
                        break;
                    }
                }

                if (zombieHit === true) break;
            }

            if (!zombieHit) this.addNewZombieString(model);

            model.soundFire.play();
        }
    }

    fireGrenade(model) {
        if ((model.status === STATUS_GAME_IN_PROCESS) && (model.grenadeProgress === 100)) {
            model.grenadeProgress = 0;
            model.grenadeProcess = STATUS_GRENADE_FLY;

            const fireGrenadeProcess = (model) => {

                if (--model.grenadePosition.y < 0) {
                    model.grenadePosition.y = model.verticalCell - 1;
                }

                const statusGrenade = modelZombie.testGrenadeHit(model);

                return statusGrenade;
            }

            const grenadeInterval = setInterval(() => {


                if (fireGrenadeProcess(model) || (model.grenadePosition.y === model.verticalCell - 1)) {
                    clearInterval(grenadeInterval);
                    model.grenadeProcess = STATUS_GRENADE_WAIT;

                    if (model.grenadePosition.y === model.verticalCell - 1) {
                        this.addNewZombieString(model);
                    }

                    this.grenadePositionUpdate(model);
                }
            }, 100);
        }
    }

    testGrenadeHit(model) {
        if (model.zombiePosition.length > model.grenadePosition.y) {
            let zombieHit = false;
            const zombiePosition = (model.zombiePosition.length - model.grenadePosition.y) - 1;

            for (let i = 0; i < model.zombiePosition[zombiePosition].length; i++) {
                if (model.zombiePosition[zombiePosition][i] === model.grenadePosition.x) zombieHit = true;
            }

            if (zombieHit === true) {
                let minX = model.grenadePosition.x - model.grenadeRadiusDefeat;
                if (minX < 0) minX = 0;

                let maxX = model.grenadePosition.x + model.grenadeRadiusDefeat;
                if (maxX > model.horizontalCell - 1) model.maxX = model.horizontalCell - 1;

                let minY = model.zombiePosition.length - (model.grenadePosition.y + model.grenadeRadiusDefeat + 1);
                if (minY < 0) minY = 0;

                let maxY = model.zombiePosition.length - (model.grenadePosition.y - model.grenadeRadiusDefeat + 1);
                if (maxY > model.zombiePosition.length) maxY = model.zombiePosition.length;

                for (let i = minY; i < maxY + 1; i++) {
                    if (model.zombiePosition[i] && (model.zombiePosition[i].length > 0)) {
                        for (let j = model.zombiePosition[i].length - 1; j > -1; j--) {
                            const zombiePositionIn = model.zombiePosition[i][j];

                            if ((zombiePositionIn >= minX) && ((zombiePositionIn) <= maxX)) {
                                model.zombiePosition[i].splice(j, 1);
                                this.pointInc(model);
                            }
                        }
                    }
                }

                model.soundGrenade.play();

                return true;
            }
        }

        return false;
    }

    getKeyUpUser(event, model) {
        if (model.status === STATUS_GAME_IN_PROCESS) {
            switch (event.code) {
                case 'ArrowLeft':
                    this.playerGoToLeft(model);
                    break;

                case 'ArrowRight':
                    this.playerGoToRight(model);
                    break;

                case 'Space':
                    this.fireAmount(model);
                    break;

                case 'KeyG':
                    this.fireGrenade(model);
                    break;
            }
        }
    }

    setHandlerVoice(model, fire, grenade, achivement, brains, introTheme, gameGo) {
        const addSound = sound => {
            if (sound) {
                return {
                    play: () => {
                        sound.autoplay = true;
                        const promise = sound.play();

                        promise.then(() => {}).catch((e) => {});
                    },
                    stop: () => {
                        sound.pause();
                        sound.currentTime = 0;
                    }
                }
            }

            return { play: () => {}, stop: () => {} }
        }

        const addArrSound = arrSound => {
            if (Array.isArray(arrSound) && arrSound.length > 0) {
                return {
                    sound: null,
                    play: function() {
                        this.sound = arrSound[Math.floor(Math.random() * arrSound.length)];
                        this.sound.play();
                    },
                    stop: function() {
                        if (this.sound) {
                            this.sound.pause();
                            this.sound.currentTime = 0;
                        }
                    }
                }
            }

            return { play: () => {}, stop: () => {} }
        }

        model.soundFire = addSound(fire);
        model.soundGrenade = addSound(grenade);
        model.soundAchievement = addSound(achivement);
        model.soundBrains = addArrSound(brains);
        model.soundIntroTheme = addSound(introTheme);
        model.soundGameGo = addArrSound(gameGo);
    }

    clearAllVoices(model) {
        model.soundFire.stop();
        model.soundGrenade.stop();
        model.soundAchievement.stop();
        model.soundBrains.stop();
        model.soundIntroTheme.stop();
        model.soundGameGo.stop();
    }
}

const modelZombie = new ModelZombie();

window.addEventListener('load',
    () => {
        modelZombie.clear(model);
    }
);