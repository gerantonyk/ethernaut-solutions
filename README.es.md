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

- [Fallback](#level-one-fallback)
- [Fallout](#level-two-fallout)
- [Coin Flip](#level-three-coin-flip)

## Nivel 1: Fallback

### Que buscar:

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

### Que buscar:

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

## Level Three: Coin Flip