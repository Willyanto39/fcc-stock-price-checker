'use strict';

const axios = require('axios');

const Stock = require('../models/stock');

const getStockInformation = async (stock) => {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const { data } = await axios.get(url);

  return {
    stock: data.symbol,
    price: data.latestPrice
  };
};

const getOrCreateStockData = async (symbol) => {
  const stockData = await Stock.findOne({ symbol });

  if (!stockData) {
    return await Stock.create({ symbol });
  }

  return stockData;
};

const addLike = async (stockData, ip) => {
  const likes = stockData.likes;

  if (!likes.includes(ip)) {
    likes.push(ip);

    await stockData.save();
  }
};

module.exports = (app) => {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query;
      const ip = req.ip;

      try {
        if (Array.isArray(stock)) {
          const stockInformation1 = await getStockInformation(stock[0]);
          const stockInformation2 = await getStockInformation(stock[1]);

          const stockData1 = await getOrCreateStockData(stockInformation1.stock);
          const stockData2 = await getOrCreateStockData(stockInformation2.stock);

          if (like) {
            await addLike(stockData1, ip);
            await addLike(stockData2, ip);
          }

          const stockData1LikeCount = stockData1.likes.length;
          const stockData2LikeCount = stockData2.likes.length;

          return res.json({ stockData: [
            {
              stock: stockInformation1.stock,
              price: stockInformation1.price,
              rel_likes: stockData1LikeCount - stockData2LikeCount
            },
            {
              stock: stockInformation2.stock,
              price: stockInformation2.price,
              rel_likes: stockData2LikeCount - stockData1LikeCount
            }
          ]});
        } else {
          const stockInformation = await getStockInformation(stock);
          const stockData = await getOrCreateStockData(stockInformation.stock);

          if (like) {
            await addLike(stockData, ip);
          }

          return res.json({
            stockData: {
              stock: stockInformation.stock,
              price: stockInformation.price,
              likes: stockData.likes.length
            }
          });
        }
      } catch(err) {
        res.send(err.message);
      }
    });
};
