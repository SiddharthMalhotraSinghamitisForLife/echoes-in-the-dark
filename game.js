const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const startCampaignBtn = document.getElementById('startCampaignBtn');
const startEndlessBtn = document.getElementById('startEndlessBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const endlessUnlockBtn = document.getElementById('endlessUnlockBtn');
const homeBtn = document.getElementById('homeBtn');
const levelTitle = document.getElementById('levelTitle');

const button = document.getElementById('beepBtn');
const message = document.getElementById('message');
const healthBar = document.getElementById('healthBar');
const armourBar = document.getElementById('armourBar');
const statsText = document.getElementById('statsText');

const shopPanel = document.getElementById('shopPanel');
const buyMedkitBtn = document.getElementById('buyMedkitBtn');
const buyArmourBtn = document.getElementById('buyArmourBtn');
const buyTntBtn = document.getElementById('buyTntBtn');
const buyLuckBtn = document.getElementById('buyLuckBtn');

let audio;
let gameOver = false;
let levelWon = false;
let tntArmed = false;
let isEndless = false;
let savedLevel = 1;
let currentLevel = 1;
let endlessSize = 11;
let maze = [];

let player = {
    x: 1,
    y: 3,
    health: 100,
    armour: 0,
    wallDamage: 10,
    luck: 10,
    coins: 0
};

let inventory = {
    armourPlates: 0,
    tnt: 0,
    medkits: 0
};

function saveProgress() {
    localStorage.setItem("echoSaveData", JSON.stringify({
        level: savedLevel,
        coins: player.coins,
        luck: player.luck,
        armour: player.armour,
        armourPlates: inventory.armourPlates,
        tnt: inventory.tnt,
        medkits: inventory.medkits
    }));
}

function loadProgress() {
    const saved = JSON.parse(localStorage.getItem("echoSaveData"));
    if (saved) {
        savedLevel = saved.level || 1;
        currentLevel = savedLevel;
        player.coins = saved.coins || 0;
        player.luck = saved.luck || 10;
        player.armour = saved.armour || 0;
        inventory.armourPlates = saved.armourPlates || 0;
        inventory.tnt = saved.tnt || 0;
        inventory.medkits = saved.medkits || 0;
    }
}

loadProgress();


resetProgressBtn.addEventListener("click", function() {

    const confirmed = confirm(
        "Are you sure you want to reset ALL progress?\n\n" +
        "This will delete:\n" +
        "- All completed levels\n" +
        "- All coins\n" +
        "- All upgrades\n" +
        "- All armour\n" +
        "- All medkits\n" +
        "- All TNT\n\n" +
        "This action cannot be undone!"
    );

    if (!confirmed) return;

    localStorage.removeItem("echoSaveData");

    savedLevel = 1;
    currentLevel = 1;
    isEndless = false;
    endlessSize = 11;

    player.x = 1;
    player.y = 3;
    player.health = 100;
    player.armour = 0;
    player.wallDamage = 10;
    player.luck = 10;
    player.coins = 0;

    inventory.armourPlates = 0;
    inventory.tnt = 0;
    inventory.medkits = 0;

    gameOver = false;
    levelWon = false;
    tntArmed = false;
    maze = [];

    shopPanel.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    endlessUnlockBtn.classList.add('hidden');

    updateStatsUI();

    message.innerText =
        "All progress reset! Start a new campaign.";

    playBeep(440);

});


const fixedLevels = [
    {
        name: "Level 1: First Echo ",
        chest: "Wooden",
        start: {x: 1, y: 3},
        grid: [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 2, 1],
            [1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 2: False Turns ",
        chest: "Wooden",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 1],
            [1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 2, 1],
            [1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 3: Watch Your Step ",
        chest: "Wooden",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 3, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 3, 0, 1],
            [1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 2, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 4: Trapped Corridors ",
        chest: "Iron",
        start: {x: 1, y: 5},
        grid: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 3, 0, 1, 2, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1],
            [1, 3, 1, 1, 1, 3, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 5: Something Breathing ",
        chest: "Iron",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 4, 0, 1],
            [1, 0, 0, 0, 1, 0, 1, 1],
            [1, 1, 1, 0, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 6: Hunted and Trapped ",
        chest: "Iron",
        start: {x: 1, y: 6},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 3, 0, 0, 2, 1],
            [1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 4, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 3, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 7: Twin Stalkers ",
        chest: "Iron",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 4, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 4, 0, 1],
            [1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 8: The Deep Vault ",
        chest: "Golden",
        start: {x: 1, y: 7},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 3, 0, 0, 0, 1, 2, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 4, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 3, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 4, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 3, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 9: Nest of Echoes ",
        chest: "Golden",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 3, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 4, 0, 0, 0, 1, 3, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 4, 0, 0, 0, 1],
            [1, 0, 1, 3, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 4, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    {
        name: "Level 10: Abyssal Core ",
        chest: "Golden",
        start: {x: 1, y: 1},
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 3, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 4, 0, 0, 0, 4, 1, 0, 1],
            [1, 0, 1, 1, 1, 3, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 3, 1],
            [1, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1],
            [1, 0, 1, 3, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 4, 1, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    }
];

function generateRandomMaze(size) {
    let grid = Array.from({length: size}, () => Array(size).fill(1));

    function carve(x, y) {
        grid[y][x] = 0;
        const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of dirs) {
            let nx = x + dx;
            let ny = y + dy;
            if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && grid[ny][nx] === 1) {
                grid[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    grid[size - 2][size - 2] = 2;

    let openTiles = [];
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (grid[y][x] === 0 && (x > 2 || y > 2)) openTiles.push({x, y});
        }
    }
    openTiles.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.floor(size / 2) && openTiles.length > 0; i++) {
        let t = openTiles.pop();
        grid[t.y][t.x] = 3;
    }
    for (let i = 0; i < Math.floor(size / 3) && openTiles.length > 0; i++) {
        let m = openTiles.pop();
        grid[m.y][m.x] = 4;
    }
    return grid;
}

function updateStatsUI() {
    statsText.innerText = 
        "Coins: " + player.coins + 
        " | Armour Plates: " + inventory.armourPlates + 
        " | TNT: " + inventory.tnt + 
        " | Medkits: " + inventory.medkits +
        " | Luck: " + player.luck;
    healthBar.style.width = player.health + "%";
    armourBar.style.width = player.armour + "%";
    saveProgress();
}

function initAudio() {
    if (!audio) audio = new AudioContext();
    audio.resume();
}

function playBeep(pitch, pan = 0, type = 'sine', duration = 0.15) {
    if (!audio) return;
    audio.resume();

    const beep = audio.createOscillator();
    const panner = audio.createStereoPanner();
    beep.type = type;
    beep.frequency.value = pitch;
    panner.pan.value = Math.max(-1, Math.min(1, pan));

    beep.connect(panner);
    panner.connect(audio.destination);
    beep.start();
    beep.stop(audio.currentTime + duration);
}

function resetPlayerForNewRun() {
    player.health = 100;
    endlessSize = 11;
}

function loadLevel(lvlNum) {
    gameOver = false;
    levelWon = false;
    tntArmed = false;
    shopPanel.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    endlessUnlockBtn.classList.add('hidden');

    if (!isEndless && lvlNum <= fixedLevels.length) {
        const data = fixedLevels[lvlNum - 1];
        levelTitle.innerText = data.name;
        maze = data.grid.map(row => [...row]);
        player.x = data.start.x;
        player.y = data.start.y;
        message.innerText = data.name + "started! WASD to scan, Arrows to walk.";
    }
    else {
        isEndless = true;
        levelTitle.innerText = "Endless Floor " + lvlNum + " (" + endlessSize + "x" + endlessSize + ")";
        maze = generateRandomMaze(endlessSize);
        player.x = 1;
        player.y = 1;
        message.innerText = "Random labyrinth generated! Scan carefully.";
    }
    updateStatsUI();
}

startCampaignBtn.addEventListener("click", function() {
    initAudio();
    startCampaignBtn.blur();
    isEndless = false;
    currentLevel = savedLevel;
    resetPlayerForNewRun();
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    loadLevel(currentLevel);
    playBeep(440);
});

startEndlessBtn.addEventListener("click", function() {
    initAudio();
    startEndlessBtn.blur();
    isEndless = true;
    currentLevel = 1;
    resetPlayerForNewRun();
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    loadLevel(currentLevel);
    playBeep(520);
});

nextLevelBtn.addEventListener("click", function() {
    nextLevelBtn.blur();
    currentLevel += 1;
    if (isEndless) {
        endlessSize +=2;
    }
    else {
        savedLevel = currentLevel;
        saveProgress();
    }
    loadLevel(currentLevel);
    playBeep(550);
});

endlessUnlockBtn.addEventListener("click", function() {
    endlessUnlockBtn.blur();
    isEndless = true;
    currentLevel = 1;
    loadLevel(currentLevel);
    playBeep(600);
});

homeBtn.addEventListener("click", function() {
    homeBtn.blur();
    gameScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

button.addEventListener("click", function() {
    initAudio();
    button.blur();
    updateStatsUI();
    message.innerText = ("Audio ready! WASD to scan, Arrows to walk.");
    playBeep(440);
});

buyMedkitBtn.addEventListener("click", function() {
    buyMedkitBtn.blur();
    if (player.coins >= 25) {
        player.coins -= 25;
        inventory.medkits += 1;
        updateStatsUI();
        playBeep(660);
        message.innerText = "Purchased +1 Medkit!";
    }
    else {
        let coinsNeeded = 25 - player.coins;
        message.innerText = "Not enough coins (" + coinsNeeded + " more needed)";
    }
});

buyArmourBtn.addEventListener("click", function() {
    buyArmourBtn.blur();
    if (player.coins >= 50) {
        player.coins -= 50;
        inventory.armourPlates += 1;
        updateStatsUI();
        playBeep(520);
        message.innerText = "Purchased +1 Armour Plate!";
    }
    else {
        let coinsNeeded = 50 - player.coins;
        message.innerText = "Not enough coins (" + coinsNeeded + " more needed)";
    }
});

buyTntBtn.addEventListener("click", function() {
    buyTntBtn.blur();
    if (player.coins >= 100) {
        player.coins -= 100;
        inventory.tnt += 1;
        updateStatsUI();
        playBeep(400);
        message.innerText = "Purchased +1 TNT!";
    }
    else {
        let coinsNeeded = 100 - player.coins;
        message.innerText = "Not enough coins (" + coinsNeeded + " more needed)";
    }
});

buyLuckBtn.addEventListener("click", function() {
    buyLuckBtn.blur();
    if (player.coins >= 200) {
        player.coins -= 200;
        player.luck += 5;
        updateStatsUI();
        playBeep(780);
        message.innerText = "Luck upgraded by +5%!";
    }
    else {
        let coinsNeeded = 200 - player.coins;
        message.innerText = "Not enough coins (" + coinsNeeded + " more needed)";
    }
});

function getMonsterProximity() {
    let nearestDistance = Infinity;

    for (let y = 0; y < maze.length; y++) {
        for (let x =0; x < maze[y].length; x++) {
            if (maze[y][x] === 4) {
                const distance = getPathDistance(x, y, player.x, player.y);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                }
            }
        }
    }

    if (!Number.isFinite(nearestDistance)) {
        return "";
    }

    if (nearestDistance <= 4) {
        return "DANGER: Monster " + nearestDistance + " walkable step(s) away!";
    }

    return "Monster " + nearestDistance + " walkable step(s) away.";
}

function getSpikeDirection(dx, dy) {
    let scanX = player.x;
    let scanY = player.y;
    let distance = 0;

    while (true) {
        scanX += dx;
        scanY +=dy;
        distance++;

        if (!maze[scanY] || maze[scanY][scanX] === undefined) {
            return "";
        }

const tile = maze[scanY][scanX];

        if (tile === 1) {
            return "";
        }

        if (tile === 3) {
            return "SPIKE TRAP " + distance + " step(s) away!";
        }
    }
}

function scanDirection(dx, dy) {
    let scanX = player.x;
    let scanY = player.y;
    let distance = 0;
    let wallDistance = null;
    let exitDistance = null;

    while (true) {
        scanX += dx;
        scanY += dy;
        distance ++;

        if (!maze[scanY] || maze[scanY][scanX] === undefined) {
            break;
        }

        const tile = maze[scanY][scanX];

        if (tile === 1) {
            wallDistance = distance;
            break;
        }

        if (tile === 2) {
            exitDistance = distance;
            break;
        }
    }

    let results = [];

    if (exitDistance!==null) {
        results.push("EXIT " + exitDistance + " step(s) away!");
        playBeep(950, dx, 'sine', 0.25);
    }   

    else if (wallDistance !== null) {
        results.push("Wall " + wallDistance + " step(s) away!");
        playBeep(150 + wallDistance * 90, dx);
    }

    const spikeInfo = getSpikeDirection(dx, dy);

    if (spikeInfo !== "") {
        results.push(spikeInfo);
        playBeep(750, dx, 'triangle', 0.08);
        setTimeout(() => playBeep(750, dx, 'triangle', 0.08), 100);
    }

    const monsterInfo = getMonsterProximity();

    if (monsterInfo !=="") {
        results.push(monsterInfo);
    }
    message.textContent = "Sonar: " + results.join(" | ");
}

function useTNT(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

if (inventory.tnt > 0) {
    tntArmed = true;
    if (targetY <= 0 || targetY >= maze.length - 1 || targetX <= 0 || targetX >= maze[0].length - 1) {
        message.innerText = "Cannot blow up outer border walls!";
        tntArmed = false;
        return;
    }

    inventory.tnt -= 1;
    playBeep(80, dx, 'sawtooth', 0.25);

    if (maze[targetY][targetX] === 1) {
        maze[targetY][targetX] = 0;
        message.innerText = "BOOM! Wall destroyed.";
    }
    else if (maze[targetY][targetX] === 4) {
        maze[targetY][targetX] = 0;
        message.innerText = "BOOM! Monster obliterated.";
    }
    else if (maze[targetY][targetX] === 3) {
        maze[targetY][targetX] = 0;
        message.innerText = "BOOM! Spike trap destroyed.";
    }
    else {
        message.innerText = "Nothing there! TNT wasted.";
    }

    updateStatsUI();
    tntArmed = false;
}
else {
    message.innerText = "Cannot use TNT right now!";
}
}

function useMedkit() {
    if (inventory.medkits > 0 && player.health < 100) {
        inventory.medkits -= 1;
        player.health = Math.min(100, player.health + 30);
        healthBar.style.width = player.health + "%";
        playBeep(660);
        message.innerText = "Medkit used! Health: " + player.health + "%";
        updateStatsUI();
    }
    else {
        message.innerText = "Cannot use Medkit right now!";
    }
}

function useArmourPlate() {
    if (inventory.armourPlates > 0 && player.armour < 100) {
        inventory.armourPlates -= 1;
        player.armour = Math.min(100, player.armour + 20);
        playBeep(520);
        message.innerText = "Armour Plate equipped! Armour: " + player.armour + "%";
        updateStatsUI();
    }
    else {
        message.innerText = "Cannot equip Armour Plate right now!"
    }
}

function takeDamage(amount, reasonText) {
    if (Math.random() * 100 < player.luck) {
        playBeep(600);
        message.innerText = "LUCKY DODGE! 0 damage taken.";
        return false;
    }
    else if (player.armour > 0) {
        player.armour = Math.max(0, player.armour - amount)
        playBeep(160);
        message.innerText = reasonText + " Armour absorbed hit! Armour: " + player.armour + "%";
    }
    else {
        player.health = Math.max(0, player.health - amount);
        playBeep(110);
        if (player.health <= 0) {
            gameOver = true;
            message.innerText = "GAME OVER! " + reasonText + " Click Homepage to retry.";
            playBeep(65, 0, 'sawtooth', 0.4);
        }
        else {
            message.innerText = reasonText + " Health: " + player.health + "%";
        }
    }
    updateStatsUI();
    return true;
}

function getPathDistance(startX, startY, targetX, targetY) {
    let queue = [{x: startX, y: startY, distance:0}];
    let visited = new Set ([startX + "," + startY]);

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === targetX && current.y === targetY) {
            return current.distance;
        }

        for (const [dx, dy] of dirs) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const key = nx + "," + ny;

            if (maze[ny] && maze [ny][nx] !== undefined && !visited.has(key) && (
                    maze[ny][nx] === 0 || maze[ny][nx] === 3 || maze[ny][nx] === 4 || maze[ny][nx] === 2 || (
                      nx === targetX && ny === targetY  
                    )
                )
            ) {
                visited.add(key);
                queue.push({
                    x: nx,
                    y: ny,
                    distance: current.distance + 1
                });
            }
        }
    }
    return Infinity;
}

