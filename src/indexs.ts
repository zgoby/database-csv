import * as dayjs from "dayjs";
import { SortArr } from "./sortArr";

export class IndexsDocker {
  indexs: Indexs[] = []
  add(index) {
    this.indexs.push(index)
  }
  has(title) {
    return this.indexs.findIndex(item=>item.title===title) !== -1
  }
  initData(data, infos){
    for (let index = 0; index < this.indexs.length; index++) {
      const element = this.indexs[index];
      element.initData(data, infos)
    }
  }
}

export class Indexs{
  state = false;
  title;
  points: any;
  type: 'MONTH' | 'ENUM' | ''; // MONTH is a sepcial ENUM
  constructor({key, type}) {
    this.title = key;
    if(type==='MONTH') {
      this.type = 'MONTH'
      this.points = {}
      for (let index = 1; index <= 12; index++) {
        this.points[index] = new SortArr();
      }
    }else{
      this.points = new SortArr();
    }
    this.state = true;
  }
  
  initData(array, {titles, primaryKey}) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const titleIndex = titles.indexOf(this.title)
      const primaryKeyIndex = titles.indexOf(primaryKey)
      this.add({value: element[titleIndex], index: element[primaryKeyIndex]})
    }
  }
  add({value, index}){
    // index: 是主键
    if(this.type==='MONTH') {
      this.points[dayjs(value).month()+1].add({value, index})
    }else{
      this.points.add({value, index});
    }
  }
}

