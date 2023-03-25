# Ethernaut Solutions

[Read in English](README.md)

Este proyecto contiene las soluciones y explicaciones para todos los niveles actuales del wargame de OpenZeppelin, Ethernaut.

## How to use this repo

Sigue estos pasos para usar este repo:

### 1. Instalar dependencias

Primer, instalar las ependencias necesarias:

```shell
npm install
```

### 2. Ejecutar el nivel deseado

Selecciona el nivel que deseas ejecutar y utiliza el siguiente comando, reemplazando `[levelName].ts` con el nombre del nivel:

```shell
npx hardhat test ./test/[levelName].ts
```

# Niveles

- [Fallback](#nivel-1-fallback)
- [Fallout](#nivel-2-fallout)
- [Coin Flip](#nivel-3-coin-flip)
- [Telephone](#nivel-4-telephone)

## Nivel 1: Fallback

### Qué buscar:

- Funciones como `receive` y `fallback` que puedan alterar el control de acceso

### Resolución:

[Ver código](./test/Fallback.ts)

Observamos que el contrato tiene una función fallback (receive) que nos permite convertirnos en el owner:

```solidity
require(msg.value > 0 && contributions[msg.sender] > 0);
owner = msg.sender;
```

Esta función se ejecuta cuando el contrato recibe ether sin call data.
Lo primero que debemos hacer es ejecutar la función `contribute` para poder enviar algo de ether sin que la transacción sea revertida.
Luego, enviar ether sin call data para disparar la función `receive` y convertirnos en owner del contrato.
Y, por último, ejecutar la función `withdraw` para retirar el balance del contrato y dejarlo en 0.

## Nivel 2: Fallout

### Qué buscar:

- Errores de ortografía.

### Resolución:

[Ver código](./test/Fallout.ts)

En versiones anteriores de Solidity, para especificar la función que se ejecuta al momento de desplegar un contrato, se utilizaba una con el mismo nombre que el del contrato y funcionaba como constructor.
En este caso, si intentamos ver el valor de alguna de las dos variables, vemos rapidamente que estan vacias:

```solidity
    owner = msg.sender;
    allocations[owner] = msg.value;
```

Esto se debe a que la funcion constructora tiene un error de ortografia y su nombre no coincide con el contrato `Fallout` vs `Fal1out`.

Basta con ejecutar `Fal1out` para convertirnos en el owner del contrato y asi completar el nivel.

## Level 3: Coin Flip

### Qué buscar:

- Lógica pública que nos muestre cómo funciona el contrato y que tenga un return que nos permita manipularlo (en este caso, la función principal devuelve un bool que nos permite revertir la transacción si no nos gusta el resultado).

### Resolución:

[Ver código](./test/CoinFlip.ts)

Nota: Después de desarrollar esta solución, encontré otras que consisten en copiar la lógica para predecir el resultado. Esta última es más eficiente, ya que requiere menos transacciones. A continuación, se encuentra la primera solución que se me ocurrió, aunque es menos eficiente.

En este caso, al ver que la función `flip` devuelve un booleano con el resultado (`true` si acertamos, `false` si no), podemos simplemente crear un contrato atacante que llame a la función en cuestión y que revierta en caso de que nos equivoquemos al adivinar el resultado. Con esto, garantizamos que solo se confirmen transacciones en las que acertamos. Luego de varios intentos, obtenemos 10 victorias consecutivas.

## Level 4: Telephone

### Qué buscar:

- tx.origin: siempre hace referencia a la EOA (external owned account) que originó la transacción.

### Resolución:

[Ver código](./test/Telephone.ts)

Vemos que la única función disponible es `changeOwner` y que tiene la siguiente condición:

```solidity
    if (tx.origin != msg.sender) {
      owner = _owner;
    }
```

Para sortear esto, basta con crear un contrato que actúe como intermediario en la llamada de `changeOwner`.De esta manera, nuestro `tx.origin` será la EOA y el `msg.sender` será el contrato intermediario. Esto permitirá cambiar el `owner` y resolver el nivel.