function getNextMonsterStep(startX, startY, targetX, targetY) {
    let queue = [{x: startX, y: startY, firstMove: null}];
    let visited = new Set([startX + "," + startY]);
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.x === targetX && curr.y === targetY) return curr.firstMove;

        for (let [dx, dy] of dirs) {
            let nx = curr.x + dx;
            let ny = curr.y + dy;
            let key = nx + "," + ny;
            if (!visited.has(key) && maze[ny] && (maze[ny][nx] === 0 || maze[ny][nx] === 3 || (nx === targetX && ny === targetY))) {
                visited.add(key);
                queue.push({x: nx, y: ny, firstMove: curr.firstMove || [dx, dy]});
            }
        }
    }
    return null;
}

function teleportMonster(x, y, reservedPositions = new Set()) {
    let possibleSpawns = [];
    let farthestDistance = -1;

    for (let row = 1; row < maze.length - 1; row++) {
        for (let col = 1; col < maze[row].length - 1; col++) {
            if (maze[row][col] !==0) continue;

            const key = col + "," + row;

            if (reservedPositions.has(key)) continue;

            const distance = getTeleportDistance(col, row, player.x, player.y);

            if (!Number.isFinite(distance)) continue;

            if (distance > farthestDistance) {
                farthestDistance = distance;
                possibleSpawns = [{x: col, y: row}];
            }
            else if (distance === farthestDistance) {
                possibleSpawns.push({x: col, y: row});
            }
        }
    }

    if (possibleSpawns.length === 0) return false;

    const spawn = possibleSpawns[Math.floor(Math.random() * possibleSpawns.length)];

    maze[y][x] = 0;
    maze[spawn.y][spawn.x] = 4;
    reservedPositions.add(spawn.x + "," + spawn.y);

    return true;
}


function getTeleportDistance(startX, startY, targetX, targetY) {
    let queue = [{x: startX, y: startY, distance: 0}];
    let visited = new Set([startX + "," + startY]);

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === targetX && current.y === targetY) {
            return current.distance;
        }

        for (const [dx, dy] of dirs) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const key = nx + "," + ny;

            if (
                maze[ny] &&
                !visited.has(key) &&
                maze[ny][nx] !== undefined &&
                maze[ny][nx] !== 1
            ) {
                visited.add(key);
                queue.push({
                    x: nx,
                    y: ny,
                    distance: current.distance + 1
                });
            }
        }
    }

    return Infinity;
}


function moveMonsters() {
    let monsters = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 4) monsters.push({x, y});
        }
    }

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    const reservedPositions = new Set (monsters.map(m => m.x + "," + m.y));

    for (let m of monsters) {
        
        if (maze[m.y][m.x] !==4) continue;
        
        const dist = getPathDistance(m.x, m.y, player.x, player.y);
        let move = dist <= 4 ? getNextMonsterStep(m.x, m.y, player.x, player.y) : null;
        if (!move) move = dirs[Math.floor(Math.random() * dirs.length)];

        const nx = m.x + move[0];
        const ny = m.y + move[1];

        if (nx === player.x && ny === player.y) {
            playBeep(260, 0, 'sawtooth', 0.25);
            const hit = takeDamage(25, "A hunting monster ambushed you!");

            if (hit) {
                teleportMonster(m.x, m.y, reservedPositions);
            }
            if (gameOver) return;
            continue;
        }
        if (!maze[ny] || maze[ny][nx] === undefined) {
            continue;
        }
        const destinationKey = nx + "," + ny;

        if (reservedPositions.has(destinationKey)) {
            continue;
        }

        if (maze[ny][nx] === 0 || maze[ny][nx] === 3) {

            maze[m.y][m.x] = 0;
            maze[ny][nx] = 4;

            reservedPositions.add(destinationKey);

            if (dist <=4) playBeep(260, Math.sign(nx - player.x), 'sawtooth', 0.12);
        }
    }
}

function openTieredChest() {
    const tier = isEndless ? "Golden" : fixedLevels[currentLevel - 1].chest;
    const roll = Math.random() * 100;
    const isLucky = roll < 20 + player.luck;

    if (tier === "Wooden") {
        player.coins += 10;
        inventory.medkits += isLucky ? 2 : 1;
        return isLucky 
        ? "LUCKY WOODEN CHEST: +10 Coins & +2 Medkits!"
        : "WOODEN CHEST: +10 Coins & +1 Medkit!";
    }
    else if (tier === "Iron") {
        player.coins += 20;
        inventory.medkits += 1;
        inventory.armourPlates += isLucky ? 2 : 1;
        return isLucky
        ? "LUCKY IRON CHEST: +20 Coins, +1 Medkit & +2 Armour Plates!"
        : "IRON CHEST: +20 Coins, +1 Medkit & +1 Armour Plate!";
    }
    else {
        player.coins += 45;
        inventory.medkits += 1;
        inventory.armourPlates += 1;
        inventory.tnt += isLucky ? 2 : 1;
        return isLucky
        ? "LUCKY GOLDEN CHEST: +45 Coins, +1 Medkit, +1 Armour Plate & +2 TNT!"
        : "GOLDEN CHEST: +45 Coins, +1 Medkit, +1 Armour Plate and +1 TNT!";
    }
}

