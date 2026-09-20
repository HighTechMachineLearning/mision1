let empty_tiles = "";
for (let i = 0; i < 16; i++) {
    empty_tiles += '<div class="tile background-tile"></div>';
}
document.getElementById("background-grid").innerHTML = empty_tiles;

const tiles = [];

for (let y = -1; y < 5; y++) {
    for (let x = -1; x < 5; x++) {
        let i = (x + y * 4);
        setTimeout(() => tiles.push(spawn_tile_at(x, y, 2 ** (i + 1))), 1000 + 100 * i);
    }
}

function spawn_tile_at(x, y, value) {
    const str = value.toString();
    const element = document.createElement("div");
    element.classList.add("tile", "active-tile");
    element.innerText = str;
    element.style.fontSize = 6 * (5 / 6) ** Math.max(str.length - 3, 0) + "vmin";
    element.style.backgroundColor = select_background_color(value);
    document.getElementById("board").prepend(element);
    const tile = {
        x: x,
        y: y,
        value: value,
        element: element,
    }
    move_tile_to(tile, x, y);
    return tile;
}

function select_background_color(value) {
    switch (value) {
        case 2: return "aliceblue";
        case 4: return "white";
        case 8: return "white";
        case 16: return "white";
        case 32: return "white";
        case 64: return "white";
        case 128: return "white";
        case 256: return "white";
        case 512: return "white";
        case 1024: return "white";
        case 2048: return "gold";
        case 4096: return "gold";
        case 8192: return "gold";
        case 16384: return "gold";
        case 32768: return "gold";
        case 65536: return "gold";
        case 131072: return "gold";
        default: return "pink";
    }
}

function move_tile_to(tile, x, y) {
    tile.x = x;
    tile.y = y;
    tile.element.style.translate = (x * 18) + "vmin " + (y * 18) + "vmin";
}

document.addEventListener("click", () => {
    for (const tile of tiles) {
        move_tile_to(tile, random_int(0, 4), random_int(0, 4));
    }
});

function random_int(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
