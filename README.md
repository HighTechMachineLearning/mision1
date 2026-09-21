# mision1

El famoso juego 2048. Implementado sin usar canvas, solo con manipulacion del DOM.

---

# Uso de IA
He pensado y escrito todo el codigo yo. Solo he usado IA como fuente de informacion, con prompts como
- *"How to addEventListener for keyboard arrow keys & wasd?"*
- *"How do closures capture local variables?"*
- *"How to use grid in css?"*

etc.

---

# Autopsia

### 1. Fichas como elementos DOM independientes

**Qué hice:** cada ficha es un `div` que persiste y se desliza con `translate` y una transición CSS. El array `tiles` guarda el estado del juego y el DOM lo refleja.

**Por qué es discutible:** el estado vive en dos sitios (el array y el DOM) y hay que mantenerlos sincronizados a mano. Por ejemplo, la ficha absorbida en una fusión se elimina con un `setTimeout` aparte.

**Alternativa descartada:** dibujar el tablero en un `<canvas>`, que sería lo más sencillo. La descarté porque la práctica es sobre manipulación el DOM.

### 2. La ficha nueva aparece tras la animación, pero se fuerza si hay otro movimiento

**Qué hice:** después de un movimiento, la ficha nueva se genera cuando termina la animación (`setTimeout`). Si el usuario pulsa otra tecla antes, se cancela el temporizador y la ficha se genera en ese momento, antes de procesar el nuevo movimiento.

**Por qué es discutible:** hay una variable global mutable (`timeout`) y lógica de tiempos mezclada con la lógica del juego.

**Alternativas descartadas:**
- *Generar la ficha al instante dentro de `move`:* la ficha aparecería mientras las demás aún se deslizan.
- *Bloquear el input hasta que acabe la animación:* mala UX.
- *Dejar que se acumulen los temporizadores:* tras varios movimientos rápidos aparecerían varias fichas de golpe, lo que resulta confuso. Además, el nuevo movimiento necesita que la ficha anterior ya exista para ser correcto.
- *Hacer un buffer de inputs:* demasiado complejo.
