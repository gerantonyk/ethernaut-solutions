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
- [Reentrance](#level-10-reentrance)
- [Elevator](#level-11-elevator)
- [Private](#level-12-private)
- [GatekeeperOne](#level-13-gatekeeperone)
- [GatekeeperTwo](#level-14-gatekeepertwo)
- [NaughtCoin](#level-15-naughtcoin)
- [Preservation](#level-16-preservarion)
- [Recovery](#level-17-recovery)
- [MagicNum](#level-18-magicnum)
- [AlienCodex](#level-19-aliencodex)
- [Denial](#level-20-denial)
- [Shop](#level-21-shop)
- [Dex](#level-22-dex)
- [DexTwo](#level-23-dextwo)
- [PuzzleWallet](#level-24-puzzlewallet)
- [Motorbike](#level-25-motorbike)
- [DoubleEntryPoint](#level-26-doubleentrypoint)
- [GoodSamaritan](#level-27-goodsamaritan)
- [GatekeeperThree](#level-28-gatekeperthree)

## Level 1: Fallback

### What to look for:

- Functions like `receiving` and `fallback` which can alter access control

### Resolution:

[See code](./test/Fallback.ts)

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

[See code](./test/Fallout.ts)

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

[See code](./test/CoinFlip.ts)

Note: After developing this solution, I found others that involve copying the logic to predict the outcome. The latter is more efficient, as it requires fewer transactions. Below is the first solution I came up with, although it is less efficient.

In this case, seeing that the `flip` function returns a boolean with the result (`true` if we're right, `false` if not), we can simply create an attacker contract that calls the function in question and reverts if we don't guess the right outcome. With this, we ensure that only transactions in which we are right are confirmed. After several attempts, we achieve 10 consecutive wins.

## Level 4: Telephone

### What to look for:

- tx.origin: always refers to the EOA (externally owned account) that originated the transaction.

### Resolution:

[See code](./test/Telephone.ts)

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

[See code](./test/Token.ts)

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

[See code](./test/Delegation.ts)

To complete this level, simply call the `pwn` function in the `Delegation` contract using the ABI of the `Delegate` contract, or by sending a transaction with `Delegation` as the destination and the calldata containing the first 4 bytes of the hash of the `pwn` function signature. This will execute the `pwn` function on the state variables of `Delegation`, thus obtaining ownership.

# Level 7: Force

### What to look for:

- In order for a smart contract to receive ether without having to send it by invoking a particular payable function, it must implement the `fallback` or `receive` functions.

### Resolution:

[See code](./test/Force.ts)

Since the contract does not have any of the previously mentioned fallback functions, the only alternative we have to force the transfer is to create an attacker contract with a function that receives ether and executes the selfdestruct command, passing the Force contract's address as a parameter. After executing this function, we can verify the Force contract and see that it has the balance we sent to the attacker contract.

# Level 8: Vault

### What to look for:

- All state variables of a contract can be read regardless of whether they are defined as `public` or `private`, due to the public nature of the information stored on the blockchain.

### Resolution:

[See code](./test/Vault.ts)

Note: The exercise was initially solved on the Ethernaut website, so when I set up this repository, I directly placed the correct password in the setup. Regardless, the solution works no matter what password is chosen.

The `password` variable is defined as `private`, which means an automatic getter function is not generated to read its value. Given this situation, we must resort to reading the contract storage "manually." For this, we need to know how the information is stored. We won't go into detail here, but the EVM stores data in 32-byte portions with some specific rules. In this case, it occupies position 0x0 for the first variable and position 0x1 for the variable of interest, `password`. We use `getStorageAt` to obtain the value and then use it as a parameter when invoking the `unlock` function to complete the level.

# Level 9: King

### What to look for:

- When a contract sends ether using the `transfer` method, if the recipient is another contract, it is susceptible to the logic executed in the `receive` or fallback function of the receiving contract. If for some reason the `transfer` method fails, the entire transaction is reverted.

### Resolution:

[See code](./test/King.ts)

Considering that to become the `king`, we need to send ether to the contract and prevent the owner from reclaiming the `king` status, we will create an attacking contract with a function that allows us to resend ether to the King contract and a `receive` function that allows us to revert the transaction in case it receives ether without a specific function being invoked.
We deploy the attacking contract, find out the value of the `prize` variable, and invoke the function in our attacking contract to resend that value in ether to the King contract. By doing this, we have made our attacking contract the `king`. Then, thanks to the `revert` we added to the `receive` function, when the owner of the contract tries to reclaim the `king` title, the transaction will be reverted due to the execution of the `transfer` method with the attacking contract as the destination.

# Level 10: Reentrance

### What to look for:

- Reentrancy attacks: When we have a function that sends ether to any address, we run the risk that the receiving contract implements malicious logic that allows it to re-invoke the original contract within the same transaction. We must ensure that state updates, such as balances, are updated before making the call.
- The `call` method allows calling another contract with the particularity that the invocation can be reverted without reverting the entire transaction.

### Resolution:

[See code](./test/Reentrance.ts)

Note: The contract imports the SafeMath library but does not implement it in the operations, so we could opt for a solution that is agnostic to the contract balance, seeking to generate a negative overflow (underflow) with a reentry. With this, we would drastically increase our balance and could extract the entire funds from the contract.

We observe that the Reentrance contract has a `withdraw` function that attempts to send ether to the `msg.sender`'s address. This, combined with the fact that the balances are updated after the call method invocation, allows us to exploit this vulnerability. We create an attacking contract with a function that executes `withdraw` and define the `receive` function, adding to it a call to the first function we defined. We obtain the balance of the Reentrance contract, send the same amount on behalf of our attacking contract using the `donate` function, and then call `withdraw` through our attacking contract. The function will execute the first time, Reentrance will send half of the balance, and thanks to the `receive` function, we will re-invoke `withdraw`, thus obtaining the other half.

# Level 11: Elevator

### What to look for:

- Invocations to external contracts through interfaces, where the contract address can be chosen by any user. In these cases, malicious contracts can be used to obtain unexpected results.

### Resolution:

[See code](./test/Elevator.ts)

We can see that the `goTo` function calls `Building.isLastFloor()` twice. We also observe that, although the Building contract interface is defined in the Elevator contract, the address is left open for anyone to implement the logic they want. The first invocation must return the value `false`, and the second one must return `true`. We define the `isLastFloor` function in the Building contract with the necessary logic to comply with the above and another one with the invocation to the `goTo` function. We invoke `goTo` through Building to ensure that our contract is the `msg.sender`. At the end of the transaction, the `<e` value is equal to `true`.

# Level 12: Private

### What to look for:

- All state variables of a contract can be read regardless of whether they are defined as `public` or `private`, due to the public nature of the information stored on the blockchain. The fixed arrays are stored sequentially.

### Resolution:

[See code](./test/Private.ts)

To solve this level, we have to do something similar to what we did in the Vault level. We need to use `getStorageAt` to get the value of a variable defined as private. We need to know, again, how the EVM stores data in `storage`. In this particular case, we know that the first variable occupies slot 0x0, the second occupies 0x1, and the next 3 share position 0x2. Since the last one is a fixed array, each of its elements is stored sequentially. Since we're interested in `data[2]`, we look for it at position 0x5. Then, we need to know that casting `bytes16` on `bytes32` takes the first 16 bytes. Therefore, we call `unlock` function passing the first 16 bytes of the value obtained with `getStorageAt` at position 0x05.

# Level 13: GatekeeperOne

### What to look for:

- How casting of `uint` of different sizes works.

### Resolution:

[See code](./test/GatekeeperOne.ts)

We come across three modifiers that define three gates that we must overcome:

Gate one:

```solidity
require(msg.sender != tx.origin);
```

We solve this by using an attacking contract so that `msg.sender` is the contract's address and our externally owned account (EOA) is the`tx.origin`.

Gate two:

```solidity
require(gasleft() % 8191 == 0);
```

The `gasleft()` function returns the amount of gas left. To overcome this gate, we must make sure that the remaining gas is a multiple of 8191. For this, we will use brute force to find out the first gas value that satisfies the `require` statement. Keep in mind that if we want to use this value to solve the level on the Ethernaut page, we must make sure to use the same compiler version with the same options.

Gate three:

As we mentioned earlier, we need to know how the casting of `uint` works and what happens when we cast to a smaller type than the value we are using. The answer is that in the case of casting a `uint32` to a `uint16`, we lose the first 16 bits from left to right. Knowing this, we need to pass a value that satisfies all three require statements.

```solidity
require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)))
require(uint32(uint64(_gateKey)) != uint64(_gateKey))
require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)))
```

- For the first one, we need the last 4 bytes of `_gateKey` to be the same as the last 2 bytes.
- For the second one, we need the last 4 bytes of `_gateKey` to be different from the 8 bytes of `_gateKey`.
- And for the third one, we need the last 4 bytes of `_gateKey` to be the same as the last 2 bytes of tx.origin.

To achieve this, we use a mask and the bitwise operation &. Once we have obtained the correct value, we will be able to become the `entrant`.

# Level 14: GatekeeperTwo

### What to look for:

- Inline assembly code: Low-level operations that can lead to unexpected results

### Resolution:

[See code](./test/GatekeeperTwo.ts)

Gate one:

It is solved in the same way as gate one in GatekeeperOne.

Gate two:

The assembly code portion stores the size of the contract's bytecode in bytes in the variable x. The only way we can execute it and get 0 is in the `constructor`, since the bytecode has not yet been copied.

Gate Three:

What we need to do is to search for the bitwise complement of the hash of the attacker contract address (which will match msg.sender). To do this, we use the `~` operator. Then, by performing the `XOR` operation, we will get a number whose bits will have a value of 1. Since this number will have a length of 8 bytes, when we convert it to `uint64`, we will get the maximum possible value for a `uint64`.

By simply deploying the contract with the logic in the `constructor`, we will be able to become an `entrant`.

# Level 15: NaughtCoin

### What to look for:

- ERC20: In some cases, the standard is incorrectly used, leaving room for vulnerabilities.

### Resolution:

[See code](./test/NaughtCoin.ts)

Note: This level can be solved without using an attacking contract, simply by using two EOA instead and approving the second one from the player's account.

What we need to do is execute a standard ERC20 function, `approve`, and pass as parameters the address of the attacking contract and the total balance in tokens. This way, we are telling the NaughtyCoin contract that we are approving a third party to move tokens on our behalf. Then, from the attacking contract, we execute the `transferFrom` function to move all the tokens to the attacking contract and thus fulfill the requirement to pass the level.

# Level 16: Preservation

### What to look for:

- When using `delegatecall`, we call a function of another contract but using the context of the current contract. As a result, the state variables of the current contract are the ones that will be modified, not the ones from the contract called with `delegatecall`.
- Errors in the way state variables are defined when performing `delegatecall`.

### Resolution:

[See code](./test/Preservation.ts)

What we need to do here is understand how `delegatecall` and storage work. When we use `delegatecall`, we call a function from another contract but using the context of the current contract. Variables are matched by memory position, so even though in the LibraryContract contract we are modifying the `storedTime` variable, we are actually referring to memory position number 0.
Therefore, if we invoke the `setFirstTime` function with the address of our attacking contract as an argument, we will be modifying the `timeZoneLibrary` variable.
We can take advantage of this to define an attacking contract that has the same storage definition and modifies the `owner` variable.
Then, we call the same function again, but this time passing the address of our wallet as a parameter to obtain ownership of the contract.

# Level 17: Recovery

### What to look for:

- How to calculate the addresses of contracts.

### Resolution:

[See code](./test/Recovery.ts)

Note: We can use Etherscan to save ourselves the trouble of calculating the contract address.

To complete the level, we need to find out the address of the SimpleToken contract so we can execute the `destruct` function. We can do this by considering how a contract address is calculated. We need the creator's address (Recovery) and their `nonce`. The `nonce` of a contract starts at 1 and increments each time a contract is created. As this is the first time a contract is being created, the value for the creation of SimpleToken will be 1. The address is calculated by RLP encoding the creator's address and the `nonce`; then, the hash is calculated and the first 20 bytes are taken. Once we have obtained the address, we call the `destruct` function and complete the level.

# Level 18: MagicNum

### What to look for:

- [Learn about bytecode] (https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/)

### Resolution:

[See code](./test/MagicNum.ts)

We need to manually create a contract, avoiding the Solidity boilerplate generated upon compilation (such as the free memory pointer, non-payable check, and function selector), and send our contract to the blockchain.
To achieve this, we must create a contract with a maximum of 10 opcodes (10 bytes). We can do something very simple with the creation code to just return the runtime bytecode without any additional checks. And in the runtime bytecode, we only have to ensure that we save the value 42 in memory to later return it.
Once we have the bytecode, we send it in a transaction to the address 0x0 to execute the contract creation. Then, we obtain the creation address and call the setSolver function passing it as an argument.

# Level 19: AlienCodex

### What to look for:

- Uncontrolled arithmetic operations prior to version 0.8.0 can lead to under/overflows. The recommended practice is to use the SafeMath library to avoid such situations.
- How state variables are stored in smart contracts, particularly arrays of indefinite size.

### Resolution:

[See code](./test/AlienCodex.ts)

To solve this level, we need to take advantage of two vulnerabilities. First, we can make use of the underflow that can be generated by calling the `retract` function. To do this, we must first call `make_contact`, and then `retract`. This gives us the freedom to access the `codex` index up to the number type(uint256).max.
We know that the storage of an array of indefinite size is equal to the hash of the position in storage plus the index.Since we can generate an overflow, we need to find an index that, when added to the hash, causes an overflow and returns `0x01`. We must call the `revise` function with this index and the attacker's address as the second parameter.

# Level 20: Denial

- [Learn about bytecode] (https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/)

### What to look for:

- External calls to unknown contracts can still create denial of service attack vectors if a fixed amount of gas is not specified.

### Resolution:

[See code](./test/Denial.ts)

To carry out this attack, we can create an attacking contract that executes a loop to consume all gas once it receives ether. Then, we must set the attacker as a `partner` and submit the level. It is important to note that reverts from the contract in a call do not necessarily cause the transaction to revert, but in this case they do because they exhaust the available gas.

# Level 21: Shop

### What to look for:

- Contracts can manipulate data seen by other contracts in any way they want.
- It's unsafe to change the state based on external and untrusted contracts logic.

### Resolution:

[See code](./test/Shop.ts)

We create an attacker contract that has an interface with the Shop contract, which includes the `buy` function and the `isSold` getter. In the same contract, we create the `price` function, which sets a `price` conditioned on the value of `isSold`: if it is false, the `price` will be 100, and if it is true, the `price` will be 1. Then, we execute the `buy` function through the attacker contract and manage to purchase the item at a `price` of 1.

# Level 22: Dex

### What to look for:

- In a DEX (decentralized exchange), the balance should not be included in the price calculation, as it can be manipulated.

### Resolution:

[See code](./test/Dex.ts)

We need to create an attacker contract that performs trades for us, swapping the total `token1` we hold for `token2`, and then `token2` for `token1`. This will cause the prices to move and in each iteration we will obtain more tokens until we manage to get the entirety of one of them.

# Level 23: DexTwo

### What to look for:

- In a DEX (decentralized exchange), the balance should not be included in the price calculation, as it can be manipulated.
- It is important to validate data. In this case, the vulnerability arises because it is not being controlled that the tokens with which one interacts are those defined previously.

### Resolution:

[See code](./test/DexTwo.ts)

We create a malicious token to perform an exchange with the tokens we really want to obtain.
First, we transfer 100 tokens to the DEX and then approve the spending (we could do it for 300, which is what we will use, or for the total of our balance, as those tokens have no value).
Next, we call the `swap` function of the DEX contract, specifying our malicious token as the origin and token 1 as the destination, with a value of 100. With this, we ensure that we obtain 100 tokens of token 1.
For token 2, the process is very similar: we call the `swap` function but change the destination to token 2 and the amount to 200.
The reason is that, as we made the previous exchange, the balance of the malicious token in the DEX contract is 200, and since the calculation is made as amount*dest/orig, we obtain 200*100/200 = 100.
Finally, we find that the DEX balance is 0 for both tokens.

# Level 24: PuzzleWallet

### What to look for:

- Collision between a proxy contract and its implementation. The definition of the state variables should be in the implementation contract.
- Functions that perform low-level actions, such as executing more than one function in a single transaction.

### Resolution:

[See code](./test/PuzzleWallet.ts)

First, we call the `proposeNewAdmin` function of the proxy. Due to the collision in the storage when executing this function to propose a new `pendingAdmin`, we will be modifying the owner in the implementation contract.
After this, as owners, we can add ourselves to the whitelist. This is necessary to execute `multicall`. Ideally, we could execute `multicall` by sending the `deposit` signature twice, but there is a control to prevent this, so we must call `multicall` passing the same `multicall` function to execute twice, each with a call to `deposit`.
With this, we will have enough balance to extract everything with execute. Then, taking advantage once again of the exploit of the collision in the contract, we call `setMaxBalance` with our address as an argument. `maxBalance` turns out to be the `admin` in the proxy.

# Level 25: Motorbike

### What to look for:

- Initializer function in implementation contract not initialized.

### Resolution:

[See code](./test/Motorbike.ts)

We must interact directly with the implementation contract. First, we need to obtain the address of the implementation contract. EIP 1967 defines a specific storage slot, and we use `getStorageAt` at that position to obtain the implementation address. Then, we call the `initialize` function to become an `upgrader`.
After that, we can invoke `upgradeAndCall` with our attacking contract, which has a fallback function that allows for `selfdestruct`. By calling `selfdestruct` with delegatecall, we can execute the function in the context of the Engine contract and destroy it.

# Level 26: DoubleEntryPoint

### What to look for:

- Calldata manipulations.

### Resolution:

[See code](./test/DoubleEntryPoint.ts)

By examining the contracts, we can see that if we call the `sweepTokens` function of the CryptoVault contract with the LegacyToken, we will cause that token to delegate the transfer (executing `delegateTransfer`) to the DoubleEntryPoint token, which is the underlying token and is not supposed to be able to perform sweeps. To prevent this, we can take advantage of the `fortaNotify` modifier and create a bot that, in case this situation arises, issues an alert to revert the transaction.
To achieve this, we will control the `msgData` variable (which contains the `calldata` of the original call). We will check the first 4 bytes and compare them with the function signature, and we will verify if the original sender matches the address of CryptoVault. If this is the case, we will load the notification and make the transaction revert.

# Level 27: GoodSamaritan

### What to look for:

- Invocations to external contracts through interfaces, where the contract address can be chosen by any user. In these cases, malicious contracts can be used to obtain unexpected results.

### Resolution:

[See code](./test/GoodSamaritan.ts)

The only call we can make to GoodSamaritan is from `requestDonation`. When executed, this function calls the Wallet contract with the `donate10` function. If this function fails with specific bytes, `transfRemainder` is executed. These particular bytes must have the same hash as `abi.encodeWithSignature("NotEnoughBalance()")`.

If we look into `donate10`, we see that the `transfer` function of the Coin contract is invoked. This function has a peculiarity: if the caller is a contract, it executes the `notify` function on that contract. This gives us the opportunity to revert the function in cases of interest and return the requested bytecode to the caller. For this, we create an "attacker" contract that will execute the call to GoodSamaritan and will have a `notify` function to be invoked from the Coin contract. We will make it fail when trying to `donate10` by reverting with the error NotEnoughBalance, which conveniently functions as the signature of a function. Then, we will achieve the execution of `transfRemainder`.

# Level 28: GatekeeperThree

### What to look for:

- All state variables of a contract can be read regardless of whether they are defined as `public` or `private`, due to the public nature of the information stored on the blockchain. All metadata related to the transaction can also be obtained.
- Uncontrolled `send` executions can revert the operation without reverting the transaction and can generate reentrancy.

### Resolution:

[See code](./test/GatekeeperThree.ts)

We found three modifiers that define three gates that we need to pass:

Gate one:

```solidity
    require(msg.sender == owner);
    require(tx.origin != owner);
```

The `msg.sender` must be the owner but not the `tx.origin`. We solve this by using an attacker contract so that the `msg.sender` is the address of the contract and our EOA is the `tx.origin`.
Gate two:

```solidity
    require(allow_entrance == true);
```

For the second gate, we need to find out the password to convert the `allow_entrance` variable to `true`. We do this by calling the `createTrick` function. We have two options: we can use the transaction receipt to see the `block.timestamp`, or we can take advantage of what we know about how Solidity stores state variables and call `getStorageAt` at position 0x02. We then call `getAllowance` with the value we obtained from storage and we manage to set `allow_entrance` to `true`.

Gate Three

```solidity
    if (address(this).balance > 0.001 ether && payable(owner).send(0.001 ether) == false)
```

For this gate, you need to have a balance greater than 0.001 ETH. To achieve this, we transfer 0.0011 ETH to you. In the attacker contract, we add the `receive` function and put a `revert` so that the second part of the `require` results in false.
