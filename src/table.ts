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
    const newElement = []
    for (let index = 0; index < this.titles.length; index++) {
      const item = this.titles[index];
      newElement.push(element[item])
    }

    if(this.emptys.length){
      this.values[this.emptys[0]] = newElement
      this.primarys.add({value: element[this.primarys.key], index: this.emptys[0]})
    }else{
      this.values.push(newElement)
      this.primarys.add({value: element[this.primarys.key], index: this.values.length-1})
    }
  }

  findAll(wheres, selects?: string[], offset?:number, limit?:number){
    // const newDatas = datas.map((item)=>{
    //   const rtn = {}
    //   for (let index = 0; index < this.selects.length; index++) {
    //     const element = this.selects[index];
    //     rtn[element] = item[element]
    //   }
    //   return rtn
    // })
    return []
  }
  update(body, wheres?: any){

  }
  del(wheres){

  }
}
