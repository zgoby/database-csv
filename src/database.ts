import { Table } from './table';

interface IIndexs {
  key: string;
  type?: 'MONTH' | '';
}

export class Database {
  docker: {
    [propsname: string]: Table;
  } = {};
  new(tableName: string, titles: string[], primary: string, indexs?: IIndexs[]) {
    try {
      const table = new Table(tableName, titles, primary, indexs);
      this.docker[tableName] = table;
    } catch (error) {
      throw error;
    }
  }
  initData(tableName, arr) {
    try {
      this.get(tableName).initData(arr);
    } catch (error) {
      throw error;
    }
  }
  get(tableName) {
    return this.docker[tableName];
  }
}

export const DB = new Database();
