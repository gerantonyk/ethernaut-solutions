# Ethernaut Solutions

[Hire Me](https://www.linkedin.com/in/germansuarezdev/)
<br>
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
- [Token](#nivel-5-token)
- [Delegation](#nivel-6-delegation)
- [Force](#nivel-7-force)
- [Vault](#nivel-8-vault)
- [King](#nivel-9-king)
- [Reentrance](#nivel-9-reentrance)

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

# Level 5: Token

### Qué buscar:

- Operaciones aritmeticas no controladas previo a la version de 0.8.0 pueden provocar under/overflows. La práctica correcta es usar la libreria SafeMath cuando queremos evitar que esto ocurra

### Resolución:

[Ver código](./test/Token.ts)

En la funcion `transfer` vemos dos operaciones no controladas que pueden producir underflows:

```solidity
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
```

Nos basta con invocar la funcion `transfer`enviando 21 tokens (1 más que el balance). En ambos casos, se va a producir underflow dando como resultado 2^256-1 en el `require` y en la asignacion del balance. Cuando chequeamos nuevamente vemos el numero antes mencionado como balance y completamos el nivel.

# Nivel 6: Delegation

### Qué buscar:

- Cuando usamos `delegatecall`, llamamos a la función de un contrato pero usando el contexto del contrato actual. Por lo tanto, las variables de estado del contrato actual son las que se verán modificadas y no las del contrato llamado con `delegatecall`.

### Resolución:

[Ver código](./test/Delegation.ts)

Para completar este nivel, basta con llamar a la función `pwn` en el contrato `Delegation` utilizando el ABI del contrato `Delegate`, o enviando una transacción con `Delegation` como destino y la calldata que contenga los primeros 4 bytes del hash de la firma de la función `pwn`. Con esto, lograremos ejecutar `pwn` sobre las variables de estado de `Delegation`, obteniendo así la propiedad (ownership).

# Nivel 7: Force

### Qué buscar:

- Para que un smart contract pueda recibir ether sin necesidad de enviarlo invocando una funcion payable particular, debe implementar las funciones `fallback` o `receive`.

### Resolución:

[Ver código](./test/Force.ts)

Como el contrato no tiene ninguna de las funciones fallback mencionadas anteriormente, la única alternativa que tenemos para forzar el envío es crear un contrato atacante que tenga una función que reciba ether y ejecute el comando `selfdestruct`, pasando como parámetro la dirección del contrato Force. Luego de ejecutar dicha función, verificamos el contrato Force y observamos que tendrá el saldo que enviamos al contrato atacante.

# Nivel 8: Vault

### Qué buscar:

- Todas las variables de estado de un contrato pueden ser leídas sin importar si son definidas como `public` o `private`, debido a la naturaleza pública de la información que se almacena en la blockchain.

### Resolución:

[Ver código](./test/Vault.ts)

Nota: El ejercicio fue resuelto inicialmente en la web de Ethernaut, por eso, para cuando armé este repositorio, coloqué directamente la contraseña correcta en el setup. De todas maneras, la solución funciona sin importar qué se haya elegido como contraseña.

Vemos que la variable `password` está definida como `private`, lo que significa que no se genera automáticamente una función getter para poder leer su valor. Dada esta situación, debemos recurrir a leer el almacenamiento del contrato "manualmente". Para esto, necesitamos saber cómo se almacena la información. No vamos a entrar en detalle aquí, pero la EVM almacena los datos en porciones de 32 bytes con algunas reglas particulares. En este caso, ocupa la posición 0x0 para la primera variable y la posición 0x1 para la variable que nos interesa, `password`. Utilizamos `getStorageAt` para obtener el valor y luego lo utilizamos como parámetro en la invocación de la función `unlock` para completar el nivel.

# Nivel 9: King

### Qué buscar:

- Cuando un contrato envía ether usando el método `transfer`, si el destinatario es otro contrato, es susceptible a la lógica que se ejecute en la función `receive` o `fallback` del receptor. Si por alguna razón el método `transfer` falla, toda la transacción es revertida.

### Resolución:

[Ver código](./test/King.ts)

Teniendo en cuenta que para convertirnos en `king`, lo que debemos hacer es enviar ether al contrato y que necesitamos prevenir que el propietario reclame el estatus de `king`, crearemos un contrato atacante con una función que nos permita reenviar ether al contrato King y una función `receive` que nos permita revertir la transacción en caso de que reciba ether sin que una función en particular sea invocada.
Desplegamos dicho contrato atacante, averiguamos cuál es el valor de la variable `prize` e invocamos a la función en nuestro contrato atacante para reenviar dicho valor en ether al contrato `King`. Con esto ya hemos convertido nuestro contrato atacante en `king`. Luego, gracias al `revert` que agregamos en la función `receive`, cuando el propietario del contrato intente reclamar el título de `king`, la transacción será revertida debido a la ejecución del método `transfer` con destino al contrato atacante.

# Nivel 10:

### Qué buscar:

- Reentrancy attacks: Cuando tenemos una función que envía ether a una dirección cualquiera, corremos el riesgo de que el contrato receptor implemente lógica maliciosa que permita volver a invocar al contrato original en la misma transacción. Debemos verificar que las actualizaciones de estado, como saldos, se actualicen antes de realizar la llamada.
- El método `call` permite la llamada a otro contrato con la particularidad de que la invocación puede revertir sin revertir la transacción.

### Resolución:

[Ver código](./test/Reentrance.ts)

Nota: El contrato importa la librería SafeMath pero luego no la implementa en las operaciones, por lo que podríamos optar por una solución agnóstica del balance del contrato, buscando generar un desbordamiento negativo (underflow) con una reentrada. Con esto, aumentaríamos drásticamente nuestro balance y podríamos extraer la totalidad de fondos del contrato.

Observamos que el contrato Reentrance tiene una función withdraw que intenta enviar ether a la dirección del msg.sender. Esto último, sumado a que los balances se actualizan después de la invocación del método call, nos permite explotar esta vulnerabilidad. Creamos un contrato atacante con una función que ejecute withdraw y definimos la función receive, agregando en ella una llamada a la primera función que definimos. Obtenemos el balance del contrato Reentrance, enviamos esa misma cantidad en nombre de nuestro contrato atacante con la función donate y luego llamamos a withdraw a través de nuestro contrato atacante. La función se ejecutará la primera vez, Reentrance enviará la mitad del balance y, gracias a la función receive, volveremos a invocar withdraw, obteniendo así la otra mitad.

# Nivel 11:

### Qué buscar:

### Resolución:
