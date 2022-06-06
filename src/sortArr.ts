export class SortArr {
  values = [];
  add(element) {
    if (this.values.length === 0) {
      this.values.push(element);
    } else {
      const index = this.findInsertIndex(element);
      this.values.splice(index < 0 ? 0 : index, 0, element);
    }
  }
  remove(element) {
    const index = this.findIndex(element);
    if (index >= 0) {
      this.values.splice(index, 1);
    }
  }
  query(element) {
    const index = this.findIndex(element);
    if (index >= 0) {
      return this.values[index];
    } else {
      return null;
    }
  }
  findIndex(value, start = 0, end = this.values.length) {
    const toIndex = Math.floor((end + start) / 2);
    if (this.values.length) {
      const compareRes = this.compare(value, this.values[toIndex].value);
      if (compareRes === 0) {
        return toIndex;
      } else if (compareRes === -1) {
        if (!this.values[toIndex - 1]) return -1;
        if (value === this.values[toIndex - 1]) {
          return toIndex - 1;
        } else {
          return this.findIndex(value, start, toIndex - 1);
        }
      } else {
        if (!this.values[toIndex + 1]) return -1;
        if (value === this.values[toIndex + 1]) {
          return toIndex + 1;
        } else {
          return this.findIndex(value, toIndex + 1, end);
        }
      }
    } else return -1;
  }
  findInsertIndex(element, start = 0, end = this.values.length) {
    const toIndex = Math.floor((end + start) / 2);
    const compareRes = this.compare(element.value, this.values[toIndex].value);
    if (compareRes === -1 || compareRes === 0) {
      if (
        !this.values[toIndex - 1] ||
        this.compare(element.value, this.values[toIndex - 1].value) === 1
      ) {
        return toIndex;
      } else {
        return this.findInsertIndex(element, start, toIndex - 1);
      }
    } else {
      if (
        !this.values[toIndex + 1] ||
        this.compare(element.value, this.values[toIndex + 1].value) !== 1
      ) {
        return toIndex + 1;
      } else {
        return this.findInsertIndex(element, toIndex + 1, end);
      }
    }
  }
  findAll(value) {
    const arr = [];
    const index = this.findIndex(value);
    let minusIndex = index,
      plusIndex = index;
    arr.push(this.values[index]);
    while (minusIndex > 0) {
      minusIndex--;
      if (this.values[minusIndex].value === value) {
        arr.unshift(this.values[minusIndex]);
      } else {
        break;
      }
    }
    while (plusIndex < this.values.length - 1) {
      plusIndex++;
      if (this.values[plusIndex].value === value) {
        arr.push(this.values[plusIndex]);
      } else {
        break;
      }
    }
    return arr;
  }
  compare(a, b) {
    if (a === b) return 0;
    else if (a < b) return -1;
    else return 1;
  }
}
