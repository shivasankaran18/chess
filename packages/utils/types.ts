export type move = {
   from: string;
   to: string;
};

export type session = {
   id: number;
   name: string;
   email: string;
   image: string;
};


export type Moves={
   player:string,
   san: string,
   timestamp:Date   
}[]


export type Message={
   text: string;
   name: string;
   timestamp: Date
}

