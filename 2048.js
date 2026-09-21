const WIDTH = 4;
const HEIGHT = 4;
const TILE_COUNT = WIDTH * HEIGHT;
const TRANSITION_DURATION = parseFloat(
    getComputedStyle(document.documentElement)
        .getPropertyValue("--transition-duration")
        .trim()
);

const board = document.getElementById("board");
const tiles = init_grid();

setTimeout(() => spawn_random_tile(), 500);
setTimeout(() => spawn_random_tile(), 600);

document.addEventListener("keydown", (event) => {
    let direction = null;
    switch (event.key) {
        case "ArrowUp": direction = DIRECTION_UP; break;
        case "ArrowDown": direction = DIRECTION_DOWN; break;
        case "ArrowLeft": direction = DIRECTION_LEFT; break;
        case "ArrowRight": direction = DIRECTION_RIGHT; break;
    }
    if (direction !== null) move(direction);
});

const DIRECTION_UP = {
    next: (index) => index - WIDTH,
    reverse_iteration: false
};
const DIRECTION_DOWN = {
    next: (index) => index + WIDTH,
    reverse_iteration: true
};
const DIRECTION_LEFT = {
    next: (index) => (index % WIDTH == 0) ? null : index - 1,
    reverse_iteration: false
};
const DIRECTION_RIGHT = {
    next: (index) => (index % WIDTH == WIDTH - 1) ? null : index + 1,
    reverse_iteration: true
};

let timeout = null;
function move(direction) {
    if (timeout !== null) {
        clearTimeout(timeout);
        spawn_random_tile();
        timeout = null;
    }
    for (const tile of tiles) if (tile !== null) tile.merged = false;
    const dir = direction;
    let something_moved = false;
    for_each_tile_coord(dir.reverse_iteration, (x, y) => {
        const src = y * WIDTH + x;
        const tile = tiles[src];
        if (tile === null) return;
        let dst = src;
        while (true) {
            let i = dir.next(dst);
            if (i === null || tiles[i] === undefined) break;
            if (tiles[i] !== null) {
                if (can_merge(src, i)) dst = i;
                break;
            }
            dst = i;
        }
        if (src !== dst) {
            if (can_merge(src, dst)) {
                set_tile_value(tile, tile.value * 2);
                tile.merged = true;
            }
            move_tile(src, dst);
            something_moved = true;
        }
    });
    if (something_moved) timeout = setTimeout(() => {
        spawn_random_tile();
        timeout = null
    }, TRANSITION_DURATION);
}

function can_merge(src, dst) {
    return !tiles[src]?.merged && !tiles[dst]?.merged
        && tiles[src]?.value === tiles[dst]?.value;
}

function for_each_tile_coord(reverse_iteration, fn) {
    if (reverse_iteration) {
        for (let y = HEIGHT; y-- > 0;) {
            for (let x = WIDTH; x-- > 0;) {
                fn(x, y);
            }
        }
    } else {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                fn(x, y);
            }
        }
    }
}

function move_tile(src, dst) {
    const tile = tiles[src];
    if (tiles[dst] !== null) {
        setTimeout((tile) => tile.element.remove(), TRANSITION_DURATION, tiles[dst]);
    }
    tiles[dst] = tile;
    tiles[src] = null;
    set_tile_css_position(tile, dst % WIDTH, Math.floor(dst / WIDTH));
}

function init_grid() {
    let tiles = [];
    let empty_tiles = "";
    for (let i = 0; i < TILE_COUNT; i++) {
        tiles.push(null);
        empty_tiles += '<div class="tile background-tile"></div>';
    }
    document.getElementById("background-grid").innerHTML = empty_tiles;
    return tiles;
}

function create_tile(x, y, value) {
    const str = value.toString();
    const element = document.createElement("div");
    element.classList.add("tile", "active-tile");
    board.prepend(element);
    const tile = {
        value: value,
        element: element,
        merged: false,
    }
    set_tile_value(tile, value);
    set_tile_css_position(tile, x, y);
    return tile;
}

function set_tile_css_position(tile, x, y) {
    tile.element.style.translate = (x * 18) + "vmin " + (y * 18) + "vmin";
}

function set_tile_value(tile, value) {
    const str = value.toString();
    tile.value = value;
    tile.element.innerText = str;
    tile.element.style.fontSize = 6 * (5 / 6) ** Math.max(str.length - 3, 0) + "vmin";
}

function random_int(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}

function spawn_random_tile() {
    const empty_tiles = [];
    for (let i = 0; i < TILE_COUNT; i++) {
        if (tiles[i] === null) empty_tiles.push(i);
    }
    if (empty_tiles.length == 0) return;
    const index = empty_tiles[random_int(0, empty_tiles.length)];
    const x = index % WIDTH;
    const y = Math.floor(index / WIDTH);
    const value = Math.random() < 0.1 ? 4 : 2;
    tiles[index] = create_tile(x, y, value);
}
