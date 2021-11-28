const initController = (model) => {
    const startGame = () => { modelZombie.startGame(model) }
    const pauseGame = () => { modelZombie.pauseGame(model) }
    const stopGame = () => { modelZombie.stopGame(model) }
    viewZombie.setHandlerButton(startGame, pauseGame, stopGame);

    const eventGame = (event) => { modelZombie.getKeyUpUser(event, model) };
    viewZombie.setHandlerKey(eventGame);

    setInterval(() => {
        modelZombie.incGrenadeProgress(model);
    }, 1000);
}

window.addEventListener('load',
    () => {
        initController(model);
    }
);