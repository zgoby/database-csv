import { SortArr } from "./sortArr";

export class Primary {
  state=false
  key='';
  keyIndex;
  points: SortArr;
  constructor(key, primaryIndex) {
    this.key = key;
    this.keyIndex = primaryIndex;
    this.points = new SortArr()
    this.state = true;
  }
  initData(originData) {
    for (let index = 0; index < originData.length; index++) {
      const element = originData[index];
      this.add({value: element[this.keyIndex], index})
    }
  }
  add(element){
    this.points.add(element);
  }
  remove(value) {
    this.points.remove(value);
  }
  query(value) {
    return this.points.query(value)
  }
}
