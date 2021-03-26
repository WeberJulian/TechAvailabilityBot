const request = require('request');
const jsdom = require("jsdom");

module.exports = {

    getName: () => 'smi-distri',
  
    getAvailability: () => new Promise( (resolve, reject) => 
        request('https://www.smidistri.com/recherche?orderby=position&orderway=desc&search_query=3090&submit_search=Rechercher', (err, res, body) => {
            if (err) { reject(err); }
            let dom = new jsdom.JSDOM(body);
            let prices = dom.window.document.getElementsByClassName('price');
            let names = dom.window.document.getElementsByClassName('product_img_link');
            let stocks = dom.window.document.getElementsByClassName('stocks');
            let cards = [];
            for (let i=0; i<prices.length; i++){
                cards.push({
                    card: names.item(i).title, 
                    status: stocks.item(i).firstChild.firstChild.textContent, 
                    price: prices.item(i).innerHTML.replace(/ /g, ''), 
                    link: names.item(i).href
                });
            }
            resolve(cards);
        })
    ),
  
    startWatching: async (updateState) => {
      const source = module.exports.getName();
      while (true) {
        let changes = await module.exports.getAvailability();
        changes.forEach(element => {
          let {card, status, price, link} = element;
          const id = card + source;
          updateState(source, id, card, status, price, link);
        });
        await new Promise(resolve => setTimeout(resolve, 20000));
      }
    }
  
  }