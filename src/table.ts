import { Primary } from "./primary";
import { IndexsDocker, Indexs } from "./indexs";

export class Table {
  tableName: string;
  primarys: Primary;
  indexsDocker: IndexsDocker;
  titles=[]
  values=[]
  emptys=[]
  init=false

  constructor(tableName, titles, primary, indexs) {
    this.tableName = tableName
    this.setTitles(titles);
    this.setPrimary(primary);
    if(indexs){
      this.indexsDocker = new IndexsDocker()
      this.setIndexs(indexs)
    }
  }

  // 设置表头
  setTitles(titles: string[]) {
    this.titles = titles
  }
  // 设置主键
  setPrimary(primary) {
    const primaryIndex = this.titles.indexOf(primary)
    if(primaryIndex<0) {
      throw new Error(`primary key not exist: ${primary.key}`)
    }else{
      this.primarys = new Primary(primary, primaryIndex)
    }
  }
  // 设置index
  setIndexs(indexs) {
    for (let i = 0; i < indexs.length; i++) {
      const element = indexs[i];
      const primaryIndex = this.titles.indexOf(element.key)
      if(primaryIndex<0) {
        throw new Error(`primary key not exist: ${element.key}`)
      }else{
        this.indexsDocker.add(new Indexs(element))
      }
    }
  }
  // 设置索引
  initData(array) {
    if(!this.init){
      this.addMany(array)
      this.init=true
    }
    return this;
  }
  
  addMany(array) {
    this.values = [...array];
    this.indexsDocker?.initData(this.values, {titles: this.titles, primaryKey: this.primarys.key});
    
  }
  add(element) {
    if(this.emptys.length){
      this.values[this.emptys[0]] = element
      this.primarys.add({value: element, index: this.emptys[0]})
    }else{
      this.values.push(element)
      this.primarys.add({value: element, index: this.values.length-1})
    }
  }
}
