const initController = (model) => {
    const startGame = () => { modelZombie.startGame(model) }
    const pauseGame = () => { modelZombie.pauseGame(model) }
    const stopGame = () => { modelZombie.stopGame(model) }
    viewZombie.setHandlerButton(startGame, pauseGame, stopGame);

    const eventGame = (event) => { modelZombie.getKeyUpUser(event, model) };
    viewZombie.setHandlerKey(eventGame);

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
    modelZombie.setHandlerVoice(model, soundFire, soundGrenade, soundAchievement, [soundBrains1, soundBrains2], soundIntroTheme, [soundGameGo1, soundGameGo2, soundGameGo3, soundGameGo4]);

    setInterval(() => {
        modelZombie.incGrenadeProgress(model);
    }, 1000);


    setTimeout(() => {
        modelZombie.stopGame(model);
    }, 2000);
}

window.addEventListener('load',
    () => {
        initController(model);
    }
);