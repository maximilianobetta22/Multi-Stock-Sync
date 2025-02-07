
interface Params {
  quantity: number;
}

export const createRandomColors = ({ quantity }: Params) => {

  const colors : string[] = [];

  for(let i = 0 ; i < quantity; i++){
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    
    colors.push(`rgb(${red}, ${green}, ${blue})`);
  }

  return colors;
};