window.addEventListener("keydown", function(event) {
    if (!homeScreen.classList.contains('hidden') || gameOver || levelWon) return;

    const key = event.key.toLowerCase();

    if (key === "t") {
        tntArmed = inventory.tnt > 0 ? !tntArmed : false;
        message.innerText = inventory.tnt > 0 ? (tntArmed ? "TNT ARMED! Press WASD to blast." : "TNT disarmed.") : "No TNT left!";
        return;
    }

    if (key === "h") {useMedkit(); return;}
    if (key === "e") {useArmourPlate(); return;}

    if (key === "w") {tntArmed ? useTNT(0, -1) : scanDirection(0, -1); return;}
    if (key === "s") {tntArmed ? useTNT(0, 1) : scanDirection(0, 1); return;}
    if (key === "a") {tntArmed ? useTNT(-1, 0) : scanDirection(-1, 0); return;}
    if (key === "d") {tntArmed ? useTNT(1, 0) : scanDirection(1, 0); return;}

    let nextX = player.x;
    let nextY = player.y;

    if (event.key === "ArrowUp") nextY -= 1;
    else if (event.key === "ArrowDown") nextY += 1;
    else if (event.key === "ArrowLeft") nextX -= 1;
    else if (event.key === "ArrowRight") nextX += 1;
    else return;

    const tile = maze[nextY][nextX];

    if (tile === 1) {takeDamage(player.wallDamage, "Ouch! Hit a wall.");}
    else if (tile === 3) {
        player.x = nextX; player.y = nextY; maze[nextY][nextX] = 0;
        takeDamage(15, "SNAP! Stepped on a spike trap!");
        if (!gameOver) moveMonsters();

        if (!gameOver) {
            const monsterInfo = getMonsterProximity();

            if(monsterInfo !== "") {
            message.textContent += " | " + getMonsterProximity();
            }
        }
    }
    else if (tile === 4) {
        const hit = takeDamage(25, "You walked straight into a monster!");

        if (hit) {
            teleportMonster(nextX, nextY);
        }
    }
    else if (tile === 2) {
        levelWon = true; player.x = nextX; player.y = nextY;
        playBeep(880);
        const reward = openTieredChest();
        updateStatsUI();
        shopPanel.classList.remove('hidden');

        if (!isEndless && currentLevel === fixedLevels.length) {
            savedLevel = 1;
            saveProgress();
            message.innerText = "CAMPAIGN COMPLETE! " + reward + " Endless Mode unlocked!";
            endlessUnlockBtn.classList.remove('hidden');
        }
        else {
            if (!isEndless) {
                savedLevel = currentLevel + 1;
                saveProgress();
            }
            message.innerText = "ESCAPED! " + reward;
            nextLevelBtn.classList.remove('hidden');
        }
    }
    else {
        player.x = nextX; player.y = nextY;
        message.innerText = "Step taken. Use WASD to scan!";
        playBeep(300);
        moveMonsters();
    }
});
