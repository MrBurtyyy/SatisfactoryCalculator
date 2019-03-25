import * as fs from "fs";
import * as _ from "lodash";

import { Item, Machine, RawMaterial } from "./interfaces";

let data: string = fs.readFileSync("./data/items.json").toString();
let json = JSON.parse(data);

const machines: Array<Machine> = json["machines"];
const items: Array<Item> = json["items"];

const getProducingMachine = (item: Item): Machine | undefined => {
  return machines.find(machine => {
    let matchingItem = machine.produces.find((production: RawMaterial) => {
      return production.itemName === item.itemName;
    });
    return !_.isNil(matchingItem);
  });
};

const getItemsRequired = (item: Item) => {
  let { requires } = item;
  let itemsRequired;

  // Get the machine that makes the item first
  let producingMachine: Machine = getProducingMachine(item);
  if (_.isNil(producingMachine)) {
    return;
  }

  console.log(
    "DEBUG: Item '%s' requires '%s'",
    item.itemName,
    producingMachine.name
  );

  // Now we know which machine produces the item, we can
  // calculate how many machines we will need to produce the number we want
};

const getNumberOfMachinesNeeded = (
  machine: Machine,
  itemToCraft: Item,
  numberPerMinute: number
) => {
  let machineProductionPerMinute = machine.produces.find(item => {
    return item.itemName === itemToCraft.itemName;
  }).numberPerMinute;
  return Math.ceil(numberPerMinute / machineProductionPerMinute);
};

const calculateTotals = (itemName: string, numberPerMinute: number) => {
  let itemToGet: Item = items.find(item => {
    return item["itemName"] === itemName;
  });

  if (_.isNil(itemToGet)) {
    console.log("ERROR: Cannot find item '%s' in database", itemName);
    return;
  }

  // Get the machine that makes the item first
  let producingMachine: Machine = getProducingMachine(itemToGet);
  if (_.isNil(producingMachine)) {
    console.log(
      "WARN: Item '%s' does not have a matching machine",
      itemToGet.itemName
    );
    return;
  }

  let numberOfMachinesRequired = getNumberOfMachinesNeeded(
    producingMachine,
    itemToGet,
    numberPerMinute
  );

  console.log(
    "DEBUG: %d/m of '%s' requires %d of '%s'",
    numberPerMinute,
    itemToGet.itemName,
    numberOfMachinesRequired,
    producingMachine.name
  );

  let itemToCraft = {
    itemName: itemToGet.itemName,
    machineName: producingMachine.name,
    numberOfMachines: numberOfMachinesRequired,
    productionPerMinute: numberPerMinute,
    rawMaterialsRequired: []
  };

  // Now we know how many machines we need to make the initial item,
  // let's calculate the requirements.
  let { requires } = itemToGet;
  if (requires) {
    requires.forEach(requiredItem => {
      let { itemName, numberPerMinute } = requiredItem;
      itemToCraft.rawMaterialsRequired = [
        ...itemToCraft.rawMaterialsRequired,
        calculateTotals(itemName, numberPerMinute * numberOfMachinesRequired)
      ];
    });
  }

  return itemToCraft;
};

let values = calculateTotals("Copper Plate", 60);
fs.writeFileSync("./output.json", JSON.stringify(values));
