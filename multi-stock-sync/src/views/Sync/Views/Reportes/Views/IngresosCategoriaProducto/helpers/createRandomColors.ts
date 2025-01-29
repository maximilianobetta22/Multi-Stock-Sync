
interface Params {
  amount: number;
}

export const createRandomColors = ({ amount }: Params) => {

  const colors : string[] = [];

  for(let i = 0 ; i < amount; i++){
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    
    colors.push(`rgb(${red}, ${green}, ${blue})`);
  }

  return colors;
};