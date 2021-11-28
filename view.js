const statusGame = ['Новая игра', 'В процессе игры', 'Пауза', 'Поражение', 'Победа'];
const playerDiv = '<div class="player"><div>';
const zombieDiv = '<div class="zombie"><div>';
const grenadeDiv = '<div class="grenade"><div>';

class ViewZombie {
    createCell(model) {
        const elemDivTable = document.createElement('div');
        elemDivTable.classList.add('flex');
        elemDivTable.id = 'divTable';

        const elemTable = document.createElement('table');

        let posId = 0;

        for (let i = 0; i < model.verticalCell; i += 1) {
            const elemTr = document.createElement('tr');

            for (let j = 0; j < model.horizontalCell; j += 1) {
                const elemTd = document.createElement('td');
                elemTd.id = posId++;
                elemTd.classList.add('tdaria');
                elemTr.appendChild(elemTd);
            }

            elemTable.appendChild(elemTr);
        }

        elemDivTable.appendChild(elemTable);

        return elemDivTable;
    }

    createButtonInterface() {
        const elemDivBtn = document.createElement('div');
        elemDivBtn.classList.add('flex');

        const createBtn = (name, id) => {
            const elemBtn = document.createElement('button');
            elemBtn.classList.add('button');
            elemBtn.innerHTML = name;
            elemBtn.id = id;

            return elemBtn;
        }

        elemDivBtn.appendChild(createBtn('Старт', 'start'));
        elemDivBtn.appendChild(createBtn('Пауза', 'pause'));
        elemDivBtn.appendChild(createBtn('Стоп', 'stop'));

        return elemDivBtn;
    }

    createStatisticsInterface(model) {
        const elemDivStatistics = document.createElement('div');
        elemDivStatistics.classList.add('statistics');

        const createStr = (name, id, value) => {
            const elemDiv = document.createElement('div');
            elemDiv.classList.add('flex');

            const elemSpan = document.createElement('span');
            elemSpan.innerHTML = `${name}&nbsp;`;
            elemDiv.appendChild(elemSpan);

            const elemSpanVal = document.createElement('span');

            if (id) {
                elemSpanVal.classList.add(id);
                elemSpanVal.id = id;
            }

            elemSpanVal.innerHTML = `${value}&nbsp;`;
            elemDiv.appendChild(elemSpanVal);

            return elemDiv;
        }

        elemDivStatistics.appendChild(createStr('Игрок влево:', '', '&lArr;'));
        elemDivStatistics.appendChild(createStr('Игрок вправо:', '', '&rArr;'));
        elemDivStatistics.appendChild(createStr('Стрелять:', '', 'Пробел'));
        elemDivStatistics.appendChild(createStr('Граната:', '', 'G'));

        elemDivStatistics.appendChild(createStr('', '', ''));

        elemDivStatistics.appendChild(createStr('Статус:', 'status', statusGame[model.status]));
        elemDivStatistics.appendChild(createStr('Уровень:', 'level', model.level));
        elemDivStatistics.appendChild(createStr('Набрано очков:', 'point', model.point));

        const elemDiv = document.createElement('div');
        elemDiv.classList.add('flex');
        elemDiv.innerHTML = `
            <span>Граната:&nbsp;</span>
            <div class="grenadeprogressbar" id="grenadeprogressbar">
                <div class="grenadeprogressbarin" id="grenadeprogressbarin"></div>
            </div>
        `
        elemDivStatistics.appendChild(elemDiv);

        return elemDivStatistics;
    }

    createAllViewInterface(model) {
        const elemMain = document.getElementById('main');

        const elemDivSellAndButton = document.createElement('div');
        elemDivSellAndButton.classList.add('SellAndButton');
        elemDivSellAndButton.appendChild(viewZombie.createCell(model));
        elemDivSellAndButton.appendChild(viewZombie.createButtonInterface(model));

        elemMain.appendChild(elemDivSellAndButton);

        elemMain.appendChild(viewZombie.createStatisticsInterface(model));
    }

    clearAllArea(model) {
        if (document.getElementById(0) !== null) {
            for (let i = 0; i < model.verticalCell * model.horizontalCell; i++) {
                document.getElementById(i).innerHTML = '';
            }
        }
    }

    buttonUnFocus() {
        document.getElementById('start').blur();
        document.getElementById('pause').blur();
        document.getElementById('stop').blur();
    }

    updateStatistics(model) {
        document.getElementById('status').innerHTML = statusGame[model.status];
        document.getElementById('level').innerHTML = model.level;
        document.getElementById('point').innerHTML = model.point;
        document.getElementById('grenadeprogressbarin').style.width = model.grenadeProgress + 'px';
    }

    updatePlayerPosition(model) {
        if (document.getElementById(0) !== null) {
            const playerPosition = model.horizontalCell * model.verticalCell - (model.horizontalCell - model.playerPosition);
            document.getElementById(playerPosition).innerHTML = playerDiv;
        }
    }

    updateZombiePosition(model) {
        if (document.getElementById(0) !== null) {
            if (('' + model.zombiePositionOld) !== ('' + model.zombiePosition)) {
                for (let i = 0; i < (model.verticalCell * model.horizontalCell) - model.horizontalCell; i++) {
                    document.getElementById(i).innerHTML = '';
                }

                for (let i = 0; i < model.zombiePosition.length; i++) {
                    for (let j = 0; j < model.zombiePosition[i].length; j++) {
                        const id = model.zombiePosition.length * model.horizontalCell -
                            (i * model.horizontalCell + (model.horizontalCell - model.zombiePosition[i][j]));
                        document.getElementById(id).innerHTML = zombieDiv;
                    }
                }
            }
        }
    }

    updateGrenadePosition(model) {
        if (document.getElementById(0) !== null) {
            const grenadePosition = model.horizontalCell * model.grenadePosition.y + model.grenadePosition.x;
            document.getElementById(grenadePosition).innerHTML = grenadeDiv;
        }
    }

    setHandlerButton(clbkStart, clbkPause, clbkStop) {
        document.getElementById('start').addEventListener('click', () => {
            this.buttonUnFocus();
            clbkStart();
        });
        document.getElementById('pause').addEventListener('click', () => {
            this.buttonUnFocus();
            clbkPause();
        });
        document.getElementById('stop').addEventListener('click', () => {
            this.buttonUnFocus();
            clbkStop();
        });
    }

    setHandlerKey(clbk) {
        document.addEventListener('keyup', clbk);
    }

    redraw(model) {
        this.clearAllArea(model);
        this.updateStatistics(model);
        this.updateZombiePosition(model);
        this.updateGrenadePosition(model);
        this.updatePlayerPosition(model);
    }
}

const viewZombie = new ViewZombie();

window.addEventListener('load',
    () => {
        viewZombie.createAllViewInterface(model);

        setInterval(() => {
            viewZombie.redraw(model);
        }, 100);
    }
);