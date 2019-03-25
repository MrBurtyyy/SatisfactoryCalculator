export interface RawMaterial {
  itemName: string;
  numberPerMinute: number;
}

export interface Machine {
  name: string;
  produces: Array<RawMaterial>;
}

export interface Item {
  itemName: string;
  producedBy: string;
  requires?: Array<RawMaterial>;
}
