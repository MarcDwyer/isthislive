const date = new Date();

date.setHours(date.getHours() + 24);

const newD = new Date();
console.log(date.getTime());
console.log(date.getTime() < newD.getTime());
export {};
