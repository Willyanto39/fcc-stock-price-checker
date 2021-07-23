const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let likeCount;

suite('Functional Tests', () => {
  suite('Test GET /api/stock-prices', () => {
    test('Viewing One Stock', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          done();
        });
    });

    test('Viewing One Stock and Liking It', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({
          stock: 'AMZN',
          like: 'true'
        })
        .end((err, res) => {
          likeCount = res.body.stockData.likes;

          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'AMZN');
          done();
        });
    });

    test('Viewing the Same Stock and Liking It Again', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({
          stock: 'AMZN',
          like: 'true'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'AMZN');
          assert.equal(res.body.stockData.likes, likeCount);
          done();
        });
    });

    test('Viewing Two Stocks', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: ['AAPL', 'GOOG'] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock, 'AAPL');
          assert.equal(res.body.stockData[1].stock, 'GOOG');
          assert.exists(res.body.stockData[0].rel_likes);
          assert.exists(res.body.stockData[1].rel_likes);
          done();
        })
    });

    test('Viewing Two Stocks and Liking Them', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({
          stock: ['MSFT', 'AAPL'],
          like: 'true'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock, 'MSFT');
          assert.equal(res.body.stockData[1].stock, 'AAPL');
          assert.exists(res.body.stockData[0].rel_likes);
          assert.exists(res.body.stockData[1].rel_likes);
          done();
        });
    });
  });
});
