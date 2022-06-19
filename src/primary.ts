import { SortArr } from './sortArr';

export class Primary {
  state = false;
  key = '';
  keyIndex;
  keys = new Map();
  points: SortArr;
  constructor(key, primaryIndex) {
    this.key = key;
    this.keyIndex = primaryIndex;
    this.points = new SortArr();
    this.state = true;
  }
  isPrimary(key) {
    return key === this.key;
  }
  getPrimary(element) {
    return element[this.keyIndex];
  }
  initData(originData) {
    for (let index = 0; index < originData.length; index++) {
      const element = originData[index];
      this.add({ value: this.getPrimary(element), index });
    }
  }
  add(element) {
    if (this.keys.has(element.value)) {
      throw new Error('Duplicate primary key');
    } else {
      this.keys.set(element.value, true);
    }
    this.points.add(element);
  }
  delete(element) {
    this.points.delete(element[this.key]);
  }
  query(value) {
    return this.points.query(value);
  }
  queryByMany(arr) {
    const newArr = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      const primaryItem = this.points.findOne(element);
      if (primaryItem) newArr.push(primaryItem);
    }
    return newArr;
  }
  queryIndexByMany(arr) {
    const newArr = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      newArr.push(...this.points.findAll(element));
    }
    return newArr;
  }
}
