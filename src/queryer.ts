import { Database } from "./database";

export class Queryer {
  DB: Database
  selects;
  body;
  offsetAttr: number;
  limitAttr: number;
  actionType: 'C' | 'U' | 'R' | 'D';
  wheres;
  constructor(DB) {
    this.DB = DB;
  }
  // select id, title from name where MONTH <> 2 limit 10 offset 10
  excute(tableName) {
    const table = this.DB.get(tableName);
    const titles = table.titles;
    if(!table){
      throw new Error(`TABLE ${tableName} is not exist`)
    }
    switch(this.actionType) {
      case 'C':
        table.add(this.body);
        return 1;
      case 'U':
        table.update(this.body, this.wheres)
        return 1;
      case 'R':
        const datas = table.findAll(this.wheres, this.selects, this.offsetAttr, this.limitAttr)
        return datas;
      case 'D':
        table.del(this.wheres)
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