const STATUS_GAME_NEW = 0;
const STATUS_GAME_IN_PROCESS = 1;
const STATUS_GAME_PAUSE = 2;
const STATUS_GAME_DEFEAT = 3;
const STATUS_GAME_VICTORY = 4;

const STATUS_GRENADE_WAIT = 0;
const STATUS_GRENADE_FLY = 1;

const LEVEL_SPEED = 2000;

class Model {
    constructor() {
        this.verticalCell = 15;
        this.horizontalCell = 7;
        this.level = 1;
        this.levelSpeed = LEVEL_SPEED;
        this.point = 0;
        this.status = STATUS_GAME_NEW;
        this.grenadeProgress = 0;
        this.grenadePosition = { x: 0, y: 0 };
        this.grenadeProcess = STATUS_GRENADE_WAIT;
        this.grenadeRadiusDefeat = 2;
        this.playerPosition = 0;
        this.zombieGenerateMin = 2;
        this.zombieGenerateMax = 5;
        this.zombiePosition = [];

        this.soundAchievement = () => {};
        this.soundBrains = () => {};
        this.soundFire = () => {};
        this.soundGameGo = () => {};
        this.soundGrenade = () => {};
        this.soundIntroTheme = () => {};

        this.render = () => {};

        this.timer = null;
    }

    clear() {
        this.status = STATUS_GAME_NEW;
        this.level = 1;
        this.levelSpeed = LEVEL_SPEED;
        this.grenadeProgress = 0;
        this.point = 0;

        const playerPosition = Math.round(this.horizontalCell / 2) - 1;
        this.playerPosition = playerPosition;
        this.grenadePosition.x = this.playerPosition;
        this.grenadePosition.y = this.verticalCell - 1;
        this.zombiePosition = [];

        this.render();
    }

    createTimerGame() {
        const timeOut = (model) => {
            model.addNewZombieString();

            model.timer = setTimeout(() => {
                if (!((model.status === STATUS_GAME_DEFEAT) || (model.status === STATUS_GAME_NEW))) {
                    timeOut(model);
                } else {
                    clearTimeout(model.timer);
                }
            }, model.levelSpeed);
        }

        timeOut(this);
    }

    startGame() {
        if ((model.status === STATUS_GAME_NEW) || (model.status === STATUS_GAME_DEFEAT)) {
            this.clear();

            this.status = STATUS_GAME_IN_PROCESS;

            this.createTimerGame();

            this.clearAllVoices();

            this.soundGameGo.play();;
        }
    }

    pauseGame() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            this.status = STATUS_GAME_PAUSE;
        } else if (this.status === STATUS_GAME_PAUSE) {
            this.status = STATUS_GAME_IN_PROCESS;
        }
    }

    stopGame() {
        this.clear();

        this.clearAllVoices();

        this.soundIntroTheme.play();
    }

    addNewZombieString() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            const arr = [];

            let randCountZombie = Math.floor(Math.random() * (this.zombieGenerateMax - this.zombieGenerateMin + 1)) + this.zombieGenerateMin;

            for (let i = this.zombieGenerateMin; i < randCountZombie + 2; i++) {
                let flagExit = true;

                while (flagExit) {
                    flagExit = false;

                    const newZombiePos = Math.floor(Math.random() * (this.horizontalCell));

                    for (let j = 0; j < arr.length; j++) {
                        if (arr[j] === newZombiePos) flagExit = true;
                    }

                    if (!flagExit) {
                        arr.push(newZombiePos);
                    }
                }
            }

            this.zombiePosition.push(arr);

            if (this.zombiePosition.length > this.verticalCell) this.zombiePosition.splice(0, 1);

            if (this.point % 3) this.soundBrains.play();

            this.testOnTheDefeatPlayer();

            this.render();
        }
    }

    pointInc() {
        let point = this.point;
        this.point++;

        const pointBefore = Math.floor(point / 100);
        const pointAfter = Math.floor(this.point / 100);

        if (pointBefore !== pointAfter) {
            this.level++;
            this.levelSpeed *= 0.9;

            this.soundAchievement.play();
        }
    }

    playerGoToLeft() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            let playerPosition = this.playerPosition;
            this.playerPositionOld = playerPosition;

            if (--playerPosition < 0) {
                playerPosition = 0;
            }

            this.playerPosition = playerPosition;
            this.grenadePositionUpdate();
        }
    }

    playerGoToRight() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            let playerPosition = this.playerPosition;
            this.playerPositionOld = playerPosition;

            if (++playerPosition > this.horizontalCell - 1) {
                playerPosition = this.horizontalCell - 1;
            }

            this.playerPosition = playerPosition;
            this.grenadePositionUpdate(this);
        }
    }

    grenadePositionUpdate() {
        if (this.grenadeProcess === STATUS_GRENADE_WAIT) {
            this.grenadePosition.x = this.playerPosition;
            this.grenadePosition.y = this.verticalCell - 1;

            this.render();
        }
    }

    testOnTheDefeatPlayer() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            if ((this.zombiePosition.length === (this.verticalCell)) && (this.zombiePosition[0].length > 0)) {
                this.status = STATUS_GAME_DEFEAT;
            }
        }
    }

    incGrenadeProgress() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            let grenadeProgress = this.grenadeProgress + 10;

            if (grenadeProgress > 100) {
                grenadeProgress = 100;
            }

            this.grenadeProgress = grenadeProgress;

            this.render();
        }
    }

    fireAmount() {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            const playerPosition = this.playerPosition;
            let zombieHit = false;
            let zombiePosition = this.zombiePosition;

            for (let i = 0; i < zombiePosition.length; i++) {
                for (let j = 0; j < zombiePosition[i].length; j++) {
                    if (zombiePosition[i][j] === playerPosition) {
                        zombiePosition[i].splice(j, 1);
                        zombieHit = true;
                        this.pointInc();
                        break;
                    }
                }

                if (zombieHit === true) break;
            }

            if (!zombieHit) {
                this.addNewZombieString();
            } else {
                this.render();
            }

            this.soundFire.play();
        }
    }

    fireGrenade() {
        if ((this.status === STATUS_GAME_IN_PROCESS) && (this.grenadeProgress === 100)) {
            this.grenadeProgress = 0;
            this.grenadeProcess = STATUS_GRENADE_FLY;

            const fireGrenadeProcess = () => {

                if (--this.grenadePosition.y < 0) {
                    this.grenadePosition.y = this.verticalCell - 1;
                }

                const statusGrenade = this.testGrenadeHit();

                this.render();

                return statusGrenade;
            }

            const grenadeInterval = setInterval(() => {
                if (fireGrenadeProcess() || (this.grenadePosition.y === this.verticalCell - 1)) {
                    clearInterval(grenadeInterval);
                    this.grenadeProcess = STATUS_GRENADE_WAIT;

                    if (this.grenadePosition.y === this.verticalCell - 1) {
                        this.addNewZombieString();
                    }

                    this.grenadePositionUpdate();
                }
            }, 100);
        }
    }

    testGrenadeHit() {
        if (this.zombiePosition.length > this.grenadePosition.y) {
            let zombieHit = false;
            const zombiePosition = (this.zombiePosition.length - this.grenadePosition.y) - 1;

            for (let i = 0; i < this.zombiePosition[zombiePosition].length; i++) {
                if (this.zombiePosition[zombiePosition][i] === this.grenadePosition.x) zombieHit = true;
            }

            if (zombieHit === true) {
                let minX = this.grenadePosition.x - this.grenadeRadiusDefeat;
                if (minX < 0) minX = 0;

                let maxX = this.grenadePosition.x + this.grenadeRadiusDefeat;
                if (maxX > this.horizontalCell - 1) this.maxX = this.horizontalCell - 1;

                let minY = this.zombiePosition.length - (this.grenadePosition.y + this.grenadeRadiusDefeat + 1);
                if (minY < 0) minY = 0;

                let maxY = this.zombiePosition.length - (this.grenadePosition.y - this.grenadeRadiusDefeat + 1);
                if (maxY > this.zombiePosition.length) maxY = this.zombiePosition.length;

                for (let i = minY; i < maxY + 1; i++) {
                    if (this.zombiePosition[i] && (this.zombiePosition[i].length > 0)) {
                        for (let j = this.zombiePosition[i].length - 1; j > -1; j--) {
                            const zombiePositionIn = this.zombiePosition[i][j];

                            if ((zombiePositionIn >= minX) && ((zombiePositionIn) <= maxX)) {
                                this.zombiePosition[i].splice(j, 1);
                                this.pointInc();
                            }
                        }
                    }
                }

                this.soundGrenade.play();

                return true;
            }
        }

        return false;
    }

    getKeyUpUser(event) {
        if (this.status === STATUS_GAME_IN_PROCESS) {
            switch (event.code) {
                case 'ArrowLeft':
                    this.playerGoToLeft();
                    break;

                case 'ArrowRight':
                    this.playerGoToRight();
                    break;

                case 'Space':
                    this.fireAmount();
                    break;

                case 'KeyG':
                    this.fireGrenade();
                    break;
            }
        }
    }

    setHandlerVoice(fire, grenade, achivement, brains, introTheme, gameGo) {
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

        this.soundFire = addSound(fire);
        this.soundGrenade = addSound(grenade);
        this.soundAchievement = addSound(achivement);
        this.soundBrains = addArrSound(brains);
        this.soundIntroTheme = addSound(introTheme);
        this.soundGameGo = addArrSound(gameGo);
    }

    clearAllVoices() {
        this.soundFire.stop();
        this.soundGrenade.stop();
        this.soundAchievement.stop();
        this.soundBrains.stop();
        this.soundIntroTheme.stop();
        this.soundGameGo.stop();
    }

    setHandlerRedraw(clbk) {
        if (typeof(clbk) === 'function') {
            this.render = clbk;
        }
    }
}