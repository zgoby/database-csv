import { Table } from "./table";

class Queryer {
  getTable: (tableName: string) => Table
  selects;
  body;
  offsetAttr;
  limitAttr;
  actionType: 'C' | 'U' | 'R' | 'D';
  wheres;
  constructor(getTable) {
    this.getTable = getTable;
  }
  // select id, title from name where MONTH <> 2 limit 10 offset 10
  excute(tableName) {
    const table = this.getTable(tableName);
    const titles = table.titles;
    if(!table){
      throw new Error(`TABLE ${tableName} is not exist`)
    }
    let newBody=[]
    switch(this.actionType) {
      case 'C':
        newBody.length=0
        for (let index = 0; index < titles.length; index++) {
          const element = titles[index];
          newBody[index] = this.body[element];
        }
        table.add(newBody);
        return 1;
      case 'U':
        newBody.length=0
        for (let index = 0; index < titles.length; index++) {
          const element = titles[index];
          newBody[index] = this.body[element];
        }
        table.findAll(this.wheres)
        table.update(newBody, [])
        return 1;
      case 'R':
        const datas = table.findAll(this.wheres, this.offset, this.limit)
        datas.map((item)=>{
          const rtn = {}
          for (let index = 0; index < this.selects.length; index++) {
            const element = this.selects[index];
            rtn[element] = item[element]
          }
          return rtn
        })
        return [];
      case 'D':
        table.findAll(this.wheres)
        table.del([])
        return 1;
      default:
        throw new Error("");
    }
  }
  select(...selects){
    this.selects = selects
    return this
  }
  insert(params){
    this.body = params
    return this
  }
  update(params){
    this.body = params
    return this
  }
  offset(number){
    this.offsetAttr = number
    return this
  }
  limit(number){
    this.limitAttr = number
    return this
  }
  del(){
    this.actionType = 'D'
    return this
  }
  where(parmas){
    this.wheres = parmas
    return this
  }
}