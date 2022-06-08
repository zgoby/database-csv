import { Database } from './database';

export class Queryer {
  DB: Database;
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
    try {
      const table = this.DB.get(tableName);
      if (!table) {
        throw new Error(`TABLE ${tableName} is not exist`);
      }
      let rtn;
      switch (this.actionType) {
        case 'C':
          table.add(this.body);
          rtn = 1;
          break;
        case 'U':
          table.update(this.body, this.wheres);
          rtn = 1;
          break;
        case 'R':
          const datas = table.findAll(this.wheres, this.selects, this.offsetAttr, this.limitAttr);
          rtn = datas;
          break;
        case 'D':
          table.del(this.wheres);
          rtn = 1;
          break;
        default:
          throw new Error(
            'The actionType is not legal! you should use select, insert, update or del',
          );
      }
      return rtn;
    } catch (error) {
      throw error;
    } finally {
      this.unMount();
    }
  }
  unMount() {
    this.selects = undefined;
    this.body = undefined;
    this.offsetAttr = undefined;
    this.limitAttr = undefined;
    this.actionType = undefined;
    this.wheres = undefined;
  }
  select(...selects) {
    this.actionType = 'R';
    this.selects = selects;
    return this;
  }
  insert(params: { [name: string]: any }) {
    this.actionType = 'C';
    this.body = params;
    return this;
  }
  update(params) {
    this.actionType = 'U';
    this.body = params;
    return this;
  }
  offset(number) {
    this.offsetAttr = number;
    return this;
  }
  limit(number) {
    this.limitAttr = number;
    return this;
  }
  del() {
    this.actionType = 'D';
    return this;
  }
  where(parmas = {}) {
    this.wheres = parmas;
    return this;
  }
}
