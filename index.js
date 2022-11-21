import axios from 'axios';
import { WebSocketServer } from 'ws';

const port = 6789;
const wss = new WebSocketServer({ port: port });
let socket = null;

let token = ''
let userAgent = ''
let cookie = ''

wss.on('listening', () => {
  console.log('start listening on port: ' + port)
})

wss.on('connection', function connection(ws) {
  socket = ws;
  ws.on('message', function incoming(message) {
    const json = JSON.parse(message);
    
    if (json) {
      if (json.type === 'init') {
        userAgent = json.payload?.userAgent
      }
      if (json.type === 'login') {
        token = json.payload?.token
        cookie = json.payload?.cookie

        Login()
      }
      if (json.type === 'get_currency') {
        token = json.payload?.token
        cookie = json.payload?.cookie
        userAgent = json.payload?.userAgent

        GetCurrencyRate()
      }
    }
  });
});

const url = 'https://stake.kim/_api/graphql';

const Login = () => {
  axios({
    method: 'post',
    url: url,
    data: JSON.stringify({
      query:
        'query UserMeta($name: String, $signupCode: Boolean = false) {\n  user(name: $name) {\n    id\n    name\n    isMuted\n    isRainproof\n    isBanned\n    createdAt\n    campaignSet\n    selfExclude {\n      id\n      status\n      active\n      createdAt\n      expireAt\n    }\n    signupCode @include(if: $signupCode) {\n      id\n      code {\n        id\n        code\n      }\n    }\n  }\n}\n',
      variables: {},
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'x-access-token': token,
      'Cookie': cookie,
      'User-Agent': userAgent
    }
  }).then(function (res) {
    console.log(res.data)
    socket.send(JSON.stringify(res.data))
  }).catch(function (err) {
    console.log(err)
    socket.send(JSON.stringify({
      error: 'Login Failed'
    }))
  });
};

const GetCurrencyRate = () => {
  axios({
    method: 'post',
    url: url,
    data: JSON.stringify({
      "query":"query CurrencyConversionRate {\n  info {\n    currencies {\n      name\n      eur: value(fiatCurrency: eur)\n      jpy: value(fiatCurrency: jpy)\n      usd: value(fiatCurrency: usd)\n      brl: value(fiatCurrency: brl)\n      cad: value(fiatCurrency: cad)\n      cny: value(fiatCurrency: cny)\n      idr: value(fiatCurrency: idr)\n      inr: value(fiatCurrency: inr)\n      krw: value(fiatCurrency: krw)\n      php: value(fiatCurrency: php)\n      rub: value(fiatCurrency: rub)\n      mxn: value(fiatCurrency: mxn)\n      dkk: value(fiatCurrency: dkk)\n    }\n  }\n}\n",
      "variables":{}
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'x-access-token': token,
      'Cookie': cookie,
      'User-Agent': userAgent
    }
  }).then(function (res) {
    console.log(res.data)
    socket.send(JSON.stringify(res.data))
  }).catch(function (err) {
    console.log(err)
    socket.send(JSON.stringify({
      error: 'Get currency failed'
    }))
  });
}