# Faucet Webpage

A simple webpage for Sepolia Testnet's faucet.

It's HW1 for 1112 NCNU CSIE "Principles and Practice of Blockchains"

link to Metamask and create a transaction to the smart contract to get SepoliaETH.

![](docs/Screenshot_20230226_025506.png)


## Project Setup

```sh
npm install
```

### fill in your smart contract's address

```sh
cp .env.example .env
vim .env
'''
VITE_BANK_ADDR = "YOUR BANK ADDRESS"
'''

```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Notice

Now, I am not sure of difference between `window.ethereum` & `web3`

I use `window.ethereum` to send transaction, check accounts, check network and use `web3` to encode ABI.

I am not sure whether it's a suitable implementation