class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        this.model.clear();

        this.view.createAllViewInterface(this);

        const startGame = () => { this.model.startGame() }
        const pauseGame = () => { this.model.pauseGame() }
        const stopGame = () => { this.model.stopGame() }
        this.view.setHandlerButton(startGame, pauseGame, stopGame);

        const eventGameKey = event => { this.model.getKeyUpUser(event) };
        this.view.setHandlerKey(eventGameKey);

        const eventGameTouch = event => { this.model.getTouchUser(event) };
        this.view.setHandlerTouch(eventGameTouch);

        const soundAchievement = new Audio('sound/Achievement.mp3');
        const soundBrains1 = new Audio('sound/Brains1.mp3');
        const soundBrains2 = new Audio('sound/Brains2.mp3');
        const soundFire = new Audio('sound/Fire.mp3');
        const soundGameGo1 = new Audio('sound/GameGo1.mp3');
        const soundGameGo2 = new Audio('sound/GameGo2.mp3');
        const soundGameGo3 = new Audio('sound/GameGo3.mp3');
        const soundGameGo4 = new Audio('sound/GameGo4.mp3');
        const soundGrenade = new Audio('sound/Grenade.mp3');
        const soundIntroTheme = new Audio('sound/IntroTheme.mp3');

        this.model.setHandlerVoice(
            soundFire, soundGrenade,
            soundAchievement, [soundBrains1, soundBrains2],
            soundIntroTheme, [soundGameGo1, soundGameGo2, soundGameGo3, soundGameGo4]
        );

        this.model.setHandlerRedraw(this.view.redraw.bind(this));

        setInterval(() => {
            this.model.incGrenadeProgress();
        }, 1000);


        setTimeout(() => {
            this.model.stopGame();
        }, 2000);
    }
}

window.addEventListener('load',
    () => {
        controller.init();
    }
);

const model = new Model();
const view = new View();
const controller = new Controller(model, view);