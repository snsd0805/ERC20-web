<script>
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';
import tokenABI from '@/assets/wtjtoken.json';

export default {
	name: 'MyComponent',
	data() {
		return {
			account: "",
			msg: '',
			linked: false,
			contract_address: "",
			token: null,
			token_name: "",
			token_symbol: "",
			token_balance: "0",
			token_decimal: "1",

			transfer_address: "",
			transfer_amount: "",
			approve_address: "",
			approve_amount: "",
			approve_logs: {},

			transfer_from_owner_addresss: "",
			transfer_from_receiver_addresss: "",
			transfer_from_amount: "",
			transfer_from_logs: {},
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
				if(chainId == 11155111){								// Sepolia 1337
					const account = await ethereum.request({ method: 'eth_requestAccounts' });
					this.account = account[0];
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

				this.token_balance = await this.token.methods.balanceOf(this.account).call();

				let decimal = await this.token.methods.decimals().call();
				this.token_decimal = decimal
				// this.decimal = Math.pow(10, decimal);
				console.log(this.token_decimal);
			}catch(error){
				this.token_name = "ERROR";
				this.token_symbol = "ERROR"; 
			}


			// get approve events
			try{
				let events = await this.token.getPastEvents("Approval", {fromBlock: 0, toBlock: 'latest', filter: {owner: this.account}})
				this.approve_logs = {};
				for(let event of events){
					this.approve_logs[event['returnValues']['spender']] = {
						'owner': event['returnValues']['owner'],
						'value': event['returnValues']['value'],
					}
				}
				for(let event in this.approve_logs){
					let remain = await this.token.methods.allowance(this.account, event).call();
					this.approve_logs[event]['remain'] = remain;
					console.log(this.approve_logs[event])
				}
			}catch(error){
				this.approve_logs = {};
			}

			// get approve events
			try{
				let events = await this.token.getPastEvents("Approval", {fromBlock: 0, toBlock: 'latest', filter: {spender: this.account}})
				this.transfer_from_logs = {};
				for(let event of events){
					this.transfer_from_logs[event['returnValues']['owner']] = {
						'owner': event['returnValues']['owner'],
						'value': event['returnValues']['value'],
					}
				}
				for(let event in this.transfer_from_logs){
					let remain = await this.token.methods.allowance(event, this.account).call();
					this.transfer_from_logs[event]['remain'] = remain;
				}
			}catch(error){
				this.transfer_from_logs = {};
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
			}, [this.transfer_address, web3.utils.toBN(this.transfer_amount)])
			console.log(this.token.options.address)
			const transactionParameters = {
				from: ethereum.selectedAddress,
				to: this.token.options.address,               // smart contract's address
				data: encodeFunctionCall,
				value: '0x00',
			}

			const txHash = await ethereum.request({
				method: 'eth_sendTransaction',
				params: [transactionParameters]
			})

			this.transfer_amount = "";
			this.transfer_address = "";
		},


		async approve() {
			const web3 = new Web3()
			const encodeFunctionCall = web3.eth.abi.encodeFunctionCall({
				name: "approve",
				type: "function",
				inputs: [{
					type: "address",
					name: "spender"
				},
				{
					type: "uint256",
					name: "amount"
				}]
			}, [this.approve_address, web3.utils.toBN(this.approve_amount)])
			console.log(this.token.options.address)
			const transactionParameters = {
				from: ethereum.selectedAddress,
				to: this.token.options.address,               // smart contract's address
				data: encodeFunctionCall,
				value: '0x00',
			}

			const txHash = await ethereum.request({
				method: 'eth_sendTransaction',
				params: [transactionParameters]
			})

			this.approve_amount = "";
			this.approve_address = "";
		},


		async transferFrom() {
			const web3 = new Web3()
			const encodeFunctionCall = web3.eth.abi.encodeFunctionCall({
				name: "transferFrom",
				type: "function",
				inputs: [{
					type: "address",
					name: "from"
				},
				{
					type: "address",
					name: "to"
				},
				{
					type: "uint256",
					name: "amount"
				}]
			}, [this.transfer_from_owner_addresss, this.transfer_from_receiver_addresss, web3.utils.toBN(this.transfer_from_amount)])
			const transactionParameters = {
				from: ethereum.selectedAddress,
				to: this.token.options.address,               // smart contract's address
				data: encodeFunctionCall,
				value: '0x00',
			}

			const txHash = await ethereum.request({
				method: 'eth_sendTransaction',
				params: [transactionParameters]
			})

			this.transfer_from_amount = "";
			this.transfer_from_owner_addresss = "";
			this.transfer_from_receiver_addresss = "";
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
							<div class="col-sm-10">
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Receiver</label>
									<div class="col-sm-10">
										<input type='text' class="form-control" v-model="transfer_address" placeholder="Receiver's address">
									</div>
								</div>
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Value</label>
									<div class="col-sm-10">
										<input type='number' class="form-control" v-model="transfer_amount" v-bind:placeholder="'(int) 個單位. Decimals: '+token_decimal">
									</div>
								</div>
							</div>
							<div class="col-sm-2">
								<br><br>
								<button class='btn btn-info' v-on:click="transfer"> Transfer {{transfer_amount}} 單位 ({{transfer_amount / Math.pow(10, token_decimal)}} {{token_symbol}})</button>
							</div>

						</div>
					</div>
				</div>

				<br><br>
				<br><br>

				<h3>Approve</h3>
				You have {{token_balance/Math.pow(10, token_decimal)}} {{token_symbol}} (<a href="#" v-on:click="update">Refresh</a>)
				<br><br>
				<div>
					<div class="container">
						<div class="row">
							<div class="col-sm-10">
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Owner</label>
									<div class="col-sm-10">
										<input type='text' class="form-control" v-model="approve_address" placeholder="Spender's address">
									</div>
								</div>
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Value</label>
									<div class="col-sm-10">
										<input type='number' class="form-control" v-model="approve_amount" v-bind:placeholder="'(int) 個單位. Decimals: '+token_decimal">
									</div>
								</div>
							</div>
							<div class="col-sm-2">
								<br><br>
								<button class='btn btn-info' v-on:click="approve"> Approve {{approve_amount}} 單位 ({{approve_amount / Math.pow(10, token_decimal)}} {{token_symbol}})</button>
							</div>
						</div>
					</div>
				</div>
				<br>
				<table class="table table-hover">
				<thead>
					<tr>
					<th scope="col">Spender</th>
					<th scope="col">Value</th>
					<th scope="col">{{token_symbol}} Token</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(event, index) of approve_logs">
						<tr>
							<th scope="row">{{index}}</th>
							<td>{{event['value']}} 單位</td>
							<td>{{event['value'] / Math.pow(10, token_decimal)}} {{token_symbol}} </td>
						</tr>
					</template>
				</tbody>
				</table>

				<br><br>
				<br><br>

				<h3>TransferFrom</h3>
				You have {{token_balance/Math.pow(10, token_decimal)}} {{token_symbol}} (<a href="#" v-on:click="update">Refresh</a>)
				<br><br>
				<div>
					<div class="container">
						<div class="row">
							<div class="col-sm-10">
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Owner</label>
									<div class="col-sm-10">
										<input type='text' class="form-control" v-model="transfer_from_owner_addresss" placeholder="Owner's address">
									</div>
								</div>
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Receiver</label>
									<div class="col-sm-10">
										<input type='text' class="form-control" v-model="transfer_from_receiver_addresss" placeholder="Receiver's address">
									</div>
								</div>
								<div class="form-group row">
									<label for="inputPassword" class="col-sm-2 col-form-label">Value</label>
									<div class="col-sm-10">
										<input type='number' class="form-control" v-model="transfer_from_amount" v-bind:placeholder="'(int) 個單位. Decimals: '+token_decimal">
									</div>
								</div>
							</div>
							<div class="col-sm-2">
								<br><br>
								<button class='btn btn-info' v-on:click="transferFrom"> Transfer {{transfer_from_amount}} 單位 ({{transfer_from_amount / Math.pow(10, token_decimal)}} {{token_symbol}}) (From Owner)</button>
							</div>
						</div>
					</div>
				</div>
				<br>
				<table class="table table-hover">
				<thead>
					<tr>
					<th scope="col">Owner</th>
					<th scope="col">Value</th>
					<th scope="col">{{token_symbol}} Token</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(event, index) of transfer_from_logs">
						<tr>
							<th scope="row">{{index}}</th>
							<td>{{event['value']}} 單位</td>
							<td>{{event['value'] / Math.pow(10, token_decimal)}} {{token_symbol}} </td>
						</tr>
					</template>
				</tbody>
				</table>


			</template>

		</div>
	</section>
</template>