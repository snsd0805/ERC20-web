<script>
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';
import tokenABI from '@/assets/wtjtoken.json';

export default {
	name: 'MyComponent',
	data() {
		return {
			msg: '',
			linked: false,
			amount: "0",
			contract_address: "",
			token: null,
			token_name: "",
			token_symbol: "",
			token_balance: "0",
			token_decimal: "1",
			address: "",
		}
	},
	async mounted() {
		var web3 = new Web3(window.ethereum);
		// this.bankAddr = import.meta.env.VITE_BANK_ADDR;
		if(ethereum.isConnected()){
			this.linked = true;
			this.detectMetamask();
			this.update();
		}
		
	},
	methods: {
		update() {
			var web3 = new Web3(window.ethereum);
			var contin = true;
			this.get_info()
			console.log("update");
		},

		async detectMetamask() {
			this.msg = "Detecting..."
			const provider = await detectEthereumProvider()
			if (provider) {
				this.msg = "Detect Metamask."
				const chainId = await ethereum.request({method: 'eth_chainId'})
				if(chainId == 1337){								// Sepolia 1337
					const account = await ethereum.request({ method: 'eth_requestAccounts' });
					this.msg += "> Network which you connected is Sepolia. @ " + account[0]
					this.linked = true
				}else{
					this.msg += "> But the network which you connected isn't Sepolia, this faucet only accept Sepolia address"
				}
			} else {
				this.msg = "ERROR: no Metamask"
			}
		},

		async get_info() {
			const web3 = new Web3(window.ethereum);
			console.log(this.contract_address);
			
			try{
				this.token = new web3.eth.Contract(tokenABI, this.contract_address);
				this.token_name = await this.token.methods.name().call();
				this.token_symbol = await this.token.methods.symbol().call();

				const account = await ethereum.request({ method: 'eth_requestAccounts' });
				this.token_balance = await this.token.methods.balanceOf(account[0]).call();

				let decimal = await this.token.methods.decimals().call();
				this.token_decimal = decimal
				// this.decimal = Math.pow(10, decimal);
				console.log(this.token_decimal);
			}catch(error){
				this.token_name = "ERROR";
				this.token_symbol = "ERROR"; 
			}
		},

		async transfer() {
			const web3 = new Web3()
			const encodeFunctionCall = web3.eth.abi.encodeFunctionCall({
				name: "transfer",
				type: "function",
				inputs: [{
					type: "address",
					name: "to"
				},
				{
					type: "uint256",
					name: "amount"
				}]
			}, [this.address, web3.utils.toBN(this.amount * Math.pow(10, this.token_decimal))])
			console.log(this.token.options.address)
			const transactionParameters = {
				from: ethereum.selectedAddress,
				to: this.token.options.address,               // smart contract's address
				data: encodeFunctionCall,
				value: '0x00',
			}
			console.log(encodeFunctionCall)
			console.log(transactionParameters)

			const txHash = await ethereum.request({
				method: 'eth_sendTransaction',
				params: [transactionParameters]
			})

			console.log(txHash)

		},

	}
}
</script>


	<template>
	<section class="page-section portfolio" id="portfolio">
		<div class="container">
			<!-- Portfolio Section Heading-->
			<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">ERC20 LINK</h2>
			<!-- Icon Divider-->
			<div class="divider-custom">
				<div class="divider-custom-line"></div>
				<div class="divider-custom-icon"><i class="fa-brands fa-ethereum"></i></div>
				<div class="divider-custom-line"></div>
			</div>

			<!-- Portfolio Grid Items-->
			<div class="row justify-content-center">
				<p>{{ msg }}</p>
				<template v-if='!linked'>
					<button class='btn btn-info' v-on:click="detectMetamask"> link to Metamask </button>
				</template>
				<template v-else>
					<div>
						<div class="container">
							<div class="row">
								<div class="col-sm-8">
									<input type='text' class="form-control" v-model="contract_address" placeholder="Token's Contract Address">
								</div>
								<div class="col-sm-4">
									<button class='btn btn-info' v-on:click="get_info"> GET </button>
								</div>
							</div>
						</div>
					</div>
					<div>
						<div class="container">
							<div class="row">
								<p>Token Name: {{token_name}}({{token_symbol}})	</p>
							</div>
						</div>
					</div>
				</template>
			</div>

			<template v-if='token_name!="" && token_name!="ERROR"'>
				<br><br>
				<hr>
				<br><br>

				<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">{{token_name}}({{token_symbol}})</h2>
				<div class="divider-custom">
					<div class="divider-custom-line"></div>
					<div class="divider-custom-icon"><i class="fa-brands fa-ethereum"></i></div>
					<div class="divider-custom-line"></div>
				</div>

				<h3>Transfer</h3>
				You have {{token_balance/Math.pow(10, token_decimal)}} {{token_symbol}} (<a href="#" v-on:click="update">Refresh</a>)
				<br><br>
				<div>
					<div class="container">
						<div class="row">
							<div class="col-sm-8">
								<input type='text' class="form-control" v-model="address" placeholder="Receiver's address">
							</div>
							<div class="col-sm-8">
								<input type='number' class="form-control" v-model="amount" v-bind:placeholder="'Amount (float). Decimals: '+token_decimal">
							</div>
							<div class="col-sm-4">
								<button class='btn btn-info' v-on:click="transfer"> Transfer {{amount}} {{token_symbol}}  ({{amount * Math.pow(10, token_decimal)}}單位)</button>
							</div>
						</div>
					</div>
				</div>

			</template>

		</div>
	</section>
</template>