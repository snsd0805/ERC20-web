<script>
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3';
import bankABI from '@/assets/bank_abi.json';

export default {
  name: 'ManageView',
  data() {
    return {
			msg: "",
			linked: false,
			account: "",
			owner: "",
      atms: [],
      atmsBalance: [],
      bankAddr: "",
      bankBalance: -1,
			show: false,
			amount: 1
    }
  },
	async mounted() {
    var web3 = new Web3(window.ethereum);
    this.bankAddr = import.meta.env.VITE_BANK_ADDR;
    var bank = new web3.eth.Contract(bankABI, this.bankAddr);
		var owner = await bank.methods.owner().call();
		this.owner = owner.toLowerCase();
    var atms = await bank.methods.getATMs().call();
		this.atms = atms;
    if(ethereum.isConnected()){
      this.linked = true;
			this.detectMetamask();
    }

    

		this.update();

	},
  methods: {
    update() {
      var web3 = new Web3(window.ethereum);

      var contin = true;

      web3.eth.getBalance(this.bankAddr, (err, result) => {
        if(web3.utils.fromWei(result) != this.bankBalance)
          contin = false;
        this.bankBalance = web3.utils.fromWei(result);
      })
      for(let i=0; i<this.atms.length; i++){
        web3.eth.getBalance(this.atms[i], (err, result) => {
          if(web3.utils.fromWei(result) != this.atmsBalance[i])
            contin = false;
          this.atmsBalance[i] = web3.utils.fromWei(result);
        })
      }
    },

    async detectMetamask() {
      this.msg = "Detecting..."
      const provider = await detectEthereumProvider()
      if (provider) {
        this.msg = "Detect Metamask. "
        const chainId = await ethereum.request({method: 'eth_chainId'})
        if(chainId == 1337){
          const account = await ethereum.request({ method: 'eth_requestAccounts' });
					this.account = account[0];
          this.msg += "> Network which you connected is Sepolia.";
          this.linked = true
        }else{
          this.msg += "> But the network which you connected isn't Sepolia, this faucet only accept Sepolia address"
        }
      } else {
        this.msg = "ERROR: no Metamask"
      }
    },
		async destroyBank() {
			var web3 = new Web3(window.ethereum);
			const encodeFunctionCall = web3.eth.abi.encodeFunctionCall({
        name: "destroy",
        type: "function",
        inputs: []
      }, []);
			console.log(encodeFunctionCall);
			const transactionParameters = {
        from: ethereum.selectedAddress,
        to: this.bankAddr,               // smart contract's address
        data: encodeFunctionCall,
        value: '0x00',
      };
			const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
			console.log(txHash);
		},
		async destroyATM(index){
			console.log(index)
			var web3 = new Web3(window.ethereum);
			const encodeFunctionCall = web3.eth.abi.encodeFunctionCall({
        name: "destroy",
        type: "function",
        inputs: []
      }, []);
			const transactionParameters = {
        from: ethereum.selectedAddress,
        to: this.atms[index],               // smart contract's address
        data: encodeFunctionCall,
        value: '0x00',
      };
			const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
		},
		async transfer() {
			var eth = this.amount.toString();
			
			var web3 = new Web3(window.ethereum);
			var wei = web3.utils.toWei(eth, 'ether');
			const transactionParameters = {
        from: ethereum.selectedAddress,
        to: this.bankAddr,               // smart contract's address
        value: '0x'+BigInt(wei).toString(16),
      };
			const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
		},
		showModel() {
			if(this.show == false){
				this.show = true;
			}else{
				this.transfer();
				this.show = false;
			}
		}
  },
}
</script>



<template>
  <section class="page-section portfolio" id="portfolio">
      <div class="container">
          <!-- Portfolio Section Heading-->
          <h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Management</h2>
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
                      <div class="col-sm-5">
												Your address: {{ this.account }}
												Bank Owner: {{ this.owner }}
												<template v-if="this.account == this.owner">
													<p style="color: blue">You are owner</p>
												</template>
												<template v-else>
													<p style="color: red">You are not owner</p>

												</template>

                      </div>
                    </div>
                  </div>                    
                </div>
              </template>
          </div>

          <br><br>
          <hr>
          <br><br>

					<template v-if='linked && this.account == this.owner'>
						<div class="row justify-content-center">
							<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">Bank</h2>
							<table class="table table-bordered">
								<thead>
									<tr>
										<th scope="col">Address</th>
										<th scope="col">Balance</th>
										<th scope="col">Destroy</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{{ bankAddr }}</td>
										<td>{{ bankBalance }} ETH</td>
										<td><button class="btn btn-danger" v-on:click="destroyBank">Destroy</button>
													<input type="number" v-if="show" v-model="amount" placeholder="ETH">
													<button class="btn btn-primary" v-on:click="showModel">Transfer</button></td>
									</tr>
								</tbody>
							</table>
						</div>

						<br><br>
						<br><br>

						<div class="row justify-content-center">
							<h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">ATM List</h2>
							<table class="table table-bordered">
								<thead>
									<tr>
										<th scope="col">Address</th>
										<th scope="col">Balance</th>
										<th scope="col">Destroy</th>
									</tr>
								</thead>
								<tbody>
									<template v-for="i in atms.length">
										<tr>
											<td>{{ atms[i-1] }}</td>
											<td>{{ atmsBalance[i-1] }} ETH</td>
											<td><button class="btn btn-danger" v-on:click="destroyATM(i-1)">Destroy</button></td>
										</tr>
									</template>
								</tbody>
							</table>
						</div>
						<br><button class='btn btn-info' v-on:click='update'>Update</button>
					</template>


      </div>
  </section>
</template>