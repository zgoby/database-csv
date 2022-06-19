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
  getQuery(wheres: { [name: string]: string }) {
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
    return {
      where,
      enums,
      month,
    };
  }
  andData(vals) {
    const map = new Map();
    let newVals = [];
    if (vals.length === 1) {
      newVals.push(...vals[0]);
    } else {
      for (let index = 0; index < vals.length; index++) {
        const array = vals[index];
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          const { index: recordIndex } = element;
          if (map.has(recordIndex)) {
            map.set(recordIndex, { ...element, __count: map.get(recordIndex).__count + 1 });
          } else {
            map.set(recordIndex, { ...element, __count: 1 });
          }
        }
      }
      for (const [_, v] of map) {
        if (v.__count === vals.length) {
          newVals.push(v);
        }
      }
    }
    return newVals;
  }
  findPrimaryAll(wheres: { [name: string]: string }): { index: number; value: number | string }[] {
    const query = this.getQuery(wheres);
    const { month, where, enums } = query;
    const vals = [];
    for (const [key, value] of Object.entries(month)) {
      const item = this.indexsDocker.get(key, 'MONTH');
      if (item) {
        const items = item.get(value);
        const set = new Set(items.map((item) => item.primary));
        const points = this.primarys.queryByMany(Array.from(set));
        vals.push(points);
      }
    }

    for (const [key, value] of Object.entries(enums)) {
      const item = this.indexsDocker.get(key, 'ENUM');
      if (item) {
        const items = item.get(value);
        const set = new Set(items.map((item) => item.primary));
        const points = this.primarys.queryByMany(Array.from(set));
        vals.push(points);
      }
    }
    for (const [key, value] of Object.entries(where)) {
      if (this.primarys.isPrimary(key)) {
        vals.push(this.primarys.queryByMany([value]));
      } else {
        const item = this.indexsDocker.get(key, '');
        if (item) {
          const items = item.get(value);
          const set = new Set(items.map((item) => item.primary));
          const points = this.primarys.queryByMany(Array.from(set));
          vals.push(points);
        } else {
          const titleIndex = this.titles.indexOf(key);
          if (titleIndex < 0) {
            vals.push([]);
          } else {
            const tem = [];
            const primaryIndex = this.titles.indexOf(this.primarys.key);
            for (let i = 0; i < this.values.length; i++) {
              const recordItem = this.values[i];
              if (recordItem && recordItem[titleIndex] === value) {
                tem.push({ value: recordItem[primaryIndex], index: i });
              }
            }
            vals.push(tem);
          }
        }
      }
    }
    return this.andData(vals);
  }
  findValuesAll(primarys) {
    if (!primarys || !primarys.length) {
      return [];
    } else {
      const rtnArr = [];
      for (let i = 0; i < primarys.length; i++) {
        const { index } = primarys[i];
        const obj = {};
        for (let j = 0; j < this.titles.length; j++) {
          const title = this.titles[j];
          obj[title] = this.values[index][j];
        }
        rtnArr.push(obj);
      }
      return rtnArr;
    }
  }

  findAll(wheres: { [name: string]: string }, selects?: string[], offset?: number, limit?: number) {
    if (!wheres || !Object.values(wheres).length) return [];
    let primarys = this.findPrimaryAll(wheres);
    return this.findValuesAll(primarys);
  }
  update(body, wheres?: any) {
    const hasPrimary = !!body[this.primarys.key];
    // console.log(hasPrimary);
    const primarys = this.findPrimaryAll(wheres);
    const elements = this.findValuesAll(primarys);
    if (hasPrimary) {
      this.del(wheres);
      const el = elements.map((item) => ({ ...item, ...body }));
      for (let index = 0; index < el.length; index++) {
        const it = el[index];
        this.add(it);
      }
    } else {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        for (let j = 0; j < this.titles.length; j++) {
          const title = this.titles[j];
          if (body[title]) {
            this.values[primarys[i]['index']][j] = body[title];
          }
        }
        this.indexsDocker.deleteItem(element, element[this.primarys.key]);
        // console.log(this.indexsDocker.indexs[0].points['2'], element, element[this.primarys.key]);
        this.indexsDocker.addItem(element, element[this.primarys.key]);
      }
    }
  }
  del(wheres) {
    const primarys = this.findPrimaryAll(wheres);
    const vaules = this.findValuesAll(primarys);
    for (let i = 0; i < primarys.length; i++) {
      const primaryItem = primarys[i];
      const val = vaules[i];
      delete this.values[primaryItem['index']];
      this.primarys.delete(val);

      this.indexsDocker.deleteItem(val, val[this.primarys.key]);
    }
  }
  insert(body) {
    this.add(body);
  }
}
