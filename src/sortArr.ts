
export class SortArr {
  values = [];
  add(element) {
    if(this.values.length===0) {
      this.values.push(element)
    }else{
      const index = this.findInsertIndex(element);
      this.values.splice(index<0?0:index, 0, element)
    }
  }
  remove(element){
    const index = this.findIndex(element)
    if(index>=0) {
      this.values.splice(index, 1)
    }
  }
  query(element){
    const index = this.findIndex(element)
    if(index>=0) {
      return this.values[index]
    }else{
      return null
    }

  }
  findIndex(value, start=0, end=this.values.length-1){
    const toIndex = Math.ceil((end+start)/2);
    const compareRes = this.compare(value, this.values[toIndex].value);
    if(compareRes===0){
      return toIndex
    }else if(compareRes===-1) {
      if(!this.values[toIndex-1]) return -1
      if(value===this.values[toIndex-1]) {
        return toIndex-1
      }else{
        return this.findInsertIndex( start, toIndex-1)
      }
    }else{
      if(!this.values[toIndex+1]) return -1;
      if(value===this.values[toIndex+1]) {
        return toIndex+1
      }else{
        return this.findInsertIndex(value, toIndex+1, end)
      }
    }
  }
  findInsertIndex(element, start=0, end=this.values.length-1){
    const toIndex = Math.ceil((end+start)/2);
    const compareRes = this.compare(element.value, this.values[toIndex].value);
    if(compareRes===-1 || compareRes===0) {
      if(!this.values[toIndex-1] || this.compare(element.value, this.values[toIndex-1].value)===1) {
        return toIndex-1
      }else{
        return this.findInsertIndex(element, start, toIndex-1)
      }
    }else{
      if(!this.values[toIndex+1] || this.compare(element.value, this.values[toIndex+1].value)!==1) {
        return toIndex+1
      }else{
        return this.findInsertIndex(element, toIndex+1, end)
      }
    }
  }
  compare(a, b) {
    if(a===b) return 0
    else if(a < b) return -1
    else return 1
  }
}
