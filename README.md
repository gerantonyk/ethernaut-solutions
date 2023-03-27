# Ethernet Solutions

[Hire Me](https://www.linkedin.com/in/germansuarezdev/)
<br>
[Leer en español](README.es.md)

This project contains the solutions and explanations for all the current levels of OpenZeppelin's wargame, Ethernaut.

## How to use this repo

Follow these steps to use the repo:

### 1. Install dependencies

First, install all the necessary dependencies:

```shell
npm install
```

### 2. Run the desired level

Select the level you want to run and execute the following command, replacing `[levelName].ts` with the desired level's name:

```shell
npx hardhat test ./test/[levelName].ts
```

# Levels

- [Fallback](#level-1-fallback)
- [Fallout](#level-2-fallout)
- [Coin Flip](#level-3-coin-flip)
- [Telephone](#level-4-telephone)
- [Token](#level-5-token)
- [Delegation](#level-6-delegation)
- [Force](#level-7-force)
- [Vault](#level-8-vault)
- [King](#level-9-king)
- [Reentrance](#level-9-reentrance)

## Level 1: Fallback

### What to look for:

- Functions like receiving and `fallback` and `fallback` which can alter access control

### Resolution:

[View code](./test/Fallback.ts)

We observe that the contract has a fallback (receive) function that allows us to become the owner:

```solidity
require(msg.value > 0 && contributions[msg.sender] > 0);
owner = msg.sender;
```

This function is executed when the contract receives ether without call data.
First, we need to execute `contribute` to send some ether without the transaction being reverted.
Next, send ether without call data to trigger the `receive` function and become the owner of the contract.
Finally, execute the withdraw function to `withdraw` the contract balance and leave it at 0.

## Level 2: Fallout

### What to look for:

- Spelling mistakes

### Resolution:

[View code](./test/Fallout.ts)

In previous versions of Solidity, to specify the function that is executed when deploying a contract, one with the same name as the contract was used and it functioned as a constructor.
In this case, if we try to view the value of either of the two variables, we quickly see that they are empty:

```solidity
    owner = msg.sender;
    allocations[owner] = msg.value;
```

This is due to a spelling mistake in the constructor function, and its name does not match the Fallout contract vs. Fal1out.

Simply executing Fal1out is enough to make us the owner of the contract and thus complete the level.

## Level 3: Coin Flip

### What to look for:

- Public logic that shows us how the contract works and has a return that allows us to manipulate it (in this case, the main function returns a bool that lets us revert the transaction if we don't like the outcome).

### Resolution:

[View code](./test/CoinFlip.ts)

Note: After developing this solution, I found others that involve copying the logic to predict the outcome. The latter is more efficient, as it requires fewer transactions. Below is the first solution I came up with, although it is less efficient.

In this case, seeing that the `flip` function returns a boolean with the result (`true` if we're right, `false` if not), we can simply create an attacker contract that calls the function in question and reverts if we don't guess the right outcome. With this, we ensure that only transactions in which we are right are confirmed. After several attempts, we achieve 10 consecutive wins.

## Level 4: Telephone

### What to look for:

- tx.origin: always refers to the EOA (externally owned account) that originated the transaction.

### Resolution:

[View code](./test/Telephone.ts)

We see that the only available function is `changeOwner` and it has the following condition:

```solidity
    if (tx.origin != msg.sender) {
      owner = _owner;
    }
```

To bypass this, we just need to create a contract that acts as an intermediary in the call to `changeOwner`. In this way, our `tx.origin` will be the EOA and the `msg.sender` will be the intermediary contract. This will allow changing the `owner` and solving the level.

## Level 5: Token

### What to look for:

- Uncontrolled arithmetic operations before Solidity version 0.8.0 can cause under/overflows. The correct practice is to use the SafeMath library when we want to prevent this from happening.

### Resolution:

[View code](./test/Token.ts)

In the `transfer` function, we see two uncontrolled operations that can cause underflows:

```solidity
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
```

We just need to invoke the `transfer` function by sending 21 tokens (1 more than the balance). In both cases, an underflow will occur, resulting in 2^256-1 in the `require` statement and in the balance assignment. When we check the balance again, we see the aforementioned number as the balance, and we complete the level.

## Level 6: Delegation

### What to look for:

- When using `delegatecall`, we call a function of another contract but using the context of the current contract. As a result, the state variables of the current contract are the ones that will be modified, not the ones from the contract called with `delegatecall`.

### Resolution:

[View code](./test/Delegation.ts)

To complete this level, simply call the `pwn` function in the `Delegation` contract using the ABI of the `Delegate` contract, or by sending a transaction with `Delegation` as the destination and the calldata containing the first 4 bytes of the hash of the `pwn` function signature. This will execute the `pwn` function on the state variables of `Delegation`, thus obtaining ownership.

# Level 7: Force

### What to look for:

- In order for a smart contract to receive ether without having to send it by invoking a particular payable function, it must implement the `fallback` or `receive` functions.

### Resolution:

[Ver código](./test/Force.ts)

Since the contract does not have any of the previously mentioned fallback functions, the only alternative we have to force the transfer is to create an attacker contract with a function that receives ether and executes the selfdestruct command, passing the Force contract's address as a parameter. After executing this function, we can verify the Force contract and see that it has the balance we sent to the attacker contract.

# Level 8: Vault

### What to look for:

- All state variables of a contract can be read regardless of whether they are defined as `public` or `private`, due to the public nature of the information stored on the blockchain.

### Resolution:

[Ver código](./test/Vault.ts)

Note: The exercise was initially solved on the Ethernaut website, so when I set up this repository, I directly placed the correct password in the setup. Regardless, the solution works no matter what password is chosen.

The `password` variable is defined as `private`, which means an automatic getter function is not generated to read its value. Given this situation, we must resort to reading the contract storage "manually." For this, we need to know how the information is stored. We won't go into detail here, but the EVM stores data in 32-byte portions with some specific rules. In this case, it occupies position 0x0 for the first variable and position 0x1 for the variable of interest, `password`. We use `getStorageAt` to obtain the value and then use it as a parameter when invoking the `unlock` function to complete the level.

# Level 9: King

### What to look for:

- When a contract sends ether using the `transfer` method, if the recipient is another contract, it is susceptible to the logic executed in the `receive` or fallback function of the receiving contract. If for some reason the `transfer` method fails, the entire transaction is reverted.

### Resolution:

[Ver código](./test/King.ts)

Considering that to become the `king`, we need to send ether to the contract and prevent the owner from reclaiming the `king` status, we will create an attacking contract with a function that allows us to resend ether to the King contract and a `receive` function that allows us to revert the transaction in case it receives ether without a specific function being invoked.
We deploy the attacking contract, find out the value of the `prize` variable, and invoke the function in our attacking contract to resend that value in ether to the King contract. By doing this, we have made our attacking contract the `king`. Then, thanks to the `revert` we added to the `receive` function, when the owner of the contract tries to reclaim the `king` title, the transaction will be reverted due to the execution of the `transfer` method with the attacking contract as the destination.

# Level 10: Reentrance

### What to look for:

- When a contract sends ether using the `transfer` method, if the recipient is another contract, it is susceptible to the logic executed in the `receive` or fallback function of the receiving contract. If for some reason the `transfer` method fails, the entire transaction is reverted.

### Resolution:
