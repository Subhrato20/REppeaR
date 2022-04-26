const hash = require('object-hash');

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+"  "+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
const h = [];
h[0]= null;
for (let i = 1; i < 1000; i++) {
  h[i]=  makeid(41);
}

class blockChain{
  constructor(){
    this.chain = [];
    this.curr_transaction = [];
  }
  addNewBlock(buyer,seller){
    let block = {
      index: this.chain.length +1,
      timestamp: date,
      hash: h[this.chain.length +1],
      prevHash: h[this.chain.length],
      buyer:buyer,
      seller:seller,
    };

    /*addedhash(currhash){
      var hsh = "NULL";
      if(this.chain.length==0){
        hsh="NULL"
      }else{
        hsh=currhash;
      }
    };*/
    //put hash
    this.hash = hash(block);

    //Add to BlockChain
    this.chain.push(block);
    this.curr_transaction=[];
    return block;
  }
  addNewTransaction(sender){
    this.curr_transaction.push({sender});
    this.buyer = sender;
  }
  lastBlock(){
    return this.chain.slice(-1)[0];
  }
  isEmpty(){
    return this.chain.length ==0;
  }


}

module.exports = blockChain
