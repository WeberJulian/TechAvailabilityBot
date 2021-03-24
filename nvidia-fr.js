const request = require('request');

module.exports = {

  getName: () => 'nvidia-fr',

  getLink: () => 'https://shop.nvidia.com/fr-fr/geforce/store/?page=1&limit=9&locale=fr-fr',

  getAvailability: () => new Promise( (resolve, reject) => 
    request('https://api.nvidia.partners/edge/product/search?page=1&limit=9&locale=fr-fr', { json: true }, (err, res, body) => {
      if (err) { reject(err); }
      let cards = [body.searchedProducts.featuredProduct, ...body.searchedProducts.productDetails];
      cards = cards.filter(card => card.manufacturer == 'NVIDIA')
      cards = cards.map((card) => ({card: card.displayName, status: card.prdStatus, price: card.productPrice}))
      resolve(cards);
    })
  ),

  startWatching: async (updateState) => {
    const source = module.exports.getName();
    const link = module.exports.getLink();
    while (true) {
      let changes = await module.exports.getAvailability();
      changes.forEach(element => {
        let {card, status, price} = element;
        const id = card + source;
        updateState(source, id, card, status, price, link);
      });
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

}
