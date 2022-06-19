// const papaparse = require('papaparse');
// const fs = require('fs');
import { DB } from './src/database';
import { Queryer } from './src/queryer';

// // console.log();

// papaparse.parse(fs.readFileSync('./src/bill.csv').toString(), {
//   complete: function (results) {
//     console.log('Finished:', results.data);
//   },
// });

const arr = [
  ['type', 'time', 'category', 'amount'],
  ['0', '1561910400000', '8s0p77c323', '5400'],
  ['0', '1561910400000', '0fnhbcle6hg', '1500'],
  ['0', '1563897600000', '3tqndrjqgrg', '3900'],
  ['0', '1564502400000', 'bsn20th0k2o', '1900'],
  ['0', '1564588800000', '8s0p77c323', '5400'],
  ['0', '1564588800000', '0fnhbcle6hg', '1500'],
  ['0', '1564588800000', '3tqndrjqgrg', '5000'],
  ['0', '1566316800000', 'bsn20th0k2o', '2000'],
  ['0', '1567267200000', '8s0p77c323', '5400'],
  ['0', '1567267200000', '0fnhbcle6hg', '1500'],
  ['0', '1569772800000', '1bcddudhmh', '3000'],
  ['0', '1569772800000', 'bsn20th0k2o', '1500'],
  ['0', '1569772800000', '3tqndrjqgrg', '5000'],
  ['0', '1569859200000', '0fnhbcle6hg', '1500'],
  ['0', '1572364800000', 'odrjk823mj8', '3000'],
  ['0', '1572451200000', '3tqndrjqgrg', '4600'],
  ['0', '1572451200000', '3tqndrjqgrg', '3800'],
  ['0', '1572537600000', '0fnhbcle6hg', '1500'],
  ['0', '1574179200000', 'odrjk823mj8', '2000'],
  ['0', '1574870400000', '1bcddudhmh', '3000'],
  ['0', '1574956800000', '8s0p77c323', '5400'],
  ['0', '1575043200000', '3tqndrjqgrg', '5000'],
  ['0', '1575129600000', '0fnhbcle6hg', '1500'],
  ['0', '1577289600000', '3tqndrjqgrg', '4000'],
  ['0', '1577345333184', 'odrjk823mj8', '2000'],
  ['0', '1577345367638', '1bcddudhmh', '3000'],
  ['0', '1577345378418', 'j1h1nohhmmo', '800'],
  ['0', '1577345504140', 'bsn20th0k2o', '1000'],
  ['0', '1577345517217', 'hc5g66kviq', '2000'],
  ['0', '1577345576917', '8s0p77c323', '5400'],
  ['0', '1577345590283', '1bcddudhmh', '3000'],
  ['0', '1577345789527', '3tqndrjqgrg', '3900'],
  ['0', '1577548800000', '8s0p77c323', '5400'],
  ['1', '1561910400000', 's73ijpispio', '30000'],
  ['1', '1564502400000', '5il79e11628', '1000'],
  ['1', '1567094400000', '1vjj47vpd28', '-3000'],
  ['1', '1567180800000', 's73ijpispio', '28000'],
  ['1', '1569772800000', 's73ijpispio', '28000'],
  ['1', '1569772800000', '1vjj47vpd28', '2000'],
  ['1', '1572451200000', 's73ijpispio', '20000'],
  ['1', '1577345267529', 's73ijpispio', '30000'],
  ['1', '1577345303191', '1vjj47vpd28', '-10000'],
  ['1', '1577345317187', '5il79e11628', '1000'],
  ['1', '1577345463930', 's73ijpispio', '3000'],
  ['1', '1577345477581', '5il79e11628', '2000'],
  ['1', '1577345638784', '1vjj47vpd28', '2000'],
];

const cate = [
  ['id', 'type', 'name'],
  ['1bcddudhmh', '0', '车贷'],
  ['hc5g66kviq', '0', '车辆保养'],
  ['8s0p77c323', '0', '房贷'],
  ['0fnhbcle6hg', '0', '房屋租赁'],
  ['odrjk823mj8', '0', '家庭用品'],
  ['bsn20th0k2o', '0', '交通'],
  ['j1h1nohhmmo', '0', '旅游'],
  ['3tqndrjqgrg', '0', '日常饮食'],
  ['s73ijpispio', '1', '工资'],
  ['1vjj47vpd28', '1', '股票投资'],
  ['5il79e11628', '1', '基金投资'],
];

interface IIndexs {
  key: string;
  type?: 'MONTH' | '';
}

const titles = arr.shift();

DB.new('bill', titles, 'id', [{ key: 'time', type: 'MONTH' }]);
DB.initData('bill', arr);
// 0,1,2,3,4,5,6
const queryer = new Queryer(DB);
queryer
  .insert({ type: '0', time: '1574870400000', category: '5il79e11628', amount: '1500000' })
  .excute('bill');
// queryer.where({ id: 3 }).del().excute('bill');
queryer
  .update({ type: '1', time: '1564502400000', category: '5il79e11628', amount: '1500' })
  .where({ time: '1575129600000' })
  .excute('bill');

console.log(queryer.select('time').where({ time: '$MONTH_3' }).excute('bill'));
