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
  isAutoPrimary = false;
  autoPrimary = 0;

  constructor(tableName, titles, primary, indexs) {
    if (titles.indexOf(primary) < 0) {
      titles.unshift(primary);
      this.isAutoPrimary = true;
    }
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
    const newValues = array.map((item, index) => {
      if (this.isAutoPrimary) {
        return [index, ...item];
      }
      return item;
    });

    if (!this.init) {
      this.values = newValues;
      this.primarys.initData(this.values);
      this.indexsDocker?.initData(this.values, {
        titles: this.titles,
        primaryKey: this.primarys.key,
      });
      this.init = true;
      if (this.isAutoPrimary) this.autoPrimary = newValues.length - 1;
    }
    return this;
  }

  add(element) {
    const primaryObj = this.isAutoPrimary ? { [this.primarys.key]: ++this.autoPrimary } : null;
    const newEleObj = { ...element, ...primaryObj };
    const newEle = [];
    for (let index = 0; index < this.titles.length; index++) {
      const item = this.titles[index];
      newEle.push(newEleObj[item]);
    }

    if (this.emptys.length) {
      this.values[this.emptys[0]] = newEle;
      this.primarys.add({ value: newEleObj[this.primarys.key], index: this.emptys[0] });
    } else {
      this.values.push(newEle);
      this.primarys.add({ value: newEleObj[this.primarys.key], index: this.values.length - 1 });
    }
    this.indexsDocker.addItem(newEleObj, newEleObj[this.primarys.key]);
  }
  findIndexAll(wheres: { [name: string]: string }) {
    // wheres
    const enums = {},
      where = {},
      month = {};
    let isWhere = false;
    for (const [key, value] of Object.entries(wheres)) {
      isWhere = true;
      const val = /\$(MONTH|ENUM)_([0-9a-zA-Z]+)/.exec(value);
      if (val) {
        const newVal = val[2];
        const enumType = val[1];
        enumType === 'ENUM' ? (enums[key] = newVal) : (month[key] = newVal);
      } else {
        where[key] = value;
      }
    }
    if (!isWhere) {
      return Object.keys(this.values);
    }
    const vals = [];
    for (const [key, value] of Object.entries(month)) {
      const item = this.indexsDocker.get(key);
      if (item) {
        const items = item.get(value);
        const set = new Set(items.map((item) => item.primary));
        const points = this.primarys.queryByMany(Array.from(set)).map((item) => item.index);
        vals.push(points);
      }
    }
    for (const [key, value] of Object.entries(enums)) {
      const item = this.indexsDocker.get(key);
      if (item) {
        const items = item.get(value);
        const set = new Set(items.map((item) => item.primary));
        const points = this.primarys.queryByMany(Array.from(set)).map((item) => item.index);
        vals.push(points);
      }
    }
    for (const [key, value] of Object.entries(where)) {
      if (this.primarys.isPrimary(key)) {
        vals.push(this.primarys.queryByMany([value]).map((item) => item.index));
      } else {
        const item = this.indexsDocker.get(key);
        if (item) {
          const items = item.get(value);
          const set = new Set(items.map((item) => item.primary));
          const points = this.primarys.queryByMany(Array.from(set)).map((item) => item.index);
          vals.push(points);
        } else {
          const index = this.titles.indexOf(key);
          if (index < 0) {
            vals.push([]);
          } else {
            const tem = [];
            for (let i = 0; i < this.values.length; i++) {
              const item = this.values[i];
              if (item && item[index] === value) {
                tem.push(i);
              }
            }
            vals.push(tem);
          }
        }
      }
    }

    const map = new Map();
    let newVals = [];
    if (vals.length === 1) {
      newVals.push(...vals[0]);
    } else {
      for (let index = 0; index < vals.length; index++) {
        const array = vals[index];
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          if (map.has(element)) {
            map.set(element, map.get(element) + 1);
          } else {
            map.set(element, 1);
          }
        }
      }
      for (const [k, v] of map) {
        if (v === vals.length) {
          newVals.push(k);
        }
      }
    }
    return newVals;
  }
  findValuesAll(newVals) {
    if (!newVals.length) {
      return [];
    } else {
      const rtnArr = [];
      for (let index = 0; index < newVals.length; index++) {
        const element = newVals[index];
        const obj = {};
        for (let i = 0; i < this.titles.length; i++) {
          const title = this.titles[i];
          obj[title] = this.values[element][i];
        }
        rtnArr.push(obj);
      }
      return rtnArr;
    }
  }

  findAll(wheres: { [name: string]: string }, selects?: string[], offset?: number, limit?: number) {
    let newVals = this.findIndexAll(wheres);
    return this.findValuesAll(newVals);
  }
  update(body, wheres?: any) {
    const hasPrimary = !!body[this.primarys.key];
    // console.log(hasPrimary);
    const indexs = this.findIndexAll(wheres);
    const elements = this.findValuesAll(indexs);
    if (hasPrimary) {
      this.del(wheres);
      const el = elements.map((item) => ({ ...item, ...body }));
      for (let index = 0; index < el.length; index++) {
        const it = el[index];
        this.add(it);
      }
    } else {
      for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        for (let j = 0; j < this.titles.length; j++) {
          const title = this.titles[j];
          if (body[title]) {
            this.values[indexs[index]][j] = body[title];
          }
          // console.log(this.values[indexs[index]][j]);
        }

        this.indexsDocker.deleteItem(element, element[this.primarys.key]);
        // console.log(this.indexsDocker.indexs[0].points['2'], element, element[this.primarys.key]);
        this.indexsDocker.addItem(element, element[this.primarys.key]);
      }
    }
  }
  del(wheres) {
    const indexs = this.findIndexAll(wheres);
    const vaules = this.findValuesAll(indexs);
    for (let index = 0; index < indexs.length; index++) {
      const element = indexs[index];
      const val = vaules[index];
      delete this.values[element];
      this.primarys.delete(val);
      this.indexsDocker.deleteItem(val, val[this.primarys.key]);
    }
  }
  insert(body) {
    this.add(body);
  }
}
