import { Table } from "./table";


interface IIndexs {
  key: string,
  type?: 'MONTH' | '',
}

class Database {
  docker: {
    [propsname:string]: Table
  } = {}
  new(tableName: string, titles: string[], primary: string, indexs?: IIndexs[]){
    const table = new Table(tableName, titles, primary, indexs);
    this.docker[tableName] = table
    return this
  }
  get(tableName){
    return this.docker[tableName]
  }
}

export const DB = new Database()