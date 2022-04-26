const hash = require('object-hash');
const SHA256 = require('crypto-js/sha256')


/*function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}*/

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+"  "+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

class block{
  constructor(index,timestamp,data,prevHash=''){
    this.index = index;
    this.timestamp=timestamp;
    this.data=data;
    this.prevHash=prevHash;
    this.hash=this.calculateHash();
  }
  calculateHash(){
    return SHA256(this.index + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class blockChain{
  constructor(){
    this.chain = [];
  }
  createGenesisBlock(){
    return new Block(0,"01/01/2022","Genesis Block","NULL");
  }
  getLatestBlock(){
    return this.chain(this.chain.length-1);
  }

  addNewBlock(newBlock){
    newBlock.prevHash = this.getLatestBlock().ha
    this.hash = hash(block);

    //Add to BlockChain
    this.chain.push(block);
    this.curr_transaction=[];
    return block;
  }
  addNewTransaction(sender){
    this.curr_transaction.push({sender});
  }
  lastBlock(){
    return this.chain.slice(-1)[0];
  }
  isEmpty(){
    return this.chain.length ==0;
  }


}

module.exports = blockChain
