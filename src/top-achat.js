const request = require("request");
const jsdom = require("jsdom");

module.exports = {
  getName: () => "top-achat",

  getLink: () => 'https://www.topachat.com',

  getAvailability: () =>
    new Promise((resolve, reject) =>
      request(
        "https://www.topachat.com/pages/produits_cat_est_micro_puis_rubrique_est_wgfx_pcie_puis_ordre_est_P_puis_sens_est_ASC_puis_mc_est_3090.html",
        (err, res, body) => {
          if (err) {reject(err);}
          let dom = new jsdom.JSDOM(body);
          let prices = dom.window.document.getElementsByClassName("prod_px_euro v16");
          let status = dom.window.document.getElementsByClassName("grille-produit");
          let names = dom.window.document.getElementsByClassName("libelle");

          let cards = [];
          for (let i = 0; i < prices.length; i++) {
            cards.push({
              card: names.item(i).firstElementChild.firstElementChild.textContent,
              status: status.item(i).firstElementChild.className == "bandeau-anico"
                  ? status.item(i).children.item(1).className
                  : status.item(i).firstElementChild.className,
              price: prices.item(i).textContent,
              link: names.item(i).firstElementChild.href,
            });
          }
          resolve(cards);
        }
      )
    ),

  startWatching: async (updateState) => {
    const source = module.exports.getName();
    const prefix = module.exports.getLink();
    while (true) {
      let changes = await module.exports.getAvailability();
      changes.forEach((element) => {
        let { card, status, price, link } = element;
        const id = card + source;
        updateState(source, id, card, status, price, prefix + link);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000*60*20)); // Check every 20 minutes
    }
  },
};
