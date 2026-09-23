const WIDTH = 4;
const HEIGHT = 4;
const TILE_COUNT = WIDTH * HEIGHT;
const TRANSITION_DURATION = parseFloat(get_css_var("--transition-duration"));
const TILE_SIZE = parseFloat(get_css_var("--tile-size"));
const GAP = parseFloat(get_css_var("--gap"));

assert_css_var_units("--transition-duration", "ms");
assert_css_var_units("--tile-size", "vmin");
assert_css_var_units("--gap", "vmin");

const body = document.getElementById("body");
const board = document.getElementById("board");
const tiles = init_grid();
let move_timeout = null;

reset();

document.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowUp": move(DIRECTION_UP); break;
        case "ArrowDown": move(DIRECTION_DOWN); break;
        case "ArrowLeft": move(DIRECTION_LEFT); break;
        case "ArrowRight": move(DIRECTION_RIGHT); break;
        case "O": body.classList.toggle("dark"); break;
        case "R": case "r": reset(); break;
    }
});

function reset() {
    clearTimeout(move_timeout?.timeout);
    for (let i = 0; i < tiles.length; i++) {
        tiles[i]?.element.remove();
        tiles[i] = null;
    }
    setTimeout(spawn_random_tile, 200);
    setTimeout(spawn_random_tile, 300);
}

const DIRECTION_UP = 0;
const DIRECTION_DOWN = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_RIGHT = 3;

function set_flushable_timeout(func, time, ...args) {
    const timeout = {
        timeout: null,
        func,
        args,
    };
    timeout.timeout = setTimeout(flush_timeout, time, timeout);
    return timeout;
}

function flush_timeout(timeout) {
    if (timeout?.timeout !== undefined && timeout?.timeout !== null) {
        clearTimeout(timeout.timeout);
        timeout.func(...timeout.args);
        timeout.timeout = null;
    }
}

function move(direction) {
    flush_timeout(move_timeout);

    let next;
    let reverse_iteration;
    switch (direction) {
        case DIRECTION_UP:
            next = (index) => index - WIDTH;
            reverse_iteration = false;
            break;
        case DIRECTION_DOWN:
            next = (index) => index + WIDTH;
            reverse_iteration = true;
            break;
        case DIRECTION_LEFT:
            next = (index) => (index % WIDTH == 0) ? null : index - 1;
            reverse_iteration = false;
            break;
        case DIRECTION_RIGHT:
            next = (index) => (index % WIDTH == WIDTH - 1) ? null : index + 1;
            reverse_iteration = true;
            break;
    }

    for (const tile of tiles) if (tile !== null) tile.merged = false;

    const dir = direction;
    let something_moved = false;
    if (reverse_iteration) {
        for (let y = HEIGHT; y-- > 0;) {
            for (let x = WIDTH; x-- > 0;) {
                if (process_tile(x, y, next)) something_moved = true;
            }
        }
    } else {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (process_tile(x, y, next)) something_moved = true;
            }
        }
    }

    if (something_moved) {
        move_timeout = set_flushable_timeout(spawn_random_tile, TRANSITION_DURATION);
    }
}

function process_tile(x, y, next) {
    const src = y * WIDTH + x;
    const tile = tiles[src];
    if (tile === null) return false;
    let dst = src;
    while (true) {
        let i = next(dst);
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
        return true;
    }
    return false;
}

function can_merge(src, dst) {
    return !tiles[src]?.merged && !tiles[dst]?.merged
        && tiles[src]?.value === tiles[dst]?.value;
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
    const bg_grid = document.getElementById("background-grid");
    for (let i = 0; i < TILE_COUNT; i++) {
        tiles.push(null);
        const bg_tile = document.createElement("div");
        bg_tile.classList.add("tile", "background-tile");
        bg_grid.appendChild(bg_tile);
    }
    return tiles;
}

function create_tile(x, y, value) {
    const element = document.createElement("div");
    element.classList.add("tile", "active-tile");
    board.prepend(element);
    const tile = {
        value,
        element: element,
        merged: false,
    }
    set_tile_value(tile, value);
    set_tile_css_position(tile, x, y);
    return tile;
}

function set_tile_css_position(tile, x, y) {
    const SIZE = TILE_SIZE + GAP;
    tile.element.style.translate = `${x * SIZE}vmin ${y * SIZE}vmin`;
}

function set_tile_value(tile, value) {
    const str = value.toString();
    tile.value = value;
    tile.element.textContent = str;
    tile.element.style.fontSize = `${6 * (5 / 6) ** Math.max(str.length - 3, 0)}vmin`;
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

function get_css_var(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function assert_css_var_units(name, units) {
    if (!get_css_var(name).endsWith(units)) {
        console.log(`CSS variable "${name}" is expected to be in "${units}" units`);
    }
}
