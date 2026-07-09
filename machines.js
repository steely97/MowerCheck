// Machine storage

const DEFAULT_MACHINES = [
  "Ransomes MP653XC"
];

function getMachines() {
  const saved = localStorage.getItem("machines");

  if (!saved) {
    localStorage.setItem(
      "machines",
      JSON.stringify(DEFAULT_MACHINES)
    );

    return DEFAULT_MACHINES;
  }

  return JSON.parse(saved);
}

function saveMachines(machines) {
  localStorage.setItem(
    "machines",
    JSON.stringify(machines)
  );
}

function addMachine(name) {

  const machines = getMachines();

  if (machines.includes(name)) {
    return false;
  }

  machines.push(name);

  saveMachines(machines);

  return true;
}

function deleteMachine(index) {

  const machines = getMachines();

  machines.splice(index,1);

  saveMachines(machines);

}