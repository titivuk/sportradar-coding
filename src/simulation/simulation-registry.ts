import { Simulation, SimulationEvent } from './simulatuion';

export class SimulationRegistry {
  static simulations: Map<string, Simulation> = new Map();

  // alias to use this
  private get simulations() {
    return SimulationRegistry.simulations;
  }

  registerSimulation(simulation: Simulation): Simulation {
    simulation.on(SimulationEvent.FINISHED, () =>
      this.removeSimulation(simulation.id),
    );

    // would be nice to have TTL feature to clear simulation that never started and finished
    this.simulations.set(simulation.id, simulation);

    return simulation;
  }

  getSimulation(id: string): Simulation | undefined {
    return this.simulations.get(id);
  }

  private removeSimulation(id: string) {
    this.simulations.delete(id);
  }
}
