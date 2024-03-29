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
- [Reentrance](#nivel-10-reentrance)
- [Elevator](#nivel-11-elevator)
- [Private](#nivel-12-private)
- [GatekeeperOne](#nivel-13-gatekeeperone)
- [GatekeeperTwo](#nivel-14-gatekeepertwo)
- [NaughtCoin](#nivel-15-naughtcoin)
- [Preservation](#nivel-16-preservarion)
- [Recovery](#nivel-17-recovery)
- [MagicNum](#nivel-18-magicnum)
- [AlienCodex](#nivel-19-aliencodex)
- [Denial](#nivel-20-denial)
- [Shop](#nivel-21-shop)
- [Dex](#nivel-22-dex)
- [DexTwo](#nivel-23-dextwo)
- [PuzzleWallet](#nivel-24-puzzlewallet)
- [Motorbike](#nivel-25-motorbike)
- [DoubleEntryPoint](#nivel-26-doubleentrypoint)
- [GoodSamaritan](#nivel-27-goodsamaritan)
- [GatekeeperThree](#nivel-28-gatekeperthree)

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

Observamos que el contrato Reentrance tiene una función `withdraw` que intenta enviar ether a la dirección del `msg.sender`. Esto último, sumado a que los balances se actualizan después de la invocación del método `call`, nos permite explotar esta vulnerabilidad. Creamos un contrato atacante con una función que ejecute `withdraw` y definimos la función `receive`, agregando en ella una llamada a la primera función que definimos. Obtenemos el balance del contrato Reentrance, enviamos esa misma cantidad en nombre de nuestro contrato atacante con la función `donate` y luego llamamos a `withdraw` a través de nuestro contrato atacante. La función se ejecutará la primera vez, Reentrance enviará la mitad del balance y, gracias a la función `receive`, volveremos a invocar `withdraw`, obteniendo así la otra mitad.

# Nivel 11: Elevator

### Qué buscar:

- Invocaciones a contratos externos mediante interfaces, donde la dirección del contrato puede ser elegida por cualquier usuario.. En estos casos se pueden utilizar contratos con código malicioso y así obtener resultados inesperados.

### Resolución:

[Ver código](./test/Elevator.ts)

Vemos que la función `goTo` llama dos veces a `Building.isLastFloor()`. También observamos que, si bien se en el contrato Elevator se define la interfaz del contrato Building, la dirección queda abierta para que cualquiera pueda implementar la lógica que desee. La primera invocación debe devolver el valor `false` y la segunda `true`. Definimos en el contrato Building la función `isLastFloor` con la lógica necesaria para cumplir con lo anterior y otra con la invocación a la función `goTo`. Invocamos a `goTo` a traves de Building para garantizarnos que nuestro contrato sea el `msg.sender`. Al finalizar la transacción el valor `top` es igual a `true`.

# Nivel 12: Private

### Qué buscar:

- Todas las variables de estado de un contrato pueden ser leídas sin importar si son definidas como `public` o `private`, debido a la naturaleza pública de la información que se almacena en la blockchain. Los arrays fijos se almacenan de forma consecutiva.

### Resolución:

[Ver código](./test/Private.ts)

Para resolver este nivel, tenemos que hacer algo similar a lo que hicimos en el nivel Vault. Debemos utilizar `getStorageAt` para obtener el valor de una variable definida como privada. Necesitamos saber, nuevamente, cómo la EVM guarda los datos en el `storage`. En este caso particular, sabemos que la primera variable ocupa el slot 0x0, la segunda el 0x1, y las 3 siguientes comparten la posición 0x2. Como la última es un array fijo, cada uno de sus elementos se almacena secuencialmente. Como nos interesa `data[2]`, buscamos en la posición 0x5. Luego, tenemos que saber que el casting de `bytes16` sobre `bytes32` toma los primeros 16 bytes. Por lo tanto, llamamos a la función `unlock` pasando los primeros 16 bytes del valor obtenido con getStorageAt en la posición 0x05.

# Nivel 13: GatekeeperOne

### Qué buscar:

- Cómo funciona el casting de `uint` de diferentes tamaños.

### Resolución:

[Ver código](./test/GatekeeperOne.ts)

Encontramos tres modifiers que definen tres gates que debemos superar:

Gate one:

```solidity
require(msg.sender != tx.origin);
```

Lo resolvemos utilizando un contrato atacante para que el `msg.sender` sea el address del contrato y nuestra eoa el `tx.origin`.

Gate two:

```solidity
require(gasleft() % 8191 == 0);
```

La función `gasleft()` devuelve la cantidad de gas restante. Para superar este gate, debemos asegurarnos de que el gas restante sea un múltiplo de 8191. Para ello, utilizamos la fuerza bruta hasta encontrar el primer valor de gas que satisfaga la declaración `require`. Hay que tener en cuenta que, si luego queremos utilizar este valor para resolver el nivel en la página de Ethernaut, debemos asegurarnos de utilizar la misma versión del compilador con las mismas opciones.

Gate three:

Como mencionamos anteriormente, debemos saber cómo funciona el casting de `uint` y qué sucede cuando se realiza un casting a un tipo más pequeño que el valor que estamos usando. La respuesta es que, en el caso de que castemos un `uint32` a un `uint16`, perderemos los primeros 16 bits de izquierda a derecha. Sabiendo esto, necesitamos pasar un valor que satisfaga los tres `require`.

```solidity
require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)))
require(uint32(uint64(_gateKey)) != uint64(_gateKey))
require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)))
```

- Para el primero, necesitamos que los últimos 4 bytes de `_gateKey` sean iguales a los últimos 2 bytes.
- Para el segundo, necesitamos que los últimos 4 bytes de `_gateKey` sean diferentes de los 8 bytes de `_gateKey`.
- Y para el tercero, necesitamos que los últimos 4 bytes de `_gateKey` sean iguales a los últimos 2 bytes de `tx.origin`.

Para lograr esto, utilizamos una máscara y la operación &. Una vez que hemos obtenido el valor correcto, podremos convertirnos en `entrant`.

# Nivel 14: GatekeeperTwo

### Qué buscar:

- Inline assembly code: Son operaciones de bajo nivel y pueden conducir a resultados inesperados

### Resolución:

[Ver código](./test/GatekeeperTwo.ts)

Gate one:

Se resuelve de la misma manera que el gate one en el GatekeeperOne.

Gate two:

La porcion de código de assembly está conlocando en la variable x el tamaño del código del contrato en bytes. La única manera que tenemos de ejecutarlo y que sea 0 es en el `contructor`, dado que el bytecode aún no ha sido copiado.

Gate Three:

Lo que debemos hacer es buscar el complemento a nivel de bits del hash de la dirección del contrato atacante (que coincidirá con el msg.sender). Para esto utilizamos el operador `~`. Luego, al realizar la operación `XOR`, obtendremos un número cuyos bits tendran como valor 1. Dado que este número tendrá una longitud de 8 bytes, cuando lo convirtamos a `uint64`, obtendremos el valor máximo posible para un `uint64`.

Con sólo desplegar el contrato con la lógica en el `constructor` lograremos convertirnos en `entrant`

# Nivel 15: NaughtCoin

### Qué buscar:

- ERC20: En algunos casos el estándar se utiliza incorrectamente dejando lugar a vulnerabilidades.

### Resolución:

[Ver código](./test/NaughtCoin.ts)

Nota: Se puede resolver este nivel sin necesidad de usar un contrato atacante, simplemente usando dos EOA en su lugar y aprobando a la segunda desde la cuenta player

Lo que debemos hacer es ejecutar una función estándar de ERC20, `approve`, y pasar como parámetros la dirección del contrato atacante y el total de balance en tokens. De esta manera, le estamos diciendo al contrato NaughtyCoin que estamos aprobando a un tercero para que mueva tokens por nosotros. Luego, desde el contrato atacante, ejecutamos la función `transferFrom` para mover la totalidad de los tokens al contrato atacante y así cumplir con el requisito para pasar el nivel.

# Nivel 16: Preservation

### Qué buscar:

- Cuando usamos `delegatecall`, llamamos a la función de un contrato pero usando el contexto del contrato actual. Por lo tanto, las variables de estado del contrato actual son las que se verán modificadas y no las del contrato llamado con `delegatecall`.
- Errores en las definiciones en la forma en la que se definen las variables de estado cuando se realiza `delegatecall`

### Resolución:

[Ver código](./test/Preservation.ts)

Lo que debemos hacer aquí es entender cómo funcionan `delegatecall` y el almacenamiento. Cuando utilizamos `delegatecall`, llamamos a una función de otro contrato pero usando el contexto del contrato actual. Las variables se emparejan por posición de memoria, por lo que, aunque en el contrato LibraryContract estemos modificando la variable `storedTime`, en realidad estamos haciendo referencia a la posición de memoria número 0.
Por lo tanto, si invocamos la función `setFirstTime` con la dirección de nuestro contrato atacante como argumento, estaremos modificando la variable `timeZoneLibrary`.
Podemos aprovechar esto para definir un contrato atacante que tenga la misma definición de almacenamiento y modifique la variable `owner`.
Luego, volvemos a invocar la misma función, pero esta vez pasando la dirección de nuestra billetera como parámetro para obtener la propiedad del contrato.

# Nivel 17: Recovery

### Qué buscar:

- Cómo se calculan las direcciones de los contratos.

### Resolución:

[Ver código](./test/Recovery.ts)

Nota: Podemos utilizar etherscan para ahorrarnos tener que calcular la dirección del contrato.

Para completar el nivel, debemos averiguar la dirección del contrato SimpleToken para poder ejecutar la función `destruct`. Esto lo logramos considerando cómo se calcula una dirección de un contrato. para esto necesitamos la dirección del creador (Recovery) y su `nonce`. El `nonce` de un contrato comienza en 1 y se incrementa cada vez que realiza una creacion de un contrato. Como es la primera vez que va a crear un contrato, el valor para la creacion de SimpleToken será 1 . La dirección se calcula mediante el RLP encode de la dirección del creador y el `nonce`; luego, se calcula el hash y se toman los primeros 20 bytes. Una vez obtenido, llamamos a la función `destruct` y completamos el nivel

# Nivel 18: MagicNum

### Qué buscar:

- [Learn about bytecode] (https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/)

### Resolución:

[Ver código](./test/MagicNum.ts)

Debemos crear un contrato manualmente, evitando el boilerplate que genera Solidity al compilar (como el puntero de memoria libre, la verificación de no pagabilidad y el selector de función), y enviar nuestro contrato a la blockchain.
Para lograr esto, debemos crear un contrato con un máximo de 10 opcodes (10 bytes). Podemos hacer algo muy simple con el creation code para que retorne el runtime bytecode sin ningún chequeo adicional. Y en el runtime bytecode, solo tenemos que asegurarnos de guardar el valor 42 en la memoria para luego devolverlo.
Una vez que tenemos el bytecode, lo enviamos en una transaccion a la dirección 0x0 para ejecutar la creación del contrato. Luego, obtenemos la dirección de creación y llamamos a la función setSolver pasandola como argumento.

# Nivel 19: AlienCodex

### Qué buscar:

- Operaciones aritméticas sin control previo a la versión 0.8.0 pueden provocar under/overflows. La práctica recomendada es utilizar la librería SafeMath para evitar este tipo de situaciones.
- Cómo se almacenan las variables de estado en los smart contracts, en particular los arrays de tamaño indefinido.

### Resolución:

[Ver código](./test/AlienCodex.ts)

Para resolver este nivel, debemos aprovechar dos vulnerabilidades. En primer lugar, podemos hacer uso del underflow que podemos generar al invocar la función `retract`. Para hacerlo, primero debemos llamar a `make_contact`, y luego a `retract`. De esta forma, obtenemos libertad para acceder al índice de `codex` hasta el número `type(uint256).max.`
Sabemos que el almacenamiento de un array de tamaño indefinido es igual al hash de la posición más el índice. Y como podemos generar un overflow, debemos encontrar un índice que, sumado al hash, provoque un overflow y devuelva `0x01`. Debemos llamar a la función `revise` con dicho índice y la dirección del atacante como segundo parámetro.

# Nivel 20: Denial

### Qué buscar:

- Llamadas externas a contratos desconocidos puede crear attaques de denegacion de servicio si una cantidad fija de gas no es especificada

### Resolución:

[Ver código](./test/Denial.ts)

Para realizar este ataque, podemos crear un contrato atacante que ejecute un loop para consumir todo el gas una vez que reciba ether. Luego, debemos establecer el atacante como `partner` y hacer el submit. Es importante tener en cuenta que los reverts del contrato en un call no necesariamente hacen que la transacción se revierta, pero en este caso lo hacen porque agotan el gas disponible.

# Nivel 21: Shop

### Qué buscar:

- No es seguro cambiar el estado del contrato basándose en la lógica de contratos externos y no confiables.
- Los contratos pueden manipular los datos que son visibles para otros contratos de la manera que deseen.

### Resolución:

[Ver código](./test/Shop.ts)

Creamos un contrato atacante que tenga una interfaz con el contrato Shop, que incluya la función`buy`y el getter `isSold`. En el mismo contrato, creamos la función `price`, que establece un precio condicionado según el valor de `isSold`: si es `false`, el precio será de 100, y si es `true`, el precio será de 1. Luego, ejecutamos la función `buy` a través del contrato atacante y logramos comprar el artículo a un precio de 1.

# Nivel 22: Dex

### Qué buscar:

- En un DEX, el balance no debe ser parte del cálculo del precio, ya que es susceptible a manipulación.

### Resolución:

[Ver código](./test/Dex.ts)

Debemos crear un contrato atacante que realice trades por nosotros, haciendo un swap del total de `token1` que poseemos por `token2`, y luego de `token2` por `token1`. Esto hará que los precios se muevan y en cada iteración obtengamos más tokens hasta que logremos quedarnos con la totalidad de uno de ellos.

# Nivel 23: Dex

### Qué buscar:

- En un DEX, el balance no debe ser parte del cálculo del precio, ya que es susceptible a manipulación.
- Es importante validar los datos. En este caso la vulnerabilidad viene porque no se está controlando que los tokens con los que se interactua sean los definidos previamente

### Resolución:

[Ver código](./test/DexTwo.ts)

Creamos un token malicioso para realizar intercambio con los tokens que realmente deseamos obtener.
En primer lugar, transferiríamos 100 tokens al DEX y, a continuación, aprobamos el gasto (podríamos hacerlo por 300, que es lo que utilizaremos, o por la totalidad de nuestro saldo, ya que esos tokens no tienen ningún valor).
Después, llamamos a la función `swap` del contrato DEX, especificando como origen nuestro token malicioso y como destino el token 1, con un valor de 100. Con esto, ya nos aseguramos de conseguir los 100 tokens del token 1.
Para el token 2, el proceso es muy similar: llamamos a la función `swap` pero cambiamos el destino por el token 2 y el amount por 200.
La razón es que, como hicimos el intercambio anterior, el saldo del token malicioso en el contrato DEX es de 200, y como el cálculo se realiza como amount*dest/orig, obtenemos 200*100/200 = 100.
Finalmente, nos encontraríamos con que el saldo del DEX es de 0 para ambos tokens.

# Nivel 24: PuzzleWallet

### Qué buscar:

- Colisión entre un contrato proxy y su implementación. La definición de las variables de estado debería estar en el contrato de implementación.
- Funciones que realizan acciones de bajo nivel, como ejecutar más de una función en una misma transacción.

### Resolución:

[Ver código](./test/PuzzleWallet.ts)

Primero, llamamos a la función `proposeNewAdmin` del proxy. Debido a la colisión en el almacenamiento al ejecutar esta función para proponer un nuevo `pendingAdmin`, estaremos modificando el `owner` en el contrato de implementación.
Después de esto, como propietarios podemos agregarnos a la whitelist. Esto es necesario para ejecutar `multicall`. Lo ideal sería poder ejecutar `multicall` mandando dos veces la signature de `deposit`, pero tiene un control para evitar esto, por lo que debemos hacer la llamada a `multicall` pasando como funciones a ejecutar la misma `multicall` dos veces con una llamada a `deposit` cada una.
Con esto, lograremos tener el balance suficiente como para extraer todo con `execute`. Luego, aprovechando una vez más el exploit de la colisión del contrato, llamamos a `setMaxBalance` con nuestro address como argumento. `maxBalance` resulta ser el `admin` en el proxy.

# Nivel 25: Motorbike

### Qué buscar:

- Funcion inicializadora en contrato de implementación no inicializada.

### Resolución:

[Ver código](./test/Motorbike.ts)

Debemos interactuar directamente con el contrato de implementación. Primero, debemos obtener la dirección del contrato de implementación. La EIP 1967 define un storage slot en particular, y utilizamos `getStorageAt` en dicha posición para obtener la dirección. Luego, invocamos la función `initialize` para convertirnos en `upgrader`.
Después, podemos invocar `upgradeAndCall` con nuestro contrato attackante que tiene una función fallback que permite hacer un `selfdestruct`. Al invocar `selfdestruct` con delegatecall, podemos ejecutar la función en el contexto del contrato Engine y destruirlo.

# Nivel 26: DoubleEntryPoint

### Qué buscar:

- Manipulaciones de calldata.

### Resolución:

[Ver código](./test/DoubleEntryPoint.ts)

Al observar los contratos, podemos ver que si llamamos a la función `sweepTokens` del contrato CryptoVault con el LegacyToken, haremos que dicho token delegue la transferencia (ejecutando `delegateTransfer`) al token DoubleEntryPoint, que es el token subyacente y que supuestamente no debería poder hacer sweeps. Para evitar esto, podemos aprovechar el modificador `fortaNotify` y crear un bot que, en caso de que se presente esta situación, emita una alerta para revertir la transacción.
Para lograr esto, controlaremos la variable `msgData` (que contiene el `calldata` de la llamada anterior). Verificaremos los primeros 4 bytes y los compararemos con la firma de la función, y comprobaremos si el remitente original coincide con la dirección de CryptoVault. Si ese es el caso, cargaremos la notificación y haremos que la transacción se revierta.

# Level 27: GoodSamaritan

### Qué buscar:

- Invocaciones a contratos externos mediante interfaces, donde la dirección del contrato puede ser elegida por cualquier usuario.. En estos casos se pueden utilizar contratos con código malicioso y así obtener resultados inesperados.

### Resolución:

[See code](./test/GoodSamaritan.ts)

La única llamada que podemos hacer a GoodSamaritan es desde `requestDonation`. Esta función, al ejecutarse, llama al contrato Wallet con la función `donate10`. Si esta función falla con unos bytes en particular, se ejecuta `transfRemainder`. Estos bytes en particular deben tener el mismo hash que `abi.encodeWithSignature("NotEnoughBalance()")`.
Si entramos en `donate10`, veremos que se invoca la función `transfer` del contrato Coin. Esta función tiene una particularidad: si el llamador es un contrato, ejecuta la función `notify` sobre dicho contrato. Esto nos da la oportunidad de revertir la función en los casos que nos interese y retornar al llamador el bytecode solicitado. Para esto, creamos un contrato "attacker" que ejecutará el call a GoodSamaritan y tendrá una función `notify` para que sea invocado desde el contrato Coin. Haremos que falle cuando intente `donate10` revirtiendo con el error `NotEnoughBalance`, que casualmente funciona como la signatura de una función. Luego, lograremos que se ejecute `transfRemainder`.

# Level 28: GatekeeperThree

### Qué buscar:

- Todas las variables de estado de un contrato pueden ser leídas sin importar si están definidas como `public` o `private`, debido a la naturaleza pública de la información que se almacena en la blockchain. También se puede obtener toda la metadata relacionada con la transacción.
- Las ejecuciones no controladas de `send` pueden revertir la operación sin revertir la transacción y pueden generar reentradas.

### Resolución:

[See code](./test/GatekeeperThree.ts)

Encontramos tres modifiers que definen tres gates que debemos superar:

Gate one:

```solidity
    require(msg.sender == owner);
    require(tx.origin != owner);
```

El `msg.sender` debe ser el owner pero no el `tx.origin`. Lo resolvemos utilizando un contrato atacante para que el `msg.sender` sea el address del contrato y nuestra eoa el `tx.origin`.

Gate two:

```solidity
    require(allow_entrance == true);
```

Para el segundo gate, debemos averiguar la contraseña para convertir la variable allow_entrance en `true`. Esto lo hacemos llamando a la función createTrick. Tenemos dos opciones: podemos usar el recibo de la transacción para ver el `block.timestamp`, o podemos aprovechar lo que sabemos acerca de cómo Solidity almacena las variables de estado y llamar a `getStorageAt` en la posición 0x02. Luego llamamos a `getAllowance` con el valor que obtuvimos del almacenamiento y logramos que `allow_entrance` esté en `true`.

Gate Three

```solidity
    if (address(this).balance > 0.001 ether && payable(owner).send(0.001 ether) == false)
```

Para este gate, necesitas tener un saldo mayor a 0.001 ETH. Para lograrlo, te transferimos 0.0011 ETH. En el contrato atacante, vamos a agregar la función `receive` y vamos a poner un `revert` para que la segunda parte del `require` resulte en `false`.
