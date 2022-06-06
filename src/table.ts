import { Primary } from './primary';
import { IndexsDocker, Indexs } from './indexs';

export class Table {
  tableName: string;
  primarys: Primary;
  indexsDocker: IndexsDocker;
  titles = [];
  values = [];
  emptys = [];
  init = false;

  constructor(tableName, titles, primary, indexs) {
    this.tableName = tableName;
    this.setTitles(titles);
    this.setPrimary(primary);
    if (indexs) {
      this.indexsDocker = new IndexsDocker();
      this.setIndexs(indexs);
    }
  }

  // 设置表头
  setTitles(titles: string[]) {
    this.titles = titles;
  }
  // 设置主键
  setPrimary(primary) {
    const primaryIndex = this.titles.indexOf(primary);
    if (primaryIndex < 0) {
      throw new Error(`primary key not exist: ${primary.key}`);
    } else {
      this.primarys = new Primary(primary, primaryIndex);
    }
  }
  // 设置index
  setIndexs(indexs) {
    for (let i = 0; i < indexs.length; i++) {
      const element = indexs[i];
      const primaryIndex = this.titles.indexOf(element.key);
      if (primaryIndex < 0) {
        throw new Error(`primary key not exist: ${element.key}`);
      } else {
        this.indexsDocker.add(new Indexs(element));
      }
    }
  }
  // 设置索引
  initData(array) {
    if (!this.init) {
      this.addMany(array);
      this.init = true;
    }
    return this;
  }

  addMany(array) {
    this.values = [...array];
    this.primarys.initData(this.values);
    this.indexsDocker?.initData(this.values, {
      titles: this.titles,
      primaryKey: this.primarys.key,
    });
  }
  add(element) {
    const newElement = [];
    for (let index = 0; index < this.titles.length; index++) {
      const item = this.titles[index];
      newElement.push(element[item]);
    }

    if (this.emptys.length) {
      this.values[this.emptys[0]] = newElement;
      this.primarys.add({ value: element[this.primarys.key], index: this.emptys[0] });
    } else {
      this.values.push(newElement);
      this.primarys.add({ value: element[this.primarys.key], index: this.values.length - 1 });
    }
  }

  findAll(wheres: { [name: string]: string }, selects?: string[], offset?: number, limit?: number) {
    // wheres
    const enums = {},
      where = {},
      month = {};
    for (const [key, value] of Object.entries(wheres)) {
      const val = /\$(MONTH|ENUM)_([0-9a-zA-Z]+)/.exec(value);
      if (val) {
        const newVal = val[2];
        const enumType = val[1];
        enumType === 'ENUM' ? (enums[key] = newVal) : (month[key] = newVal);
      } else {
        where[key] = value;
      }
    }
    const vals = [],
      map = new Map();
    for (const [key, value] of Object.entries(month)) {
      const item = this.indexsDocker.get(key);
      if (item) {
        vals.push(item.get(value));
      }
    }
    for (const [key, value] of Object.entries(enums)) {
      const item = this.indexsDocker.get(key);
      if (item) {
        vals.push(item.get(value));
      }
    }
    for (const [key, value] of Object.entries(where)) {
      if (this.primarys.isPrimary(key)) {
        vals.push(this.primarys.query(value));
      } else {
        const item = this.indexsDocker.get(key);
        if (item) {
          vals.push(item.get(value));
        } else {
          vals.push(this.values.filter((item) => item[key] === value));
        }
      }
    }
    let newVals;
    if (vals.length <= 1) {
      newVals = vals[0];
    } else {
    }

    if (!newVals.values.length) {
      return [];
    } else {
      const rtnArr = [];
      if (!!newVals.values[0].primary) {
        const set = new Set();
        for (let index = 0; index < newVals.values.length; index++) {
          const element = newVals.values[index];
          set.add(element.primary);
        }
        const primarys = this.primarys.queryByMany(Array.from(set)).map((item) => item.index);
        for (let index = 0; index < primarys.length; index++) {
          const element = primarys[index];
          const obj = {};
          for (let index = 0; index < this.titles.length; index++) {
            const title = this.titles[index];
            obj[title] = this.values[element][index];
          }
          rtnArr.push(obj);
        }
        return rtnArr;
      } else {
        const primarys = newVals.values.map((item) => item.index);
        for (let index = 0; index < primarys.length; index++) {
          const element = primarys[index];
          const obj = {};
          for (let index = 0; index < this.titles.length; index++) {
            const title = this.titles[index];
            obj[title] = this.values[element][index];
          }
          rtnArr.push(obj);
        }
        return rtnArr;
      }
    }
  }
  update(body, wheres?: any) {}
  del(wheres) {}
}
