const statusGame = ['Новая игра', 'В процессе игры', 'Пауза', 'Поражение', 'Победа'];
const playerDiv = '<div class="player"><div>';
const zombieDiv = '<div class="zombie"><div>';
const grenadeDiv = '<div class="grenade"><div>';

class View {
    createCell(controller) {
        const elemDivTable = document.createElement('div');
        elemDivTable.classList.add('flex');
        elemDivTable.id = 'divTable';

        const elemTable = document.createElement('table');

        let posId = 0;

        for (let i = 0; i < controller.model.verticalCell; i += 1) {
            const elemTr = document.createElement('tr');

            for (let j = 0; j < controller.model.horizontalCell; j += 1) {
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

    createStatisticsInterface(controller) {
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

        let fireKeyStr = 'Пробел';
        let grenadeKeyStr = 'G'; 

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
            fireKeyStr = '&uArr;';
            grenadeKeyStr = '&dArr;';               
        } 

        elemDivStatistics.appendChild(createStr('Игрок влево:', '', '&lArr;'));
        elemDivStatistics.appendChild(createStr('Игрок вправо:', '', '&rArr;'));
        elemDivStatistics.appendChild(createStr('Стрелять:', '', fireKeyStr));
        elemDivStatistics.appendChild(createStr('Граната:', '', grenadeKeyStr));

        elemDivStatistics.appendChild(createStr('', '', ''));

        elemDivStatistics.appendChild(createStr('Статус:', 'status', statusGame[controller.model.status]));
        elemDivStatistics.appendChild(createStr('Уровень:', 'level', controller.model.level));
        elemDivStatistics.appendChild(createStr('Набрано очков:', 'point', controller.model.point));

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

    createAllViewInterface(controller) {
        const elemMain = document.getElementById('main');

        const elemDivSellAndButton = document.createElement('div');
        elemDivSellAndButton.classList.add('SellAndButton');
        elemDivSellAndButton.appendChild(this.createCell(controller));
        elemDivSellAndButton.appendChild(this.createButtonInterface(controller));

        elemMain.appendChild(elemDivSellAndButton);

        elemMain.appendChild(this.createStatisticsInterface(controller));
    }

    clearAllArea(controller) {
        if (document.getElementById(0) !== null) {
            for (let i = 0; i < controller.model.verticalCell * controller.model.horizontalCell; i++) {
                document.getElementById(i).innerHTML = '';
            }
        }
    }

    buttonUnFocus() {
        document.getElementById('start').blur();
        document.getElementById('pause').blur();
        document.getElementById('stop').blur();
    }

    updateStatistics(controller) {
        document.getElementById('status').innerHTML = statusGame[controller.model.status];
        document.getElementById('level').innerHTML = controller.model.level;
        document.getElementById('point').innerHTML = controller.model.point;
        document.getElementById('grenadeprogressbarin').style.width = controller.model.grenadeProgress + 'px';
    }

    updatePlayerPosition(controller) {
        if (document.getElementById(0) !== null) {
            const playerPosition = controller.model.horizontalCell * controller.model.verticalCell -
                (controller.model.horizontalCell - controller.model.playerPosition);
            document.getElementById(playerPosition).innerHTML = playerDiv;
        }
    }

    updateZombiePosition(controller) {
        if (document.getElementById(0) !== null) {
            if (('' + controller.model.zombiePositionOld) !== ('' + controller.model.zombiePosition)) {
                for (let i = 0; i < (controller.model.verticalCell * controller.model.horizontalCell) - controller.model.horizontalCell; i++) {
                    document.getElementById(i).innerHTML = '';
                }

                for (let i = 0; i < controller.model.zombiePosition.length; i++) {
                    for (let j = 0; j < controller.model.zombiePosition[i].length; j++) {
                        const id = controller.model.zombiePosition.length * controller.model.horizontalCell -
                            (i * controller.model.horizontalCell + (controller.model.horizontalCell - controller.model.zombiePosition[i][j]));
                        document.getElementById(id).innerHTML = zombieDiv;
                    }
                }
            }
        }
    }

    updateGrenadePosition(controller) {
        if (document.getElementById(0) !== null) {
            const grenadePosition = controller.model.horizontalCell * controller.model.grenadePosition.y + controller.model.grenadePosition.x;
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

    setHandlerTouch(clbk) {
        document.addEventListener('touchstart', clbk);
        document.addEventListener('touchend', clbk);  
    }

    redraw() {
        this.view.clearAllArea(this);
        this.view.updateStatistics(this);
        this.view.updateZombiePosition(this);
        this.view.updateGrenadePosition(this);
        this.view.updatePlayerPosition(this);
    }
}